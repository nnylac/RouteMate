import { AddMoneyCircleIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CardPreview } from '@/components/common/CardPreview';
import { PageTopBar } from '@/components/common/PageTopBar';
import { TransactionItem } from '@/components/common/TransactionItem';
import { useCards } from '@/context/CardContext';
import { transactions } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export function CardDetailsPage() {
  const navigate = useNavigate();
  const { cards } = useCards();

  return (
    <div className="page">
      <PageTopBar title="My Cards" titleAlign="left" showBack showNotifications={false} />
      <div className="card-detail-header page-section">
        <CardPreview card={cards[0]} />
        <button className="top-right-action" onClick={() => navigate('/top-up')} aria-label="Top up card">
          <HugeiconsIcon icon={AddMoneyCircleIcon} size={24} strokeWidth={1.8} />
        </button>
      </div>

      <h2 className="section-title">Transactions</h2>
      <div className="section-subtitle">01-Apr-2026</div>

      <div className="stack-sm page-section">
        {transactions.map((transaction) => (
          <TransactionItem key={transaction.id} {...transaction} />
        ))}
      </div>
    </div>
  );
}
