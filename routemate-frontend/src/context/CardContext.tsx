import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { createCard as createCardRequest, getCardsByUser, topUpCardRequest } from '@/lib/cardApi';
import type { User } from '@/lib/userApi';
import type { CardInfo, CardType } from '@/types';

interface CardContextValue {
  cards: CardInfo[];
  isLoading: boolean;
  errorMessage: string;
  latestTopUpAmount: number | null;
  refreshCards: () => Promise<void>;
  createCard: (cardType: CardType) => Promise<CardInfo>;
  topUpCard: (cardId: string, amount: number) => Promise<void>;
}

const CardContext = createContext<CardContextValue | null>(null);

export function CardProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [cards, setCards] = useState<CardInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [latestTopUpAmount, setLatestTopUpAmount] = useState<number | null>(null);

  const refreshCards = useCallback(async () => {
    const storedUser = localStorage.getItem('routemate-user');

    if (!storedUser) {
      setCards([]);
      setErrorMessage('');
      return;
    }

    try {
      const user = JSON.parse(storedUser) as User;

      if (!user.id) {
        setCards([]);
        return;
      }

      setIsLoading(true);
      setErrorMessage('');
      const nextCards = await getCardsByUser(user.id);
      setCards(nextCards);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load cards.';
      setErrorMessage(message);
      setCards([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshCards();
  }, [location.pathname, refreshCards]);

  async function createCard(cardType: CardType) {
    const storedUser = localStorage.getItem('routemate-user');

    if (!storedUser) {
      throw new Error('No signed-in user found. Please log in again.');
    }

    const user = JSON.parse(storedUser) as User;
    const createdCard = await createCardRequest({
      userId: user.id,
      cardType,
    });

    setCards((currentCards) => {
      const nextCards = [...currentCards, createdCard];
      return nextCards.map((card, index) => ({
        ...card,
        label: index === 0 ? 'my card' : `card ${index + 1}`,
      }));
    });
    setErrorMessage('');
    return createdCard;
  }

  async function topUpCard(cardId: string, amount: number) {
    const updatedCard = await topUpCardRequest(cardId, amount);
    setCards((currentCards) =>
      currentCards.map((card, index) =>
        card.id === cardId
          ? {
              ...updatedCard,
              label: index === 0 ? 'my card' : `card ${index + 1}`,
            }
          : card,
      ),
    );
    setLatestTopUpAmount(amount);
  }

  const value = useMemo(
    () => ({
      cards,
      isLoading,
      errorMessage,
      latestTopUpAmount,
      refreshCards,
      createCard,
      topUpCard,
    }),
    [cards, errorMessage, isLoading, latestTopUpAmount, refreshCards],
  );

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>;
}

export function useCards() {
  const context = useContext(CardContext);

  if (!context) {
    throw new Error('useCards must be used within a CardProvider');
  }

  return context;
}
