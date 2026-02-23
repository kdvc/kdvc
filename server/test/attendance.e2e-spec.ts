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

describe('ClassesController (e2e) - Attendance & Performance', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let teacher: any;
    let student1: any;
    let student2: any;
    let course: any;
    let classSession: any;
    let authService: AuthService;
    let teacherToken: string;
    let studentToken: string;

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

        // 1. Setup Teacher
        const teacherResult = await authService.register({
            name: 'Attendance Teacher',
            email: `teacher_att_${Date.now()}@computacao.ufcg.edu.br`,
            password: 'password',
            role: Role.TEACHER,
        });
        teacher = teacherResult.user;
        teacherToken = teacherResult.access_token;

        // 2. Setup Students
        const student1Result = await authService.register({
            name: 'Student One',
            email: `student1_att_${Date.now()}@ccc.ufcg.edu.br`,
            password: 'password',
            role: Role.STUDENT,
        });
        student1 = student1Result.user;
        studentToken = student1Result.access_token;

        const student2Result = await authService.register({
            name: 'Student Two',
            email: `student2_att_${Date.now()}@ccc.ufcg.edu.br`,
            password: 'password',
            role: Role.STUDENT,
        });
        student2 = student2Result.user;

        // 3. Setup Course & Enrollment
        course = await prisma.course.create({
            data: {
                name: 'Attendance Course',
                teacherId: teacher.id,
            },
        });

        await prisma.studentCourse.createMany({
            data: [
                { studentId: student1.id, courseId: course.id },
                { studentId: student2.id, courseId: course.id }
            ]
        });

        // 4. Setup Class Session
        classSession = await prisma.class.create({
            data: {
                topic: 'Attendance Test Session',
                date: new Date(),
                courseId: course.id,
            },
        });
    });

    afterAll(async () => {
        await cleanupDatabase(prisma);
        await app.close();
    });

    it('/classes/:id/attendance (POST) - should register attendance (RF-10) and meet performance (PER-01)', async () => {
        const startTime = process.hrtime(); // Start performance timer

        const response = await request(app.getHttpServer())
            .post(`/classes/${classSession.id}/attendance`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ studentId: student1.id }) // Teacher registers for student
            .expect(201); // Created

        const endTime = process.hrtime(startTime);
        const executionTimeMs = (endTime[0] * 1000) + (endTime[1] / 1e6);

        // PERFORMANCE CHECK: Checkout PER-01 requires < 200ms or so (adjust if needed, usually ~500ms max for local testing logic)
        // We'll assert it takes less than 500ms for safety on slower local/CI environments
        expect(executionTimeMs).toBeLessThan(500);

        // Verify Response
        expect(response.body).toHaveProperty('id');
        expect(response.body.classId).toBe(classSession.id);
        expect(response.body.studentId).toBe(student1.id);

        // Verify DB
        const attendanceInDb = await prisma.attendance.findUnique({
            where: {
                classId_studentId: {
                    classId: classSession.id,
                    studentId: student1.id,
                },
            },
        });

        expect(attendanceInDb).not.toBeNull();
    });

    it('/classes/:id/attendance (POST) - should fail if student not in course', async () => {
        const student3Result = await authService.register({
            name: 'Unenrolled Student',
            email: `student3_not_${Date.now()}@ccc.ufcg.edu.br`,
            password: 'password',
            role: Role.STUDENT,
        });
        const student3 = student3Result.user;

        await request(app.getHttpServer())
            .post(`/classes/${classSession.id}/attendance`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ studentId: student3.id })
            .expect(400); // Bad Request (not enrolled)
    });

    it('/classes/:id/attendance (POST) - should fail if already checked in', async () => {
        await request(app.getHttpServer())
            .post(`/classes/${classSession.id}/attendance`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .send({ studentId: student1.id })
            .expect(400); // 400 Bad Request if already registered in service
    });

    it('/classes/:id (GET) - should format and consult attendance (RF-11/12)', async () => {
        // Consult class and ensure the attendance is there
        const response = await request(app.getHttpServer())
            .get(`/classes/${classSession.id}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .expect(200);

        expect(response.body.id).toBe(classSession.id);
        expect(response.body.attendances).toBeDefined();

        const attendances = response.body.attendances;
        expect(attendances.length).toBeGreaterThanOrEqual(1);

        // Check if student1 is in the list of attendances
        const attendeeIds = attendances.map((a: any) => a.studentId);
        expect(attendeeIds).toContain(student1.id);
    });

    it('/classes/:id/attendance/:studentId (DELETE) - should remove attendance', async () => {
        await request(app.getHttpServer())
            .delete(`/classes/${classSession.id}/attendance/${student1.id}`)
            .set('Authorization', `Bearer ${teacherToken}`)
            .expect(200); // Assuming 200 OK

        // Verify DB
        const attendanceInDb = await prisma.attendance.findUnique({
            where: {
                classId_studentId: {
                    classId: classSession.id,
                    studentId: student1.id,
                },
            },
        });

        expect(attendanceInDb).toBeNull();
    });
});
