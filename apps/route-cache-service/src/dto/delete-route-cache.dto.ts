import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteRouteCacheDto {
  @Type(() => Number)
  @IsInt()
  user_id: number;

  @IsString()
  origin: string;

  @IsString()
  destination: string;
}
