import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetQuotesDto {
  @ApiProperty({ description: 'Origin location', example: 'SMU' })
  @IsString()
  origin!: string;

  @ApiProperty({
    description: 'Destination location',
    example: 'Changi Airport',
  })
  @IsString()
  destination!: string;
}
