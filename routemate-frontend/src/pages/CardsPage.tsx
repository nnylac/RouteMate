import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CardPreview } from '@/components/common/CardPreview';
import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { SegmentTabs } from '@/components/common/SegmentTabs';
import { useCards } from '@/context/CardContext';
import { useNavigate } from 'react-router-dom';

export function CardsPage() {
  const navigate = useNavigate();
  const { cards, isLoading, errorMessage } = useCards();

  function handleTabChange(tab: string) {
    if (tab === 'My Cards') {
      return;
    }

    navigate(tab === 'Saved Routes' ? '/home?tab=saved' : '/home');
  }

  return (
    <div className="page">
      <PageTopBar title="Home" titleAlign="left" />
      <SearchPanel />
      <SegmentTabs
        items={['Recent', 'Saved Routes', 'My Cards']}
        active="My Cards"
        onChange={handleTabChange}
      />

      <div className="stack-lg">
        {isLoading ? <div className="empty-state">Loading cards...</div> : null}

        {!isLoading && cards.length === 0 ? (
          <section className="empty-state">
            <h2 className="section-title">No cards yet</h2>
            <p className="section-subtitle">Create your first card to start topping up and tracking balance.</p>
            {errorMessage ? (
              <div className="auth-message auth-message--error" role="alert">
                {errorMessage}
              </div>
            ) : null}
            <button type="button" className="primary-button primary-button--pill" onClick={() => navigate('/cards/add')}>
              Add Your First Card
            </button>
          </section>
        ) : null}

        {!isLoading && cards.length > 0
          ? cards.map((card) => (
              <button
                key={card.id}
                type="button"
                className="card-link-button"
                onClick={() => navigate('/card-details', { state: { cardId: card.id } })}
              >
                <CardPreview card={card} />
              </button>
            ))
          : null}

        <button type="button" className="floating-add-button" aria-label="Add card" onClick={() => navigate('/cards/add')}>
          <HugeiconsIcon icon={PlusSignIcon} size={24} strokeWidth={1.8} />
        </button>
      </div>
    </div>
  );
}
