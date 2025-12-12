import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class IdParamDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  constructor(partial?: Partial<IdParamDto>) {
    if (partial) Object.assign(this, partial);
  }
}
