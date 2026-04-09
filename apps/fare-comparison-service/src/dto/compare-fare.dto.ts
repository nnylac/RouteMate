import { IsInt, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompareFareDto {
  @ApiProperty({ example: 1, description: 'Route ID from route-cache-service' })
  @Type(() => Number)
  @IsInt()
  route_id: number;

  @ApiProperty({
    example: 4,
    description:
      'Number of people travelling — ride-hailing cost split across group',
    minimum: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  group_size: number = 1;

  @ApiPropertyOptional({
    example: 'adult_card',
    description: 'Fare category for PT calculation',
    enum: [
      'adult_card',
      'adult_cash',
      'senior_card',
      'senior_cash',
      'student_card',
      'student_cash',
      'workfare_card',
      'workfare_cash',
    ],
    default: 'adult_card',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'adult_card',
    'adult_cash',
    'senior_card',
    'senior_cash',
    'student_card',
    'student_cash',
    'workfare_card',
    'workfare_cash',
  ])
  fare_category?: string = 'adult_card';

  @ApiPropertyOptional({
    example: 'price',
    description: 'Sort ride-hailing results by price or eta',
    enum: ['price', 'eta'],
    default: 'price',
  })
  @IsOptional()
  @IsString()
  @IsIn(['price', 'eta'])
  sort_by?: 'price' | 'eta' = 'price';
}
