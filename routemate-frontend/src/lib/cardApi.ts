import { apiRequest } from '@/lib/api';
import type { CardInfo, CardType } from '@/types';

interface BackendCard {
  _id: string;
  userId: string;
  cardNumber: string;
  cardType: string;
  balance: number;
  status: string;
}

function formatCardNumber(cardNumber: string) {
  return cardNumber
    .replace(/\D/g, '')
    .replace(/(.{4})(?=.)/g, '$1 ')
    .trim();
}

function toCardInfo(card: BackendCard, index: number): CardInfo {
  return {
    id: card._id,
    label: index === 0 ? 'my card' : `card ${index + 1}`,
    balance: Number(card.balance ?? 0),
    cardNumber: formatCardNumber(card.cardNumber),
    cardType: (card.cardType ?? 'adult') as CardType,
  };
}

export async function getCardsByUser(userId: string): Promise<CardInfo[]> {
  const cards = await apiRequest<BackendCard[]>(
    `/card-orchestrator/cards/user/${userId}`,
  );
  return cards.map((card, index) => toCardInfo(card, index));
}

export async function createCard(payload: {
  userId: string;
  cardType: CardType;
}): Promise<CardInfo> {
  const card = await apiRequest<BackendCard>('/card-orchestrator/cards', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return toCardInfo(card, 0);
}

export async function topUpCardRequest(
  cardId: string,
  amount: number,
): Promise<CardInfo> {
  const card = await apiRequest<BackendCard>(
    `/card-orchestrator/cards/${cardId}/topup`,
    {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    },
  );

  return toCardInfo(card, 0);
}

export async function deductFareRequest(
  cardId: string,
  amount: number,
): Promise<CardInfo> {
  const card = await apiRequest<BackendCard>(
    `/card-orchestrator/cards/${cardId}/deduct`,
    {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    },
  );

  return toCardInfo(card, 0);
}

export interface TransactionRecord {
  Id: number;
  UserId: string | number;
  TransactionType: string;
  CardId: string;
  Amount: number;
  Status: string;
  Reference?: string;
  PaymentReference?: string;
  FailureReason?: string;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export function createTransactionRequest(payload: {
  userId: string | number;
  cardId: string;
  amount: number;
  transactionType: 'top_up' | 'payment' | 'refund';
  status: 'pending' | 'success' | 'failed' | 'rolled_back';
  reference?: string;
  paymentReference?: string;
  failureReason?: string;
}) {
  return apiRequest<TransactionRecord>('/card-orchestrator/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTransactionStatusRequest(
  transactionId: number,
  payload: {
    status: 'pending' | 'success' | 'failed' | 'rolled_back';
    failureReason?: string;
    transactionType?: 'top_up' | 'payment' | 'refund';
    cardId?: string;
    userId?: string | number;
    amount?: number;
  },
) {
  return apiRequest<TransactionRecord>(
    `/card-orchestrator/transactions/${transactionId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function getTransactionRecordsRequest(
  userId: string | number,
  cardId: string,
) {
  return apiRequest<TransactionRecord[]>(
    `/card-orchestrator/transactions/${encodeURIComponent(String(userId))}/${encodeURIComponent(cardId)}`,
  );
}
