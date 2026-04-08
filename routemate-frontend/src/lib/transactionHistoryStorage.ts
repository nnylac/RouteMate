import type { DetailedRouteOption } from '@/types';

const STORAGE_KEY = 'routemate-transaction-metadata';

export interface TransactionMetadata {
  transactionId: number | string;
  cardId: string;
  category: 'Public Transport' | 'Ride-Hailing' | 'Top Up';
  title: string;
  route: string;
  routeBreakdown?: DetailedRouteOption;
}

function normalizeTransactionId(transactionId: number | string) {
  return String(transactionId);
}

function readAllMetadata() {
  const rawValue = localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [] as TransactionMetadata[];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? (parsed as TransactionMetadata[]) : [];
  } catch {
    return [];
  }
}

function writeAllMetadata(items: TransactionMetadata[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function saveTransactionMetadata(metadata: TransactionMetadata) {
  const nextItems = [
    metadata,
    ...readAllMetadata().filter(
      (item) => normalizeTransactionId(item.transactionId) !== normalizeTransactionId(metadata.transactionId),
    ),
  ].slice(0, 100);

  writeAllMetadata(nextItems);
}

export function getTransactionMetadata(transactionId: number | string) {
  const normalizedTransactionId = normalizeTransactionId(transactionId);
  return (
    readAllMetadata().find(
      (item) => normalizeTransactionId(item.transactionId) === normalizedTransactionId,
    ) ?? null
  );
}
