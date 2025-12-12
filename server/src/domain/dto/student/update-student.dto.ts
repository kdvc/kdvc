import { IsOptional, IsString } from 'class-validator';

/**
 * DTO used to update a Student.
 * Fields are optional so partial updates are allowed.
 */
export class UpdateStudentDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  matricula?: string;

  constructor(partial?: Partial<UpdateStudentDto>) {
    if (partial) Object.assign(this, partial);
  }
}
