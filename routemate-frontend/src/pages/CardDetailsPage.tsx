import { useEffect, useState } from 'react';
import { AddMoneyCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CardPreview } from '@/components/common/CardPreview';
import { PageTopBar } from '@/components/common/PageTopBar';
import { TransactionItem } from '@/components/common/TransactionItem';
import { useCards } from '@/context/CardContext';
import { readStoredUser } from '@/lib/authStorage';
import { getTransactionRecordsRequest } from '@/lib/cardApi';
import { getTransactionMetadata } from '@/lib/transactionHistoryStorage';
import type { DetailedRouteOption } from '@/types';

interface TransactionDisplayItem {
  id: string;
  category: string;
  title: string;
  amount: number;
  route: string | null;
  status: string;
  createdAt: string | null;
  transactionType: string;
  routeBreakdown?: DetailedRouteOption;
}

interface TransactionSection {
  dateLabel: string;
  items: TransactionDisplayItem[];
}

function getTransactionBreakdown(option?: DetailedRouteOption) {
  if (!option?.fares || option.fares.segments.length === 0) {
    return [];
  }

  return option.fares.segments.map((fareSegment) => {
    const matchingSegment = option.segments.find(
      (segment) => segment.segmentId === fareSegment.segmentId,
    );

    return {
      id: `fare-segment-${fareSegment.segmentId}`,
      from: matchingSegment?.fromStop ?? 'Unknown stop',
      to: matchingSegment?.toStop ?? 'Unknown stop',
      amount: fareSegment.fares.adultCard.incremental,
    };
  });
}

function formatTransactionDate(value: string | null) {
  if (!value) {
    return 'Unknown Date';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Unknown Date';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date);
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function CardDetailsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cards } = useCards();
  const [transactions, setTransactions] = useState<TransactionDisplayItem[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const selectedCardId =
    typeof location.state === 'object' &&
    location.state !== null &&
    'cardId' in location.state &&
    typeof location.state.cardId === 'string'
      ? location.state.cardId
      : null;
  const currentCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  useEffect(() => {
    let isCancelled = false;

    async function loadTransactions() {
      if (!currentCard) {
        setTransactions([]);
        setIsLoadingTransactions(false);
        return;
      }

      const storedUser = readStoredUser();

      if (!storedUser) {
        setTransactions([]);
        setIsLoadingTransactions(false);
        return;
      }

      try {
        const records = await getTransactionRecordsRequest(storedUser.id, currentCard.id);

        if (isCancelled) {
          return;
        }

        const nextTransactions = records
          .slice()
          .sort((left, right) => {
            const leftTime = left.CreatedAt ? new Date(left.CreatedAt).getTime() : 0;
            const rightTime = right.CreatedAt ? new Date(right.CreatedAt).getTime() : 0;
            return rightTime - leftTime;
          })
          .map((record) => {
            const metadata = getTransactionMetadata(record.Id);

            return {
              id: String(record.Id),
              category:
                metadata?.category ??
                (record.TransactionType === 'top_up'
                  ? 'Top Up'
                  : record.TransactionType === 'payment'
                    ? 'Public Transport'
                    : 'Transaction'),
              title:
                metadata?.title ??
                (record.TransactionType === 'top_up' ? 'Top Up' : record.TransactionType),
              amount: Number(record.Amount ?? 0),
              route: record.TransactionType === 'top_up' ? null : (metadata?.route ?? 'No route details available'),
              status: record.Status,
              createdAt: record.CreatedAt ?? null,
              transactionType: record.TransactionType,
              routeBreakdown: metadata?.routeBreakdown,
            };
          });

        setTransactions(nextTransactions);
      } catch {
        if (!isCancelled) {
          setTransactions([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingTransactions(false);
        }
      }
    }

    void loadTransactions();

    return () => {
      isCancelled = true;
    };
  }, [currentCard]);

  const transactionSections = transactions.reduce<TransactionSection[]>((sections, transaction) => {
    const dateLabel = formatTransactionDate(transaction.createdAt);
    const currentSection = sections.find((section) => section.dateLabel === dateLabel);

    if (currentSection) {
      currentSection.items.push(transaction);
      return sections;
    }

    return [...sections, { dateLabel, items: [transaction] }];
  }, []);

  if (!currentCard) {
    return (
      <div className="page">
        <PageTopBar title="My Cards" titleAlign="left" showBack showNotifications={false} />
        <section className="empty-state page-section">
          <h2 className="section-title">No card found</h2>
          <p className="section-subtitle">Create a card first before viewing card details.</p>
          <button type="button" className="primary-button primary-button--pill" onClick={() => navigate('/cards/add')}>
            Add Card
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <PageTopBar title="My Cards" titleAlign="left" showBack showNotifications={false} />
      <div className="card-detail-header page-section">
        <CardPreview card={currentCard} />
        <button
          type="button"
          className="top-right-action"
          onClick={() => navigate('/top-up', { state: { cardId: currentCard.id } })}
          aria-label="Top up card"
        >
          <HugeiconsIcon icon={AddMoneyCircleIcon} size={24} strokeWidth={1.8} />
        </button>
      </div>

      <h2 className="section-title">Transactions</h2>

      <div className="stack-sm page-section card-details__transactions">
        {!isLoadingTransactions && transactions.length === 0 ? (
          <div className="empty-state">No transactions for this card yet.</div>
        ) : null}

        {isLoadingTransactions ? <div className="section-subtitle">Loading...</div> : null}

        {transactionSections.map((section) => (
          <div key={section.dateLabel} className="stack-sm">
            <div className="section-subtitle">{section.dateLabel}</div>
            {section.items.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                {...transaction}
                isCredit={transaction.transactionType === 'top_up'}
                breakdownItems={getTransactionBreakdown(transaction.routeBreakdown)}
                showViewMore={transaction.category !== 'Top Up'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
