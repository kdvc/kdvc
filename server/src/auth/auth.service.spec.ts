import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../services/users.service';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Role } from '../../prisma/generated/prisma/client';

// Mock dependencies
const mockUsersService = {
  findByEmail: jest.fn(),
  createFromGoogle: jest.fn(),
  create: jest.fn(),
  findOne: jest.fn(),
};

// Mock guards/auth.guard
jest.mock('./guards/auth.guard', () => ({
  verifyGoogleToken: jest.fn(),
}));
import { verifyGoogleToken } from './guards/auth.guard';

// Mock external libs
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: typeof mockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);

    process.env.JWT_SECRET_KEY = 'test-secret';
    process.env.GOOGLE_CLIENT_ID = 'id';
    process.env.GOOGLE_CLIENT_SECRET = 'secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateGoogleUser', () => {
    it('should return existing user', async () => {
      const user = { id: 'u1', email: 'e@g.com' };
      usersService.findByEmail.mockResolvedValue(user);
      const result = await service.validateGoogleUser({
        email: 'e@g.com',
        name: 'N',
      });
      expect(result).toEqual({ user, created: false });
    });

    it('should create new user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      const user = { id: 'u1', email: 'e@g.com' };
      usersService.createFromGoogle.mockResolvedValue(user);
      const result = await service.validateGoogleUser({
        email: 'e@g.com',
        name: 'N',
      });
      expect(result).toEqual({ user, created: true });
    });
  });

  describe('authenticateWithGoogle', () => {
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should exchange code for tokens and return user', async () => {
      const mockTokenResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          id_token: 'id-token',
          refresh_token: 'refresh-token',
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockTokenResponse);

      const payload = { email: 'e@g.com', email_verified: true, name: 'N' };
      (verifyGoogleToken as jest.Mock).mockResolvedValue(payload);

      const user = { id: 'u1', email: 'e@g.com' };
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.authenticateWithGoogle('code');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('oauth2.googleapis.com/token'),
        expect.any(Object),
      );
      expect(result).toEqual({
        user: { user, created: false },
        id_token: 'id-token',
        refresh_token: 'refresh-token',
      });
    });

    it('should throw Unauthorized if token exchange fails', async () => {
      const mockTokenResponse = {
        ok: false,
        text: jest.fn().mockResolvedValue('error'),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockTokenResponse);

      await expect(service.authenticateWithGoogle('code')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if no id_token', async () => {
      const mockTokenResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockTokenResponse);

      await expect(service.authenticateWithGoogle('code')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('loginWithGoogleIdToken', () => {
    it('should return tokens', async () => {
      const payload = { email: 'e@g.com', email_verified: true, name: 'N' };
      (verifyGoogleToken as jest.Mock).mockResolvedValue(payload);

      const user = { id: 'u1', email: 'e@g.com', role: Role.STUDENT };
      usersService.findByEmail.mockResolvedValue(user);

      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await service.loginWithGoogleIdToken('id-token');
      expect(result.access_token).toBe('token');
      expect(result.refresh_token).toBe('token');
      expect(result.user).toBeDefined();
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      (verifyGoogleToken as jest.Mock).mockResolvedValue({
        email_verified: false,
      });
      await expect(service.loginWithGoogleIdToken('t')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('login', () => {
    it('should return token if valid', async () => {
      const user = {
        id: 'u1',
        email: 'test@test.com',
        password: 'hashed',
        role: Role.STUDENT,
      };
      usersService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await service.login('test@test.com', 'pass');
      expect(result.access_token).toBe('token');
    });

    it('should throw Unauthorized if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      await expect(service.login('e', 'p')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw Unauthorized if password invalid', async () => {
      usersService.findByEmail.mockResolvedValue({ password: 'h' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('e', 'p')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('register', () => {
    it('should register user', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed');
      const user = { id: 'u1', email: 'e', role: Role.STUDENT };
      usersService.create.mockResolvedValue(user);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      const result = await service.register({
        name: 'n',
        email: 'e',
        password: 'p',
        role: Role.STUDENT,
      });
      expect(result.access_token).toBe('token');
    });

    it('should throw Conflict if email exists', async () => {
      usersService.findByEmail.mockResolvedValue({});
      await expect(
        service.register({
          name: 'n',
          email: 'e',
          password: 'p',
          role: Role.STUDENT,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('refreshAccessToken', () => {
    it('should return new access token', async () => {
      (jwt.verify as jest.Mock).mockReturnValue({ sub: 'u1', type: 'refresh' });
      usersService.findOne.mockResolvedValue({ id: 'u1' });
      (jwt.sign as jest.Mock).mockReturnValue('new-token');

      const result = await service.refreshAccessToken('refresh-token');
      expect(result.access_token).toBe('new-token');
    });

    it('should throw Unauthorized if verify fails', async () => {
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error();
      });
      await expect(service.refreshAccessToken('t')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
