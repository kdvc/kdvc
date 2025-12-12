import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CourseController } from './controller/course.controller';
import { TeacherController } from './controller/teacher.controller';
import { TeacherService } from './domain/teacher.service';
import { StudentService } from './domain/student.service';
import { StudentController } from './controller/student.controller';

@Module({
  imports: [DatabaseModule],
  providers: [TeacherService, StudentService],
  controllers: [CourseController, TeacherController, StudentController],
})
export class AppModule {}
