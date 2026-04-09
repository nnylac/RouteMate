import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetRouteByIdDto {
  @ApiProperty({ example: 1, description: 'Route ID' })
  @Type(() => Number)
  @IsInt()
  route_id: number;
}
