import { createContext, ReactNode, useContext, useMemo, useState } from 'react';
import { cards as initialCards } from '@/data/mockData';
import { CardInfo } from '@/types';

interface CardContextValue {
  cards: CardInfo[];
  latestTopUpAmount: number | null;
  topUpCard: (cardId: string, amount: number) => void;
}

const CardContext = createContext<CardContextValue | null>(null);

export function CardProvider({ children }: { children: ReactNode }) {
  const [cards, setCards] = useState<CardInfo[]>(initialCards);
  const [latestTopUpAmount, setLatestTopUpAmount] = useState<number | null>(null);

  function topUpCard(cardId: string, amount: number) {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              balance: Number((card.balance + amount).toFixed(2)),
            }
          : card,
      ),
    );
    setLatestTopUpAmount(amount);
  }

  const value = useMemo(
    () => ({
      cards,
      latestTopUpAmount,
      topUpCard,
    }),
    [cards, latestTopUpAmount],
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
