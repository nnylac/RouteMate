import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class SelectRouteOptionDto {
  @Type(() => Number)
  @IsInt()
  route_id: number;

  @Type(() => Number)
  @IsInt()
  option_id: number;
}
