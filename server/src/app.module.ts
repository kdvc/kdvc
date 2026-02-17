import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersController } from './controllers/users.controller';
import { CoursesController } from './controllers/courses.controller';
import { ClassesController } from './controllers/classes.controller';
import { UsersService } from './services/users.service';
import { CoursesService } from './services/courses.service';
import { ClassesService } from './services/classes.service';
import { LoggingMiddleware } from './middleware/logging.middleware';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UsersController, CoursesController, ClassesController],
  providers: [UsersService, CoursesService, ClassesService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
