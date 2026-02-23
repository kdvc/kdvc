import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Application } from 'express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { Role } from './../prisma/generated/prisma/client';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './../src/filters/prisma-exception.filter';
import { cleanupDatabase } from './cleanup';

describe('AuthController & Authenticated Decorator (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.useGlobalFilters(new PrismaExceptionFilter());

    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    await app.init();
    await cleanupDatabase(prisma);
  });

  afterAll(async () => {
    await cleanupDatabase(prisma);
    await app.close();
  });

  describe('GET /auth/me', () => {
    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer() as Application)
        .get('/auth/me')
        .expect(401);
    });

    it('should return user profile if authenticated', async () => {
      // 1. Register User (properly hashes password)
      const registerResult = await authService.register({
        name: 'Test User',
        email: `testuser_${Date.now()}@computacao.ufcg.edu.br`,
        password: 'password',
        role: Role.TEACHER,
      });
      const user = registerResult.user;

      // 2. Login
      const loginResult = await authService.login(user.email, 'password');
      const token = loginResult.access_token;

      // 3. Call Protected Route
      const response = await request(app.getHttpServer() as Application)
        .get('/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          role: Role.TEACHER,
        }),
      );
      expect(response.body).not.toHaveProperty('password');
    });
  });

});
