import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import jwksClient, { SigningKey } from 'jwks-rsa';
import { Role } from '../../../prisma/generated/prisma/client';
import { UsersService } from '../../services/users.service';

export const ROLES_KEY = 'roles';

const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_ISSUERS: [string, ...string[]] = [
  'https://accounts.google.com',
  'accounts.google.com',
];
const LOCAL_ISSUER = 'kdvc';

const client = jwksClient({
  jwksUri: GOOGLE_JWKS_URI,
  cache: true,
  cacheMaxAge: 600_000, // 10 minutes
});

function getSigningKey(kid: string): Promise<string> {
  return new Promise((resolve, reject) => {
    client.getSigningKey(kid, (err: Error | null, key?: SigningKey) => {
      if (err || !key) {
        return reject(err ?? new Error('Signing key not found'));
      }
      resolve(key.getPublicKey());
    });
  });
}

export interface GoogleTokenPayload extends jwt.JwtPayload {
  email: string;
  email_verified: boolean;
  name?: string;
}

interface LocalTokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export async function verifyGoogleToken(
  token: string,
): Promise<GoogleTokenPayload> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new UnauthorizedException('Invalid token format');
  }

  try {
    const publicKey = await getSigningKey(decoded.header.kid);
    return jwt.verify(token, publicKey, {
      algorithms: ['RS256'],
      issuer: GOOGLE_ISSUERS,
      audience: process.env.GOOGLE_CLIENT_ID,
    }) as unknown as GoogleTokenPayload;
  } catch {
    throw new UnauthorizedException('Token verification failed');
  }
}

function verifyLocalToken(token: string): LocalTokenPayload {
  const secret = process.env.JWT_SECRET_KEY;
  if (!secret) {
    throw new UnauthorizedException('JWT_SECRET_KEY is not configured');
  }

  try {
    return jwt.verify(token, secret, {
      issuer: LOCAL_ISSUER,
    }) as unknown as LocalTokenPayload;
  } catch {
    throw new UnauthorizedException('Token verification failed');
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // 1. Extract token: Authorization header takes priority, fallback to cookie
    const authHeader = request.headers.authorization;
    let token: string | undefined;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7);
    } else if (request.cookies?.id_token) {
      token = request.cookies.id_token as string;
    }

    if (!token) {
      throw new UnauthorizedException(
        'Missing token in Authorization header or cookies',
      );
    }

    // 2. Determine issuer and verify accordingly
    const unverified = jwt.decode(token, { complete: true });
    if (!unverified || typeof unverified === 'string') {
      throw new UnauthorizedException('Invalid token format');
    }

    const issuer = (unverified.payload as jwt.JwtPayload).iss;
    let email: string;

    if (GOOGLE_ISSUERS.includes(issuer ?? '')) {
      // Google token — verify with JWKS
      const payload = await verifyGoogleToken(token);
      if (!payload.email_verified) {
        throw new UnauthorizedException('Email not verified by Google');
      }
      email = payload.email;
    } else if (issuer === LOCAL_ISSUER) {
      // Local token — verify with secret key
      const payload = verifyLocalToken(token);
      email = payload.email;
    } else {
      throw new UnauthorizedException(`Unknown token issuer: ${issuer}`);
    }

    // 3. Find user in database by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 4. Check role if required
    const requiredRole = this.reflector.getAllAndOverride<Role>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRole && user.role !== requiredRole) {
      throw new ForbiddenException(
        `User does not have the required role: ${requiredRole}`,
      );
    }

    // 5. Attach user to request
    request.user = user;
    return true;
  }
}
