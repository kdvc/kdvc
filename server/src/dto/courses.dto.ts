import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  teacherId: string;
}

export class UpdateCourseDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  teacherId?: string;
}

export class AddStudentDto {
  @IsUUID()
  studentId: string;
}
