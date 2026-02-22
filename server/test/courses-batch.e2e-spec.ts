import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Application } from 'express';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/database/prisma.service';
import { Role } from './../prisma/generated/prisma/client';

describe('CoursesController (e2e) - Batch Add Students', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    // Cleanup
    await prisma.studentCourse.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
    await app.close();
  });

  it('/courses/:id/students/batch (POST)', async () => {
    // 1. Create Teacher
    let teacher;
    try {
      teacher = await prisma.user.create({
        data: {
          name: 'Teacher One',
          email: `teacher_${Date.now()}@test.com`,
          password: 'password',
          role: Role.TEACHER,
        },
      });
    } catch (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }

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
        email: `student1_${Date.now()}@test.com`,
        password: 'password',
        role: Role.STUDENT,
      },
    });

    const student2 = await prisma.user.create({
      data: {
        name: 'Student Two',
        email: `student2_${Date.now()}@test.com`,
        password: 'password',
        role: Role.STUDENT,
      },
    });

    // 4. Batch Add Students
    const response = await request(app.getHttpServer() as Application)
      .post(`/courses/${course.id}/students/batch`)
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
      .send({
        emails: [student1.email, student2.email],
      })
      .expect(201);

    expect(response2.body).toEqual({
      message: 'All students are already enrolled',
      added: [],
    });
  });

  it('should return 400 if no students found', async () => {
    // Create another course
    const teacher = await prisma.user.create({
      data: {
        name: 'Teacher Two',
        email: `teacher2_${Date.now()}@test.com`,
        password: 'password',
        role: Role.TEACHER,
      },
    });

    const course = await prisma.course.create({
      data: {
        name: 'Test Course 2',
        teacherId: teacher.id,
      },
    });

    await request(app.getHttpServer() as Application)
      .post(`/courses/${course.id}/students/batch`)
      .send({
        emails: ['nonexistent@test.com'],
      })
      .expect(400);
  });
});
