import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PrismaExceptionFilter } from './filters/prisma-exception.filter';

import cookieParser from 'cookie-parser';

const PORT = process.env.PORT ?? 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.useGlobalFilters(new PrismaExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('KDVC - Attendance System')
    .setDescription('API for managing classroom attendance')
    .setVersion('1.0')
    .addTag('users', 'User management (teachers and students)')
    .addTag('courses', 'Course management')
    .addTag('classes', 'Class session management')
    .addBearerAuth()
    .addSecurityRequirements('bearer')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(PORT);
}

bootstrap()
  .then(() => {
    console.log('listening on port ', PORT);
    console.log(
      `Swagger documentation available at http://localhost:${PORT}/docs`,
    );
  })
  .catch((err) => {
    console.log('error on boostrap: ', err);
  });
