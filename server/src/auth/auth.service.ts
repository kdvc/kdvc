import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../services/users.service';
import { verifyGoogleToken } from './guards/auth.guard';
import { Role } from '../../prisma/generated/prisma/client';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const LOCAL_ISSUER = 'kdvc';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async validateGoogleUser(details: { email: string; name: string }) {
    const user = await this.usersService.findByEmail(details.email);
    if (user) return user;
    return this.usersService.createFromGoogle(details);
  }

  async authenticateWithGoogle(code: string) {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        redirect_uri:
          process.env.GOOGLE_REDIRECT_URI ??
          'http://localhost:8000/auth/google/callback',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      throw new UnauthorizedException(`Failed to exchange code: ${error}`);
    }

    const tokens = (await tokenResponse.json()) as {
      id_token?: string;
      refresh_token?: string;
    };
    if (!tokens.id_token) {
      throw new UnauthorizedException('No id_token in Google response');
    }

    // 2. Verify the ID token against Google's public keys
    const payload = await verifyGoogleToken(tokens.id_token);

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email not verified by Google');
    }

    // 3. Find or create user
    const user = await this.validateGoogleUser({
      email: payload.email,
      name: payload.name ?? payload.email,
    });

    return {
      user,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
    };
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) {
    const existing = await this.usersService.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.usersService.create({
      ...data,
      password: hashedPassword,
    });

    const token = this.signLocalToken(user);
    return { user: { ...user, password: undefined }, access_token: token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.signLocalToken(user);
    return { user: { ...user, password: undefined }, access_token: token };
  }

  private signLocalToken(user: { id: string; email: string; role: Role }) {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error('JWT_SECRET_KEY is not configured');
    }

    return jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      secret,
      { issuer: LOCAL_ISSUER, expiresIn: '7d' },
    );
  }
}
