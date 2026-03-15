import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RouteCacheDocument = HydratedDocument<RouteCache>;

@Schema({ _id: false })
export class RouteSegment {
  @Prop({ required: true })
  segment_id: number;

  @Prop({ required: true })
  mode: string; // WALK, BUS, MRT, etc.

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

  @Prop()
  main_mode?: string;

  @Prop({ required: true, default: true })
  is_public_transport: boolean;

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
  @Prop({ required: true, unique: true, index: true })
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

  @Prop({ required: true, default: 'GENERATED' })
  search_status: string;

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
