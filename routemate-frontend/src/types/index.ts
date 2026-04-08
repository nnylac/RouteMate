export type NavItemKey = 'home' | 'routes' | 'cards' | 'profile';
export type CardType = 'adult' | 'student' | 'senior';

export interface SavedRoute {
  id: string;
  modeSummary: string;
  from: string;
  to: string;
  distanceKm: number;
  durationLabel: string;
  fare: number;
  routeId?: string;
  optionId?: string;
}

export interface CardInfo {
  id: string;
  label: string;
  balance: number;
  cardNumber: string;
  cardType: CardType;
}

export interface RouteOption {
  id: string;
  durationLabel: string;
  badges: RouteBadge[];
  fare?: number | null;
  arrivalTime?: string;
}

export interface RouteSegmentDetail {
  segmentId: number;
  mode: 'WALK' | 'BUS' | 'MRT' | 'DRIVING';
  fromStop: string | null;
  toStop: string | null;
  durationMins: number;
  distanceKm: number;
  lineOrService: string | null;
  segmentOrder: number;
  arrivalTiming?: string | null;
}

export interface RouteFareByCategory {
  incremental: number;
  cumulative: number;
}

export interface RouteFareSegmentDetail {
  segmentId: number;
  segmentOrder: number;
  mode: 'BUS' | 'MRT';
  lineOrService: string | null;
  distanceKm: number;
  cumulativeDistanceKm: number;
  fareBasisMode: string | null;
  fares: {
    adultCard: RouteFareByCategory;
    studentCard: RouteFareByCategory;
    seniorCard: RouteFareByCategory;
  };
}

export interface RouteFareBreakdown {
  fareBasisMode: string | null;
  totals: {
    adultCard: number;
    studentCard: number;
    seniorCard: number;
  };
  segments: RouteFareSegmentDetail[];
}

export interface DetailedRouteOption extends RouteOption {
  summary?: string;
  totalDurationMins: number;
  totalDistanceKm: number;
  transferCount: number;
  isPublicTransport: boolean;
  segments: RouteSegmentDetail[];
  fares?: RouteFareBreakdown | null;
}

export interface RouteBadge {
  kind: 'walk' | 'bus' | 'mrt';
  value: string;
}

export interface JourneyStop {
  id: string;
  title: string;
  subtitle?: string;
  eta?: string;
  duration?: string;
}
