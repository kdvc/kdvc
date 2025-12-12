import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const PORT = process.env.PORT ?? 8000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(PORT);
}

bootstrap()
  .then(() => {
    console.log('listening on port ', PORT);
  })
  .catch((err) => {
    console.log('error on boostrap: ', err);
  });
