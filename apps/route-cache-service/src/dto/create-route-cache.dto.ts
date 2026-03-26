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
import {
  RouteMainMode,
  RouteSearchStatus,
  RouteSegmentMode,
} from '../enums/route-cache.enums';

class CreateRouteSegmentDto {
  @IsInt()
  segment_id: number;

  @IsEnum(RouteSegmentMode)
  mode: RouteSegmentMode;

  @IsOptional()
  @IsString()
  from_stop?: string;

  @IsOptional()
  @IsString()
  to_stop?: string;

  @IsNumber()
  duration_mins: number;

  @IsNumber()
  distance_km: number;

  @IsOptional()
  @IsString()
  line_or_service?: string;

  @IsInt()
  segment_order: number;
}

class CreateRouteOptionDto {
  @IsInt()
  option_id: number;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsNumber()
  total_duration_mins: number;

  @IsNumber()
  total_distance_km: number;

  @IsInt()
  transfer_count: number;

  @IsOptional()
  @IsEnum(RouteMainMode)
  main_mode?: RouteMainMode;

  @IsBoolean()
  is_public_transport: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteSegmentDto)
  segments: CreateRouteSegmentDto[];
}

export class CreateRouteCacheDto {
  @IsInt()
  route_id: number;

  @IsInt()
  user_id: number;

  @IsString()
  origin_label: string;

  @IsString()
  destination_label: string;

  @IsObject()
  route_payload_json: Record<string, any>;

  @IsOptional()
  @IsInt()
  selected_option_id?: number;

  @IsOptional()
  @IsBoolean()
  is_locked?: boolean;

  @IsOptional()
  @IsEnum(RouteSearchStatus)
  search_status?: RouteSearchStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteOptionDto)
  route_options?: CreateRouteOptionDto[];

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expires_at?: Date;
}
