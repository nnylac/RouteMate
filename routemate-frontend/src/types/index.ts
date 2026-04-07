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
  badges: string[];
  fare?: number | null;
  arrivalTime?: string;
}

export interface JourneyStop {
  id: string;
  title: string;
  subtitle?: string;
  eta?: string;
  duration?: string;
}
