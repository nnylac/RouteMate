import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SelectRouteOptionDto {
  @ApiProperty({ example: 1, description: 'Route ID' })
  @Type(() => Number)
  @IsInt()
  route_id: number;

  @ApiProperty({ example: 2, description: 'Option ID to select' })
  @Type(() => Number)
  @IsInt()
  option_id: number;
}
