import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  topic: string;

  @IsDateString()
  date: Date;

  @IsUUID()
  courseId: string;
}

export class UpdateClassDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  topic?: string;

  @IsDateString()
  @IsOptional()
  date?: Date;

  @IsUUID()
  @IsOptional()
  courseId?: string;
}

export class RegisterAttendanceDto {
  @IsUUID()
  @IsOptional()
  studentId?: string;
}
