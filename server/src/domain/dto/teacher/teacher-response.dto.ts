import { Expose } from 'class-transformer';

/**
 * Response DTO for Teacher model.
 * Keeps presentation shape separate from create/update DTOs.
 */
export class TeacherResponseDto {
  @Expose()
  id: number;

  @Expose()
  name: string;

  @Expose()
  matricula: string;

  constructor(partial?: Partial<TeacherResponseDto>) {
    if (partial) Object.assign(this, partial);
  }
}
