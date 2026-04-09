import { CardInfo, JourneyStop, RouteOption, SavedRoute } from '@/types';

export const recentSearches = [
  'Ang Mo Kio',
  'Orchard',
  'Punggol',
  'Jurong East',
  'HarbourFront',
  'Bugis',
];

export const recentRoutes: SavedRoute[] = [
  {
    id: 'recent-1',
    modeSummary: 'Bus · MRT',
    from: 'Jurong East',
    to: 'SMU',
    distanceKm: 15.4,
    durationLabel: 'Est 44 min',
    fare: 2.02,
  },
  {
    id: 'recent-2',
    modeSummary: 'MRT · Bus · Bus',
    from: 'Tampines',
    to: 'SMU',
    distanceKm: 18.1,
    durationLabel: 'Est 52 min',
    fare: 2.02,
  },
  {
    id: 'recent-3',
    modeSummary: 'Bus · Bus',
    from: 'Hougang',
    to: 'SMU',
    distanceKm: 16.2,
    durationLabel: 'Est 1h 11 min',
    fare: 1.92,
  },
  {
    id: 'recent-4',
    modeSummary: 'MRT · Bus · Bus',
    from: 'Woodlands',
    to: 'SMU',
    distanceKm: 19.7,
    durationLabel: 'Est 52 min',
    fare: 2.02,
  },
];

export const savedRoutes: SavedRoute[] = [
  {
    id: 'saved-1',
    modeSummary: 'MRT · Bus',
    from: 'Bedok',
    to: 'SMU',
    distanceKm: 14.6,
    durationLabel: 'Est 43 min',
    fare: 1.98,
  },
  {
    id: 'saved-2',
    modeSummary: 'Bus · MRT',
    from: 'Paya Lebar',
    to: 'Jurong East',
    distanceKm: 21.1,
    durationLabel: 'Est 58 min',
    fare: 2.08,
  },
  {
    id: 'saved-3',
    modeSummary: 'Bus · Bus',
    from: 'Pasir Ris',
    to: 'Bugis',
    distanceKm: 17.9,
    durationLabel: 'Est 47 min',
    fare: 1.59,
  },
];

export const cards: CardInfo[] = [
  {
    id: '1',
    label: 'my card',
    balance: 24.67,
    cardNumber: '1000 2000 3000 4567',
    cardType: 'adult',
  },
];

export const routeOptions: RouteOption[] = [
  {
    id: '1',
    durationLabel: '44 min',
    badges: [
      { kind: 'walk', value: '6' },
      { kind: 'mrt', value: 'EW' },
      { kind: 'bus', value: '190' },
    ],
    fare: null,
  },
  {
    id: '2',
    durationLabel: '52 min',
    badges: [
      { kind: 'walk', value: '10' },
      { kind: 'mrt', value: 'TE' },
      { kind: 'bus', value: '190' },
      { kind: 'bus', value: '867' },
    ],
    fare: 2.02,
  },
  {
    id: '3',
    durationLabel: '1h 11 min',
    badges: [
      { kind: 'walk', value: '18' },
      { kind: 'bus', value: '53' },
      { kind: 'bus', value: '123' },
    ],
    fare: 1.92,
  },
  {
    id: '4',
    durationLabel: '52 min',
    badges: [
      { kind: 'walk', value: '10' },
      { kind: 'mrt', value: 'TE' },
      { kind: 'bus', value: '190' },
      { kind: 'bus', value: '867' },
    ],
    fare: 2.02,
  },
];

export const journeyStops: JourneyStop[] = [
  {
    id: '1',
    title: 'Jurong East',
    subtitle: 'EW · Pasir Ris',
    eta: 'In 2 min',
    duration: '24 mins',
  },
  {
    id: '2',
    title: 'Walk',
    subtitle: '5 min transfer',
  },
  {
    id: '3',
    title: 'SMU',
  },
];

export const rideHailingOptions = [
  { id: '1', provider: 'Grab', eta: '6 mins away', price: 16.7 },
  { id: '2', provider: 'Gojek', eta: '7 mins away', price: 17.2 },
  { id: '3', provider: 'Tada', eta: '10 mins away', price: 12.5 },
  { id: '4', provider: 'ComfortDelGro', eta: '6 mins away', price: 16.2 },
];

export const transactions = [
  {
    id: '1',
    category: 'Public Transport',
    title: 'Train Service',
    amount: -1.99,
    route: 'Jurong East → SMU',
  },
  {
    id: '2',
    category: 'Ride-Hailing',
    title: 'Grab',
    amount: -20.26,
    route: 'Changi Airport → Punggol Coast',
  },
  {
    id: '3',
    category: 'Public Transport',
    title: 'Train Service',
    amount: -1.99,
    route: 'Jurong East → SMU',
  },
];
