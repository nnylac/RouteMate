import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class GetCachedRouteDto {
  @Type(() => Number)
  @IsInt()
  user_id: number;

  @IsString()
  origin: string;

  @IsString()
  destination: string;
}
