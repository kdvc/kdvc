import { IsString, IsNotEmpty } from 'class-validator';

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  constructor(partial?: Partial<CreateStudentDto>) {
    if (partial) Object.assign(this, partial);
  }
}
