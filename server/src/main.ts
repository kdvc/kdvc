import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT ?? 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      transformOptions: {
        enableImplicitConversion: false,
        excludeExtraneousValues: true,
      },
    }),
  );

  await app.listen(PORT);
}

bootstrap()
  .then(() => {
    console.log('listening on port ', PORT);
  })
  .catch((err) => {
    console.log('error on boostrap: ', err);
  });
