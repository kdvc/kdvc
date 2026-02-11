import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { UsersController } from './controllers/users.controller';
import { CoursesController } from './controllers/courses.controller';
import { ClassesController } from './controllers/classes.controller';
import { UsersService } from './services/users.service';
import { CoursesService } from './services/courses.service';
import { ClassesService } from './services/classes.service';

@Module({
  imports: [DatabaseModule],
  controllers: [
    UsersController,
    CoursesController,
    ClassesController,
  ],
  providers: [
    UsersService,
    CoursesService,
    ClassesService,
  ],
})
export class AppModule {}
