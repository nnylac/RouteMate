import {
  IsInt,
  IsOptional,
  IsString,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompareFareDto {
  // The route_id stored in route-cache-service for the user's planned journey
  @Type(() => Number)
  @IsInt()
  route_id: number;

  // Number of people travelling together — ride-hailing cost will be split
  @Type(() => Number)
  @IsInt()
  @Min(1)
  group_size: number = 1;

  // Fare category for PT calculation — defaults to adult_card
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

  // Sort ride-hailing results by price or eta
  @IsOptional()
  @IsString()
  @IsIn(['price', 'eta'])
  sort_by?: 'price' | 'eta' = 'price';
}
