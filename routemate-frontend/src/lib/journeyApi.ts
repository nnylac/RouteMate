import { apiRequest } from '@/lib/api';
import type { DetailedRouteOption, RouteBadge, RouteOption, RouteSegmentDetail } from '@/types';

interface RoutePlannerSegment {
  segment_id: number;
  mode: string;
  from_stop: string | null;
  to_stop: string | null;
  duration_mins: number;
  distance_km: number;
  line_or_service: string | null;
  segment_order: number;
  arrival_timing?: string | null;
}

interface RoutePlannerOptionResponse {
  option_id: number;
  summary?: string;
  total_duration_mins: number;
  total_distance_km: number;
  transfer_count: number;
  is_public_transport: boolean;
  segments: RoutePlannerSegment[];
  fare?: number | null;
}

interface RoutePlannerSearchResponse {
  origin_label: string;
  destination_label: string;
  options: RoutePlannerOptionResponse[];
  driving_option?: {
    total_duration_mins: number;
    total_distance_km: number;
    summary: string;
  } | null;
}

export interface RideQuote {
  provider: string;
  price: number;
  eta: number;
  route?: string;
  bookingLink?: string;
}

interface RideQuoteResponse {
  metadata: {
    totalOptions: number;
    cheapestProvider: string;
    fastestProvider: string;
  } | null;
  quotes: RideQuote[];
}

function getUserId() {
  const storedUser = localStorage.getItem('routemate-user');

  if (!storedUser) {
    return 1;
  }

  try {
    const parsed = JSON.parse(storedUser) as { id?: string | number };
    const numericId = Number(parsed.id);
    return Number.isFinite(numericId) && numericId > 0 ? numericId : 1;
  } catch {
    return 1;
  }
}

function toRouteBadge(segment: RoutePlannerSegment): RouteBadge | null {
  if (segment.mode === 'WALK') {
    return {
      kind: 'walk',
      value: String(segment.duration_mins),
    };
  }

  if (segment.mode === 'BUS' && segment.line_or_service) {
    return {
      kind: 'bus',
      value: segment.line_or_service,
    };
  }

  if (segment.mode === 'MRT' && segment.line_or_service) {
    return {
      kind: 'mrt',
      value: segment.line_or_service.slice(0, 2).toUpperCase(),
    };
  }

  return null;
}

function toRouteSegment(segment: RoutePlannerSegment): RouteSegmentDetail {
  return {
    segmentId: segment.segment_id,
    mode: segment.mode as RouteSegmentDetail['mode'],
    fromStop: segment.from_stop,
    toStop: segment.to_stop,
    durationMins: segment.duration_mins,
    distanceKm: segment.distance_km,
    lineOrService: segment.line_or_service,
    segmentOrder: segment.segment_order,
    arrivalTiming: segment.arrival_timing ?? null,
  };
}

function toRouteOption(option: RoutePlannerOptionResponse): DetailedRouteOption {
  return {
    id: String(option.option_id),
    summary: option.summary,
    durationLabel: option.total_duration_mins >= 60
      ? `${Math.floor(option.total_duration_mins / 60)}h ${option.total_duration_mins % 60} min`
      : `${option.total_duration_mins} min`,
    badges: option.segments
      .map(toRouteBadge)
      .filter((badge): badge is RouteBadge => badge !== null),
    fare: option.fare ?? null,
    totalDurationMins: option.total_duration_mins,
    totalDistanceKm: option.total_distance_km,
    transferCount: option.transfer_count,
    isPublicTransport: option.is_public_transport,
    segments: option.segments.map(toRouteSegment),
  };
}

export async function searchRoutes(origin: string, destination: string) {
  const response = await apiRequest<RoutePlannerSearchResponse>('/route-planner/search', {
    method: 'POST',
    body: JSON.stringify({
      user_id: getUserId(),
      origin,
      destination,
    }),
  });

  return {
    ...response,
    routeOptions: response.options.map(toRouteOption),
    quickestDuration: response.options.length > 0
      ? Math.min(...response.options.map((option) => option.total_duration_mins))
      : null,
    drivingDuration: response.driving_option?.total_duration_mins ?? null,
  };
}

export function getRideQuotes(origin: string, destination: string) {
  return apiRequest<RideQuoteResponse>('/ridehail/quotes', {
    method: 'POST',
    body: JSON.stringify({ origin, destination }),
  });
}
