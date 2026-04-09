import { Tick02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCards } from '@/context/CardContext';

export function JourneyCompleteSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { cards } = useCards();
  const locationState =
    typeof location.state === 'object' && location.state !== null ? location.state : null;
  const selectedCardId =
    locationState && 'cardId' in locationState && typeof locationState.cardId === 'string'
      ? locationState.cardId
      : null;
  const fareAmount =
    locationState && 'fareAmount' in locationState && typeof locationState.fareAmount === 'number'
      ? locationState.fareAmount
      : null;
  const currentCard = cards.find((card) => card.id === selectedCardId) ?? cards[0];

  return (
    <div className="page page--centered">
      <div className="success-icon" aria-hidden="true">
        <HugeiconsIcon icon={Tick02Icon} size={72} strokeWidth={1.8} />
      </div>
      <h1 className="success-title">Journey Complete</h1>
      <p className="success-subtitle">
        {fareAmount !== null ? <>Fare deducted: $${fareAmount.toFixed(2)}<br /></> : null}
        Updated Balance: ${currentCard ? currentCard.balance.toFixed(2) : '--'}
      </p>

      <button className="primary-button primary-button--pill" onClick={() => navigate('/home')}>
        Back to Home
      </button>
      <button
        className="text-muted-button"
        onClick={() =>
          navigate('/card-details', {
            replace: true,
            state: selectedCardId ? { cardId: selectedCardId } : undefined,
          })
        }
      >
        View Card
      </button>
    </div>
  );
}
