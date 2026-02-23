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

describe('ClassesController (e2e) - Create Class Session', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let teacher: any;
    let course: any;
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

        // Setup base data for class tests (properly hashed password)
        const teacherResult = await authService.register({
            name: 'Class Teacher',
            email: `teacher_class_${Date.now()}@computacao.ufcg.edu.br`,
            password: 'password',
            role: Role.TEACHER,
        });
        teacher = teacherResult.user;
        teacherToken = teacherResult.access_token;

        course = await prisma.course.create({
            data: {
                name: 'Class Creation Test Course',
                description: 'Course to attach classes',
                teacherId: teacher.id,
            },
        });
    });

    afterAll(async () => {
        await cleanupDatabase(prisma);
        await app.close();
    });

    it('/classes (POST) - should create a class session successfully', async () => {
        const createClassDto = {
            topic: 'Introduction to E2E Testing',
            date: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            courseId: course.id,
        };

        // Note: To mimic @Authenticated(Role.TEACHER) we might need authentication tokens in a real scenario
        // Based on the courses test style, it assumes the controller has standard access unless mocked,
        // or the test environment overrides the gurads. I'll test it similarly to courses-batch.
        // If Auth is strictly enforced with JWT, we would need to mock or login. 
        // Usually Nest e2e without token login mocks the guard or signs a token.
        // Given courses-batch.e2e-spec.ts doesn't send a token, we assume it's mocked or disabled.
        // Wait, let's verify courses-batch sends no token. Yes, it didn't send token.

        const response = await request(app.getHttpServer())
            .post('/classes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(createClassDto)
            .expect(201); // Created

        expect(response.body).toHaveProperty('id');
        expect(response.body.topic).toBe(createClassDto.topic);
        expect(response.body.courseId).toBe(course.id);

        // Check DB
        const classInDb = await prisma.class.findUnique({
            where: { id: response.body.id }
        });

        expect(classInDb).not.toBeNull();
        expect(classInDb?.topic).toBe(createClassDto.topic);
    });

    it('/classes (POST) - should return 400 when missing required fields', async () => {
        const invalidDto = {
            // missing topic
            date: new Date().toISOString(),
            courseId: course.id,
        };

        await request(app.getHttpServer())
            .post('/classes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(invalidDto)
            .expect(400);
    });

    it('/classes (POST) - should return 404 when course does not exist', async () => {
        const createClassDto = {
            topic: 'Ghost Course Class',
            date: new Date().toISOString(),
            courseId: '00000000-0000-0000-0000-000000000000', // Non-existent
        };

        const response = await request(app.getHttpServer() as any)
            .post('/classes')
            .set('Authorization', `Bearer ${teacherToken}`)
            .send(createClassDto);

        expect(response.status).toBe(404);
        // Note: Nest typical validation might throw 500 if unhandled DB error, but service handles this.
    });
});
