import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalculateFareDto {
  @IsString()
  transportMode: string;

  @IsString()
  fareCategory: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  distanceKm: number;

  @IsOptional()
  @IsString()
  applicableTime?: string;
}
