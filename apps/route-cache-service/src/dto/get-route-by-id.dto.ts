import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class GetRouteByIdDto {
  @Type(() => Number)
  @IsInt()
  route_id: number;
}
