import {
  IsArray,
  IsBoolean,
  IsDate,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RouteMainMode,
  RouteSearchStatus,
  RouteSegmentMode,
} from '../enums/route-cache.enums';

class CreateRouteSegmentDto {
  @IsInt() segment_id: number;
  @IsEnum(RouteSegmentMode) mode: RouteSegmentMode;
  @IsOptional() @IsString() from_stop?: string;
  @IsOptional() @IsString() to_stop?: string;
  @IsNumber() duration_mins: number;
  @IsNumber() distance_km: number;
  @IsOptional() @IsString() line_or_service?: string;
  @IsInt() segment_order: number;
}

class CreateSegmentFareAmountDto {
  @IsNumber() incremental: number;
  @IsNumber() cumulative: number;
}

class CreateSegmentFareAmountsDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CreateSegmentFareAmountDto)
  adult_card: CreateSegmentFareAmountDto;
  @IsObject()
  @ValidateNested()
  @Type(() => CreateSegmentFareAmountDto)
  student_card: CreateSegmentFareAmountDto;
  @IsObject()
  @ValidateNested()
  @Type(() => CreateSegmentFareAmountDto)
  senior_card: CreateSegmentFareAmountDto;
}

class CreateRouteOptionFareSegmentDto {
  @IsInt() segment_id: number;
  @IsInt() segment_order: number;
  @IsString() mode: 'BUS' | 'MRT';
  @IsOptional() @IsString() line_or_service?: string | null;
  @IsNumber() distance_km: number;
  @IsNumber() cumulative_distance_km: number;
  @IsString() fare_basis_mode: 'trunk_bus' | 'mrt_lrt';
  @IsObject()
  @ValidateNested()
  @Type(() => CreateSegmentFareAmountsDto)
  fares: CreateSegmentFareAmountsDto;
}

class CreateRouteOptionFaresDto {
  @IsOptional() @IsString() fare_basis_mode?: 'trunk_bus' | 'mrt_lrt' | null;
  @IsObject() totals: {
    adult_card: number;
    student_card: number;
    senior_card: number;
  };
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteOptionFareSegmentDto)
  segments: CreateRouteOptionFareSegmentDto[];
}

class CreateRouteOptionDto {
  @IsInt() option_id: number;
  @IsOptional() @IsString() summary?: string;
  @IsNumber() total_duration_mins: number;
  @IsNumber() total_distance_km: number;
  @IsInt() transfer_count: number;
  @IsOptional() @IsEnum(RouteMainMode) main_mode?: RouteMainMode;
  @IsBoolean() is_public_transport: boolean;
  @IsOptional() @IsNumber() fare?: number;
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => CreateRouteOptionFaresDto)
  fares?: CreateRouteOptionFaresDto;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteSegmentDto)
  segments: CreateRouteSegmentDto[];
}

export class CreateRouteCacheDto {
  @ApiProperty({ example: 1, description: 'Unique route ID' })
  @IsInt()
  route_id: number;

  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  user_id: number;

  @ApiProperty({ example: 'SMU', description: 'Origin location label' })
  @IsString()
  origin_label: string;

  @ApiProperty({
    example: 'Changi Airport',
    description: 'Destination location label',
  })
  @IsString()
  destination_label: string;

  @ApiProperty({
    example: {},
    description: 'Full route payload JSON from Google Maps',
  })
  @IsObject()
  route_payload_json: Record<string, any>;

  @ApiPropertyOptional({
    example: 2,
    description: 'ID of the selected route option',
  })
  @IsOptional()
  @IsInt()
  selected_option_id?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Whether the route is locked by user selection',
  })
  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;

  @ApiPropertyOptional({
    enum: RouteSearchStatus,
    example: 'GENERATED',
    description: 'Current search status',
  })
  @IsOptional()
  @IsEnum(RouteSearchStatus)
  search_status?: RouteSearchStatus;

  @ApiPropertyOptional({ description: 'List of route options', type: 'array' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteOptionDto)
  route_options?: CreateRouteOptionDto[];

  @ApiPropertyOptional({
    example: '2026-04-08T10:00:00.000Z',
    description: 'Cache expiry time',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expires_at?: Date;
}
