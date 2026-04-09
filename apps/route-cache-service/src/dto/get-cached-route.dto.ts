import { IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class GetCachedRouteDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Type(() => Number)
  @IsInt()
  user_id: number;

  @ApiProperty({ example: 'SMU', description: 'Origin location' })
  @IsString()
  origin: string;

  @ApiProperty({
    example: 'Changi Airport',
    description: 'Destination location',
  })
  @IsString()
  destination: string;
}
