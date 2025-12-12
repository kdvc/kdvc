import { IsOptional, IsString } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  matricula?: string;

  constructor(partial?: Partial<UpdateTeacherDto>) {
    if (partial) Object.assign(this, partial);
  }
}
