import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import {
  RouteSearchStatus,
  RouteSegmentMode,
  RouteMainMode,
} from '../src/enums/route-cache.enums';

export type RouteCacheDocument = HydratedDocument<RouteCache>;

@Schema({ _id: false })
export class RouteSegment {
  @Prop({ required: true })
  segment_id: number;

  @Prop({ type: String, required: true, enum: RouteSegmentMode })
  mode: RouteSegmentMode; // WALK, BUS, MRT, etc.

  @Prop()
  from_stop?: string;

  @Prop()
  to_stop?: string;

  @Prop({ required: true, min: 0 })
  duration_mins: number;

  @Prop({ required: true, min: 0 })
  distance_km: number;

  @Prop()
  line_or_service?: string;

  @Prop({ required: true, min: 1 })
  segment_order: number;
}

export const RouteSegmentSchema = SchemaFactory.createForClass(RouteSegment);

@Schema({ _id: false })
export class SegmentFareAmount {
  @Prop({ required: true, min: 0 })
  incremental: number;

  @Prop({ required: true, min: 0 })
  cumulative: number;
}

export const SegmentFareAmountSchema =
  SchemaFactory.createForClass(SegmentFareAmount);

@Schema({ _id: false })
export class SegmentFareAmounts {
  @Prop({ type: SegmentFareAmountSchema, required: true })
  adult_card: SegmentFareAmount;

  @Prop({ type: SegmentFareAmountSchema, required: true })
  student_card: SegmentFareAmount;

  @Prop({ type: SegmentFareAmountSchema, required: true })
  senior_card: SegmentFareAmount;
}

export const SegmentFareAmountsSchema =
  SchemaFactory.createForClass(SegmentFareAmounts);

@Schema({ _id: false })
export class RouteOptionFareSegment {
  @Prop({ required: true })
  segment_id: number;

  @Prop({ required: true })
  segment_order: number;

  @Prop({ required: true, enum: ['BUS', 'MRT'] })
  mode: 'BUS' | 'MRT';

  @Prop({ type: String, default: null })
  line_or_service?: string | null;

  @Prop({ required: true, min: 0 })
  distance_km: number;

  @Prop({ required: true, min: 0 })
  cumulative_distance_km: number;

  @Prop({ type: String, required: true, enum: ['trunk_bus', 'mrt_lrt'] })
  fare_basis_mode: string;

  @Prop({ type: SegmentFareAmountsSchema, required: true })
  fares: SegmentFareAmounts;
}

export const RouteOptionFareSegmentSchema = SchemaFactory.createForClass(
  RouteOptionFareSegment,
);

@Schema({ _id: false })
export class RouteOptionFares {
  @Prop({ type: String, enum: ['trunk_bus', 'mrt_lrt'], default: null })
  fare_basis_mode?: string | null;

  @Prop({
    type: {
      adult_card: { type: Number, required: true, min: 0 },
      student_card: { type: Number, required: true, min: 0 },
      senior_card: { type: Number, required: true, min: 0 },
    },
    required: true,
  })
  totals: {
    adult_card: number;
    student_card: number;
    senior_card: number;
  };

  @Prop({ type: [RouteOptionFareSegmentSchema], default: [] })
  segments: RouteOptionFareSegment[];
}

export const RouteOptionFaresSchema =
  SchemaFactory.createForClass(RouteOptionFares);

@Schema({ _id: false })
export class RouteOption {
  @Prop({ required: true })
  option_id: number;

  @Prop()
  summary?: string;

  @Prop({ required: true, min: 0 })
  total_duration_mins: number;

  @Prop({ required: true, min: 0 })
  total_distance_km: number;

  @Prop({ required: true, min: 0, default: 0 })
  transfer_count: number;

  @Prop({ type: String, enum: RouteMainMode })
  main_mode?: RouteMainMode;

  @Prop({ required: true, default: true })
  is_public_transport: boolean;

  @Prop({ min: 0 })
  fare?: number;

  @Prop({ type: RouteOptionFaresSchema })
  fares?: RouteOptionFares;

  @Prop({ type: [RouteSegmentSchema], default: [] })
  segments: RouteSegment[];
}

export const RouteOptionSchema = SchemaFactory.createForClass(RouteOption);

@Schema({
  collection: 'saved_routes',
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
})
export class RouteCache {
  @Prop({ required: true, index: true })
  route_id: number;

  @Prop({ required: true, index: true })
  user_id: number;

  @Prop({ required: true, index: true })
  origin_label: string;

  @Prop({ required: true, index: true })
  destination_label: string;

  @Prop({ type: Object, required: true })
  route_payload_json: Record<string, any>;

  @Prop()
  selected_option_id?: number;

  @Prop({ required: true, default: false })
  is_locked: boolean;

  @Prop({
    type: String,
    required: true,
    enum: RouteSearchStatus,
    default: RouteSearchStatus.GENERATED,
  })
  search_status: RouteSearchStatus;

  @Prop({ type: [RouteOptionSchema], default: [] })
  route_options: RouteOption[];

  @Prop()
  expires_at?: Date;
}

export const RouteCacheSchema = SchemaFactory.createForClass(RouteCache);

// TTL index for automatic expiry
RouteCacheSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// helpful indexes
RouteCacheSchema.index({ user_id: 1, created_at: -1 });
RouteCacheSchema.index({ origin_label: 1, destination_label: 1 });
RouteCacheSchema.index({ user_id: 1, route_id: 1 }, { unique: true });
