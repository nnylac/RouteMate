import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CalculateFareDto {
  @ApiProperty({
    description: 'Transport mode',
    enum: ['trunk_bus', 'mrt_lrt'],
    example: 'trunk_bus',
  })
  @IsString()
  transportMode: string;

  @ApiProperty({
    description: 'Fare category',
    enum: ['adult_card', 'student_card', 'senior_card'],
    example: 'adult_card',
  })
  @IsString()
  fareCategory: string;

  @ApiProperty({
    description: 'Distance in kilometres',
    example: 5.2,
    minimum: 0,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceKm: number;

  @ApiPropertyOptional({
    description: 'Applicable time (optional)',
    example: 'peak',
  })
  @IsOptional()
  @IsString()
  applicableTime?: string;
}
