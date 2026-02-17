import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { AuthService } from './../src/auth/auth.service';
import { Role } from './../prisma/generated/prisma/client';

describe('AuthController & Authenticated Decorator (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    authService = app.get<AuthService>(AuthService);
    await app.init();
  });

  afterAll(async () => {
    await prisma.user.deleteMany();
    await app.close();
  });

  describe('GET /auth/profile', () => {
    it('should return 401 if not authenticated', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should return user profile if authenticated', async () => {
      // 1. Create User
      const user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: `testuser_${Date.now()}@test.com`,
          password: 'password',
          role: Role.STUDENT,
        },
      });

      // 2. Generate Token
      const loginResult = await authService.login(user);
      const token = loginResult.access_token;

      // 3. Call Protected Route
      const response = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.objectContaining({
          id: user.id,
          email: user.email,
          role: 'STUDENT',
        }),
      );
    });
  });

  describe('GET /auth/admin (Role Guard)', () => {
    it('should return 403 if user is STUDENT', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Student User',
          email: `student_${Date.now()}@test.com`,
          password: 'password',
          role: Role.STUDENT,
        },
      });
      const login = await authService.login(user);

      await request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${login.access_token}`)
        .expect(403);
    });

    it('should return 200 if user is TEACHER', async () => {
      const user = await prisma.user.create({
        data: {
          name: 'Teacher User',
          email: `teacher_${Date.now()}@test.com`,
          password: 'password',
          role: Role.TEACHER,
        },
      });
      const login = await authService.login(user);

      await request(app.getHttpServer())
        .get('/auth/admin')
        .set('Authorization', `Bearer ${login.access_token}`)
        .expect(200);
    });
  });
});
