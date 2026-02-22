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
  constructor(private readonly usersService: UsersService) { }

  async validateGoogleUser(details: { email: string; name: string }) {
    const user = await this.usersService.findByEmail(details.email);
    if (user) return { user, created: false };
    return {
      user: await this.usersService.createFromGoogle(details),
      created: true,
    };
  }

  /**
   * Verifies a Google id_token and finds/creates the corresponding user.
   * Shared by both the OAuth callback and the mobile login flow.
   */
  private async validateAndFindUserFromIdToken(idToken: string) {
    const payload = await verifyGoogleToken(idToken);

    if (!payload.email_verified) {
      throw new UnauthorizedException('Email not verified by Google');
    }

    const user = await this.validateGoogleUser({
      email: payload.email,
      name: payload.name ?? payload.email,
    });

    return user;
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

    // 2. Verify & find/create user (reuses shared logic)
    const user = await this.validateAndFindUserFromIdToken(tokens.id_token);

    return {
      user,
      id_token: tokens.id_token,
      refresh_token: tokens.refresh_token,
    };
  }

  /**
   * Mobile login: receives a Google id_token directly, validates it,
   * and returns internal access_token + refresh_token.
   */
  async loginWithGoogleIdToken(idToken: string) {
    const { user, created } =
      await this.validateAndFindUserFromIdToken(idToken);

    const access_token = this.signLocalToken(user);
    const refresh_token = this.signRefreshToken(user);

    return {
      user: { ...user, password: undefined },
      created,
      access_token,
      refresh_token,
    };
  }

  /**
   * Exchanges a valid refresh_token for a new access_token.
   */
  async refreshAccessToken(refreshToken: string) {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error('JWT_SECRET_KEY is not configured');
    }

    let payload: { sub: string; type: string };
    try {
      payload = jwt.verify(refreshToken, secret, {
        issuer: LOCAL_ISSUER,
      }) as { sub: string; type: string };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Token is not a refresh token');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const access_token = this.signLocalToken(user);
    return { access_token };
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

    const user = await this.usersService.create(data);

    const token = this.signLocalToken(user);
    return { user: { ...user, password: undefined }, access_token: token };
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid || !user.password) {
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

  private signRefreshToken(user: { id: string }) {
    const secret = process.env.JWT_SECRET_KEY;
    if (!secret) {
      throw new Error('JWT_SECRET_KEY is not configured');
    }

    return jwt.sign({ sub: user.id, type: 'refresh' }, secret, {
      issuer: LOCAL_ISSUER,
      expiresIn: '30d',
    });
  }
}
