import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../services/users.service';
import { UnauthorizedException } from '@nestjs/common';

const mockAuthService = {
  login: jest.fn(),
  authenticateWithGoogle: jest.fn(),
  loginWithGoogleIdToken: jest.fn(),
  refreshAccessToken: jest.fn(),
};

const mockUsersService = {};

describe('AuthController', () => {
  let controller: AuthController;
  let service: typeof mockAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should call service.login', async () => {
      const dto = { email: 'e', password: 'p' };
      await controller.login(dto);
      expect(service.login).toHaveBeenCalledWith('e', 'p');
    });
  });

  describe('googleCallback', () => {
    it('should set cookies and return user', async () => {
      const code = 'code';
      const result = {
        user: { id: '1', email: 'test@test.com' },
        id_token: 'id_token',
        refresh_token: 'refresh_token',
      };

      service.authenticateWithGoogle.mockResolvedValue(result);

      const cookieFn = jest.fn();
      const res = { cookie: cookieFn } as unknown as Response;

      await controller.googleCallback(code, res);

      expect(service.authenticateWithGoogle).toHaveBeenCalledWith(code);
      expect(cookieFn).toHaveBeenCalledWith(
        'id_token',
        'id_token',
        expect.any(Object),
      );
      expect(cookieFn).toHaveBeenCalledWith(
        'refresh_token',
        'refresh_token',
        expect.any(Object),
      );
    });

    it('should not set refresh_token cookie if not provided', async () => {
      const code = 'code';
      const result = {
        user: { id: '1', email: 'test@test.com' },
        id_token: 'id_token',
        // no refresh_token
      };

      service.authenticateWithGoogle.mockResolvedValue(result);

      const cookieFn = jest.fn();
      const res = { cookie: cookieFn } as unknown as Response;

      await controller.googleCallback(code, res);

      expect(service.authenticateWithGoogle).toHaveBeenCalledWith(code);
      expect(cookieFn).toHaveBeenCalledWith(
        'id_token',
        'id_token',
        expect.any(Object),
      );
      expect(cookieFn).not.toHaveBeenCalledWith(
        'refresh_token',
        expect.anything(),
        expect.anything(),
      );
    });

    it('should set secure cookie in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const result = {
        user: { id: '1', email: 'test@test.com' },
        id_token: 'id_token',
        refresh_token: 'refresh_token',
      };

      service.authenticateWithGoogle.mockResolvedValue(result);

      const cookieFn = jest.fn();
      const res = { cookie: cookieFn } as unknown as Response;

      await controller.googleCallback('code', res);

      expect(cookieFn).toHaveBeenCalledWith(
        'id_token',
        'id_token',
        expect.objectContaining({ secure: true }),
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('googleLogin', () => {
    it('should login with Authorization header', async () => {
      const req = { headers: { authorization: 'Bearer token' } };
      await controller.googleLogin(
        req as unknown as Request,
        {} as unknown as { idToken?: string },
      );
      expect(service.loginWithGoogleIdToken).toHaveBeenCalledWith('token');
    });

    it('should ignore Authorization header if not Bearer', async () => {
      const req = { headers: { authorization: 'Basic token' } };
      const body = { idToken: 'bodyToken' };
      await controller.googleLogin(
        req as unknown as Request,
        body as unknown as { idToken?: string },
      );
      expect(service.loginWithGoogleIdToken).toHaveBeenCalledWith('bodyToken');
    });

    it('should login with body idToken if header missing', async () => {
      const req = { headers: {} };
      const body = { idToken: 'token' };
      await controller.googleLogin(
        req as unknown as Request,
        body as unknown as { idToken?: string },
      );
      expect(service.loginWithGoogleIdToken).toHaveBeenCalledWith('token');
    });

    it('should throw UnauthorizedException if no valid token provided', async () => {
      const req = { headers: { authorization: 'Basic token' } };
      await expect(
        controller.googleLogin(
          req as unknown as Request,
          {} as unknown as { idToken?: string },
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should call refreshAccessToken', async () => {
      const body = { refresh_token: 'rf' };
      await controller.refresh(body);
      expect(service.refreshAccessToken).toHaveBeenCalledWith('rf');
    });
  });

  describe('getProfile', () => {
    it('should return req.user', () => {
      const req = { user: { id: 'u1' } };
      const result = controller.getProfile(req as unknown as Request);
      expect(result).toEqual({ id: 'u1' });
    });
  });
});
