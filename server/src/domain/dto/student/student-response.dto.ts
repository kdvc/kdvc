import { Expose } from 'class-transformer';

/**
 * Response DTO for Student model.
 * Keeps presentation shape separate from create/update DTOs.
 */
export class StudentResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  matricula: string;

  constructor(partial?: Partial<StudentResponseDto>) {
    if (partial) Object.assign(this, partial);
  }
}
