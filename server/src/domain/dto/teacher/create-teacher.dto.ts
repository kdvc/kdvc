import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  matricula: string;

  constructor(partial?: Partial<CreateTeacherDto>) {
    if (partial) Object.assign(this, partial);
  }
}
