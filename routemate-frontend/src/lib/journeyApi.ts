import { apiRequest } from '@/lib/api';
import { readStoredUser, toRouteCacheUserId } from '@/lib/authStorage';
import type {
  DetailedRouteOption,
  FareComparisonResult,
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
  arrival_timing?: {
    line?: string;
    stop?: string;
    predicted_arrival_mins?: number;
    source?: string;
  } | null;
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

interface FareComparisonBreakdownResponseItem {
  segment_id: number;
  mode: string;
  transport_mode?: string;
  from_stop: string | null;
  to_stop: string | null;
  distance_km: number;
  fare: number | null;
  note?: string;
}

interface FareComparisonSelectedOptionResponse extends RoutePlannerOptionResponse {}

interface FareComparisonResponse {
  route_id: number;
  origin: string;
  destination: string;
  group_size: number;
  fare_category: 'adult_card' | 'student_card' | 'senior_card';
  public_transport: {
    mode: string;
    total_duration_mins: number;
    total_distance_km: number;
    transfer_count: number;
    fare_per_person: number;
    fare_breakdown: FareComparisonBreakdownResponseItem[];
    segments_priced: number;
    segments_skipped: number;
    selected_option: FareComparisonSelectedOptionResponse;
  };
  ride_hailing: {
    metadata: {
      totalOptions: number;
      cheapestProvider: string;
      fastestProvider: string;
    } | null;
    quotes: Array<{
      provider: string;
      price: number;
      eta: number;
      route?: string;
      bookingLink?: string;
      booking_link?: string;
      price_per_person?: number;
    }>;
    provider_unavailable?: boolean;
    group_size_note?: string;
  };
  filters: {
    cheapest: {
      mode: string;
      provider: string;
      price: number;
    };
    fastest: {
      mode: string;
      provider: string;
      duration_mins: number;
    };
  };
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
    arrivalTiming: segment.arrival_timing
      ? {
          line: segment.arrival_timing.line,
          stop: segment.arrival_timing.stop,
          predictedArrivalMins:
            typeof segment.arrival_timing.predicted_arrival_mins === 'number'
              ? segment.arrival_timing.predicted_arrival_mins
              : undefined,
          source: segment.arrival_timing.source,
        }
      : null,
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
    routeKey: `${historyItem.origin_label}::${historyItem.destination_label}::${selectedOption.option_id}`,
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

export async function getRecentSearchInputs() {
  const userId = getUserId();
  const history = await apiRequest<CachedRouteHistoryItem[]>(
    `/route-cache/user-history?user_id=${encodeURIComponent(String(userId))}`,
  );

  const seen = new Set<string>();
  const inputs: string[] = [];

  for (const item of history) {
    for (const value of [item.origin_label, item.destination_label]) {
      const normalized = value?.trim();

      if (!normalized) {
        continue;
      }

      const key = normalized.toLowerCase();

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      inputs.push(normalized);
    }
  }

  return inputs;
}

export function getRideQuotes(origin: string, destination: string) {
  return apiRequest<RideQuoteResponse>('/ridehail/quotes', {
    method: 'POST',
    body: JSON.stringify({ origin, destination }),
  });
}

export async function compareFaresRequest(
  routeId: number,
  groupSize: number,
  fareCategory: 'adult_card' | 'student_card' | 'senior_card' = 'adult_card',
): Promise<FareComparisonResult> {
  const response = await apiRequest<FareComparisonResponse>('/fare/compare', {
    method: 'POST',
    body: JSON.stringify({
      route_id: routeId,
      group_size: groupSize,
      fare_category: fareCategory,
      sort_by: 'eta',
    }),
  });

  return {
    routeId: response.route_id,
    origin: response.origin,
    destination: response.destination,
    groupSize: response.group_size,
    fareCategory: response.fare_category,
    publicTransport: {
      mode: response.public_transport.mode,
      totalDurationMins: response.public_transport.total_duration_mins,
      totalDistanceKm: response.public_transport.total_distance_km,
      transferCount: response.public_transport.transfer_count,
      farePerPerson: Number(response.public_transport.fare_per_person ?? 0),
      fareBreakdown: response.public_transport.fare_breakdown.map((item) => ({
        segmentId: item.segment_id,
        mode: item.mode,
        transportMode: item.transport_mode,
        fromStop: item.from_stop,
        toStop: item.to_stop,
        distanceKm: Number(item.distance_km ?? 0),
        fare: typeof item.fare === 'number' ? Number(item.fare) : null,
        note: item.note,
      })),
      segmentsPriced: response.public_transport.segments_priced,
      segmentsSkipped: response.public_transport.segments_skipped,
      selectedOption: toRouteOption(response.public_transport.selected_option),
    },
    rideHailing: {
      metadata: response.ride_hailing.metadata,
      quotes: response.ride_hailing.quotes.map((quote) => ({
        provider: quote.provider,
        price: Number(quote.price ?? 0),
        eta: Number(quote.eta ?? 0),
        route: quote.route,
        bookingLink: quote.bookingLink ?? quote.booking_link,
        pricePerPerson:
          typeof quote.price_per_person === 'number'
            ? Number(quote.price_per_person)
            : undefined,
      })),
      providerUnavailable: response.ride_hailing.provider_unavailable,
      groupSizeNote: response.ride_hailing.group_size_note,
    },
    filters: {
      cheapest: response.filters.cheapest,
      fastest: {
        mode: response.filters.fastest.mode,
        provider: response.filters.fastest.provider,
        durationMins: response.filters.fastest.duration_mins,
      },
    },
  };
}
