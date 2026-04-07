import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useCards } from '@/context/CardContext';
import { useNavigate } from 'react-router-dom';

export function TopUpSuccessPage() {
  const navigate = useNavigate();
  const { cards, latestTopUpAmount } = useCards();
  const currentCard = cards[0];

  return (
    <div className="page page--centered">
      <div className="success-icon" aria-hidden="true">
        <HugeiconsIcon icon={Tick02Icon} size={72} strokeWidth={1.8} />
      </div>
      <h1 className="success-title">Top Up Successful</h1>
      <p className="success-subtitle">
        {latestTopUpAmount !== null ? `Added $${latestTopUpAmount.toFixed(2)}. ` : ''}
        Updated Balance: ${currentCard ? currentCard.balance.toFixed(2) : '--'}
      </p>

      <button className="primary-button primary-button--pill" onClick={() => navigate('/home')}>
        Back to Home
      </button>
    </div>
  );
}
