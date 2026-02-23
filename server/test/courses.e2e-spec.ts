import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { Role } from './../prisma/generated/prisma/client';
import { AuthService } from './../src/auth/auth.service';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './../src/filters/prisma-exception.filter';
import { cleanupDatabase } from './cleanup';

describe('CoursesController (e2e) - Create Course', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let authService: AuthService;
  let teacherToken: string;

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

  it('/courses (POST) - should create a course when user is a teacher', async () => {
    // 1. Register Teacher (properly hashes password)
    const teacherResult = await authService.register({
      name: 'Creation Teacher',
      email: `teacher_creation_${Date.now()}@computacao.ufcg.edu.br`,
      password: 'password',
      role: Role.TEACHER,
    });
    const teacher = teacherResult.user;
    teacherToken = teacherResult.access_token;

    const createCourseDto = {
      name: 'E2E Test Course',
      description: 'Course created from e2e test',
      teacherId: teacher.id,
      schedules: [
        { dayOfWeek: 1, startTime: '10:00', endTime: '12:00' }
      ]
    };

    // 2. Request creation acting as the teacher
    const response = await request(app.getHttpServer() as any)
      .post('/courses')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send(createCourseDto)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe(createCourseDto.name);
    expect(response.body.teacherId).toBe(teacher.id);
    expect(response.body.schedules).toBeDefined();
    expect(response.body.schedules.length).toBe(1);

    // 3. Verify in DB
    const courseInDb = await prisma.course.findUnique({
      where: { id: response.body.id },
      include: { schedules: true }
    });

    expect(courseInDb).not.toBeNull();
    expect(courseInDb?.name).toBe(createCourseDto.name);
    expect(courseInDb?.schedules.length).toBe(1);
    expect(courseInDb?.schedules[0].dayOfWeek).toBe(1);
  });

  it('/courses (POST) - should return 400 for invalid data', async () => {
    const teacherResult = await authService.register({
      name: 'Invalid Data Teacher',
      email: `teacher_invalid_${Date.now()}@computacao.ufcg.edu.br`,
      password: 'password',
      role: Role.TEACHER,
    });
    const teacher = teacherResult.user;
    const token = teacherResult.access_token;

    // Missing required field 'name'
    const invalidDto = {
      description: 'Missing name',
      teacherId: teacher.id,
    };

    await request(app.getHttpServer() as any)
      .post('/courses')
      .set('Authorization', `Bearer ${token}`)
      .send(invalidDto)
      .expect(400); // Bad Request from class-validator
  });
});
