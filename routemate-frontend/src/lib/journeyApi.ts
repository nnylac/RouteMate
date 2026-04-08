import { apiRequest } from '@/lib/api';
import { readStoredUser, toRouteCacheUserId } from '@/lib/authStorage';
import type {
  DetailedRouteOption,
  RouteBadge,
  RouteFareBreakdown,
  RouteSegmentDetail,
} from '@/types';
import type { SavedRoute } from '@/types';

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
  fares?: {
    fare_basis_mode: string | null;
    totals: {
      adult_card: number;
      student_card: number;
      senior_card: number;
    };
    segments: Array<{
      segment_id: number;
      segment_order: number;
      mode: 'BUS' | 'MRT';
      line_or_service: string | null;
      distance_km: number;
      cumulative_distance_km: number;
      fare_basis_mode: string | null;
      fares: {
        adult_card: {
          incremental: number;
          cumulative: number;
        };
        student_card: {
          incremental: number;
          cumulative: number;
        };
        senior_card: {
          incremental: number;
          cumulative: number;
        };
      };
    }>;
  } | null;
}

interface RoutePlannerSearchResponse {
  route_id: number;
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

interface CachedRouteHistoryOption {
  option_id: number;
  total_duration_mins: number;
  total_distance_km: number;
  fare?: number | null;
  segments: RoutePlannerSegment[];
}

interface CachedRouteHistoryItem {
  route_id: number;
  user_id: number;
  origin_label: string;
  destination_label: string;
  selected_option_id?: number | null;
  route_options: CachedRouteHistoryOption[];
  created_at?: string;
}

const inFlightRouteSearches = new Map<string, Promise<{
  route_id: number;
  origin_label: string;
  destination_label: string;
  options: RoutePlannerOptionResponse[];
  driving_option?: {
    total_duration_mins: number;
    total_distance_km: number;
    summary: string;
  } | null;
  routeOptions: DetailedRouteOption[];
  quickestDuration: number | null;
  drivingDuration: number | null;
}>>();

function getUserId() {
  const storedUser = readStoredUser();

  if (!storedUser) {
    return 1;
  }

  return toRouteCacheUserId(storedUser.id);
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

function toRouteFareBreakdown(
  fares: RoutePlannerOptionResponse['fares'],
): RouteFareBreakdown | null {
  if (!fares) {
    return null;
  }

  return {
    fareBasisMode: fares.fare_basis_mode,
    totals: {
      adultCard: Number(fares.totals.adult_card ?? 0),
      studentCard: Number(fares.totals.student_card ?? 0),
      seniorCard: Number(fares.totals.senior_card ?? 0),
    },
    segments: fares.segments.map((segment) => ({
      segmentId: segment.segment_id,
      segmentOrder: segment.segment_order,
      mode: segment.mode,
      lineOrService: segment.line_or_service,
      distanceKm: Number(segment.distance_km ?? 0),
      cumulativeDistanceKm: Number(segment.cumulative_distance_km ?? 0),
      fareBasisMode: segment.fare_basis_mode,
      fares: {
        adultCard: {
          incremental: Number(segment.fares.adult_card.incremental ?? 0),
          cumulative: Number(segment.fares.adult_card.cumulative ?? 0),
        },
        studentCard: {
          incremental: Number(segment.fares.student_card.incremental ?? 0),
          cumulative: Number(segment.fares.student_card.cumulative ?? 0),
        },
        seniorCard: {
          incremental: Number(segment.fares.senior_card.incremental ?? 0),
          cumulative: Number(segment.fares.senior_card.cumulative ?? 0),
        },
      },
    })),
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
    fares: toRouteFareBreakdown(option.fares),
  };
}

export async function searchRoutes(origin: string, destination: string) {
  const userId = getUserId();
  const searchKey = `${userId}::${origin.toLowerCase()}::${destination.toLowerCase()}`;
  const existingRequest = inFlightRouteSearches.get(searchKey);

  if (existingRequest) {
    return existingRequest;
  }

  const request = apiRequest<RoutePlannerSearchResponse>('/route-planner/search', {
    method: 'POST',
    body: JSON.stringify({
      user_id: userId,
      origin,
      destination,
    }),
  })
    .then((response) => ({
      ...response,
      routeOptions: response.options.map(toRouteOption),
      quickestDuration: response.options.length > 0
        ? Math.min(...response.options.map((option) => option.total_duration_mins))
        : null,
      drivingDuration: response.driving_option?.total_duration_mins ?? null,
    }))
    .finally(() => {
      inFlightRouteSearches.delete(searchKey);
    });

  inFlightRouteSearches.set(searchKey, request);
  return request;
}

export function selectRoute(routeId: number, optionId: string | number) {
  return apiRequest('/route-planner/select', {
    method: 'PATCH',
    body: JSON.stringify({
      route_id: routeId,
      option_id: Number(optionId),
    }),
  });
}

function toModeSummary(option: CachedRouteHistoryOption) {
  const modes = option.segments
    .map((segment) => {
      if (segment.mode === 'BUS') return 'Bus';
      if (segment.mode === 'MRT') return 'MRT';
      return null;
    })
    .filter((value, index, array): value is string => value !== null && array.indexOf(value) === index);

  return modes.join(' · ') || 'Route';
}

function toSavedRoute(historyItem: CachedRouteHistoryItem): SavedRoute | null {
  if (!historyItem.selected_option_id) {
    return null;
  }

  const selectedOption = historyItem.route_options.find(
    (option) => option.option_id === historyItem.selected_option_id,
  );

  if (!selectedOption) {
    return null;
  }

  const durationLabel = selectedOption.total_duration_mins >= 60
    ? `Est ${Math.floor(selectedOption.total_duration_mins / 60)}h ${selectedOption.total_duration_mins % 60} min`
    : `Est ${selectedOption.total_duration_mins} min`;

  return {
    id: `history-${historyItem.route_id}-${selectedOption.option_id}`,
    routeId: String(historyItem.route_id),
    optionId: String(selectedOption.option_id),
    modeSummary: toModeSummary(selectedOption),
    from: historyItem.origin_label,
    to: historyItem.destination_label,
    distanceKm: Number(selectedOption.total_distance_km ?? 0),
    durationLabel,
    fare: Number(selectedOption.fare ?? 0),
  };
}

export async function getRecentSelectedRoutes() {
  const userId = getUserId();
  const history = await apiRequest<CachedRouteHistoryItem[]>(
    `/route-cache/user-history?user_id=${encodeURIComponent(String(userId))}`,
  );

  return history
    .map(toSavedRoute)
    .filter((route): route is SavedRoute => route !== null);
}

export function getRideQuotes(origin: string, destination: string) {
  return apiRequest<RideQuoteResponse>('/ridehail/quotes', {
    method: 'POST',
    body: JSON.stringify({ origin, destination }),
  });
}
