import { apiRequest } from '@/lib/api';
import type { CardInfo } from '@/types';

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
  cardType: 'adult' | 'student' | 'senior';
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
