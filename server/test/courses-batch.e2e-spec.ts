import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Application } from 'express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { Role } from './../prisma/generated/prisma/client';
import { AuthService } from './../src/auth/auth.service';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './../src/filters/prisma-exception.filter';
import { cleanupDatabase } from './cleanup';

describe('CoursesController (e2e) - Batch Add Students', () => {
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

  it('/courses/:id/students/batch (POST)', async () => {
    // 1. Register Teacher (properly hashes password)
    const teacherResult = await authService.register({
      name: 'Teacher One',
      email: `teacher_batch_${Date.now()}@computacao.ufcg.edu.br`,
      password: 'password',
      role: Role.TEACHER,
    });
    const teacher = teacherResult.user;
    const teacherToken = teacherResult.access_token;

    // 2. Create Course
    const course = await prisma.course.create({
      data: {
        name: 'Test Course',
        description: 'Test Description',
        teacherId: teacher.id,
      },
    });

    // 3. Create Students
    const student1 = await prisma.user.create({
      data: {
        name: 'Student One',
        email: `student1_batch_${Date.now()}@ccc.ufcg.edu.br`,
        password: 'password',
        role: Role.STUDENT,
      },
    });

    const student2 = await prisma.user.create({
      data: {
        name: 'Student Two',
        email: `student2_batch_${Date.now()}@ccc.ufcg.edu.br`,
        password: 'password',
        role: Role.STUDENT,
      },
    });

    // 4. Batch Add Students
    const response = await request(app.getHttpServer() as Application)
      .post(`/courses/${course.id}/students/batch`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        emails: [student1.email, student2.email],
      })
      .expect(201);

    expect(response.body).toEqual({
      message: '2 students added successfully',
      added: expect.arrayContaining([student1.email, student2.email]),
    });

    // 5. Verify Enrollments in DB
    const enrollments = await prisma.studentCourse.findMany({
      where: {
        courseId: course.id,
      },
    });

    expect(enrollments.length).toBe(2);
    const studentIds = enrollments.map((e) => e.studentId);
    expect(studentIds).toContain(student1.id);
    expect(studentIds).toContain(student2.id);

    // 6. Test Idempotency (adding same students again)
    const response2 = await request(app.getHttpServer() as Application)
      .post(`/courses/${course.id}/students/batch`)
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({
        emails: [student1.email, student2.email],
      })
      .expect(201);

    expect(response2.body).toEqual({
      message: 'All users are already enrolled',
      added: [],
    });
  });

  it('should return 400 if no students found', async () => {
    // Create another course
    const teacherResult = await authService.register({
      name: 'Teacher Two',
      email: `teacher2_batch_${Date.now()}@computacao.ufcg.edu.br`,
      password: 'password',
      role: Role.TEACHER,
    });
    const teacher = teacherResult.user;
    const token = teacherResult.access_token;

    const course = await prisma.course.create({
      data: {
        name: 'Test Course 2',
        teacherId: teacher.id,
      },
    });

    await request(app.getHttpServer() as Application)
      .post(`/courses/${course.id}/students/batch`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        emails: ['invalid@test.com'],
      })
      .expect(400);
  });
});
