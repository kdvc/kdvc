import { AuthGuard } from './auth.guard';
import { UsersService } from '../../services/users.service';
import { Reflector } from '@nestjs/core';
import {
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Role } from '../../../prisma/generated/prisma/client';

// Mock dependencies
const mockUsersService = {
  findByEmail: jest.fn(),
};

const mockReflector = {
  getAllAndOverride: jest.fn(),
};

// Mock jwt
jest.mock('jsonwebtoken');

// Mock jwks-rsa
jest.mock('jwks-rsa', () => {
  return jest.fn().mockImplementation(() => ({
    getSigningKey: jest.fn((kid, cb) =>
      cb(null, { getPublicKey: () => 'public-key' }),
    ),
  }));
});

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let usersService: typeof mockUsersService;
  let reflector: typeof mockReflector;

  beforeEach(() => {
    guard = new AuthGuard(
      mockReflector as unknown as Reflector,
      mockUsersService as unknown as UsersService,
    );
    usersService = mockUsersService;
    reflector = mockReflector;
    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'google-id';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockContext = (headers: any = {}, cookies: any = {}) => {
    const getRequest = jest.fn().mockReturnValue({
      headers,
      cookies,
    });
    const switchToHttp = jest.fn().mockReturnValue({
      getRequest,
    });
    return {
      switchToHttp,
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should throw Unauthorized if no token', async () => {
      const context = createMockContext();
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if invalid token format', async () => {
      const context = createMockContext({ authorization: 'Bearer invalid' });
      (jwt.decode as jest.Mock).mockReturnValue(null);
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should verify Local token and return true', async () => {
      const token = 'local-token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      (jwt.decode as jest.Mock).mockReturnValue({ payload: { iss: 'kdvc' } });
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 'u1',
        email: 'e@e.com',
        role: Role.STUDENT,
      });

      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        role: Role.STUDENT,
      });
      reflector.getAllAndOverride.mockReturnValue(undefined); // No role required

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should verify Google token and return true', async () => {
      const token = 'google-token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      // First decode
      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'kid' },
        payload: { iss: 'https://accounts.google.com' },
      });

      // Verify inside verifyGoogleToken
      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'g@g.com',
        email_verified: true,
      });

      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        role: Role.STUDENT,
      });
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw Unauthorized if google email not verified', async () => {
      const token = 'google-token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      (jwt.decode as jest.Mock).mockReturnValue({
        header: { kid: 'kid' },
        payload: { iss: 'https://accounts.google.com' },
      });
      (jwt.verify as jest.Mock).mockReturnValue({
        email: 'g@g.com',
        email_verified: false,
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if unknown issuer', async () => {
      const token = 'token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      (jwt.decode as jest.Mock).mockReturnValue({
        payload: { iss: 'unknown' },
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if user not found', async () => {
      const token = 'local-token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      (jwt.decode as jest.Mock).mockReturnValue({ payload: { iss: 'kdvc' } });
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 'u1',
        email: 'e@e.com',
        role: Role.STUDENT,
      });

      usersService.findByEmail.mockResolvedValue(null);

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if local token verification fails', async () => {
      const token = 'local-token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      (jwt.decode as jest.Mock).mockReturnValue({ payload: { iss: 'kdvc' } });
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should extract token from cookie', async () => {
      const token = 'cookie-token';
      const context = createMockContext({}, { id_token: token });

      (jwt.decode as jest.Mock).mockReturnValue({ payload: { iss: 'kdvc' } });
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 'u1',
        email: 'e',
        role: Role.STUDENT,
      });

      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        role: Role.STUDENT,
      });
      reflector.getAllAndOverride.mockReturnValue(undefined);

      const result = await guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw Forbidden if role mismatch', async () => {
      const token = 'local-token';
      const context = createMockContext({ authorization: `Bearer ${token}` });

      (jwt.decode as jest.Mock).mockReturnValue({ payload: { iss: 'kdvc' } });
      (jwt.verify as jest.Mock).mockReturnValue({
        sub: 'u1',
        email: 'e@e.com',
        role: Role.STUDENT,
      });

      usersService.findByEmail.mockResolvedValue({
        id: 'u1',
        role: Role.STUDENT,
      });
      reflector.getAllAndOverride.mockReturnValue(Role.TEACHER); // Require TEACHER

      await expect(guard.canActivate(context)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
