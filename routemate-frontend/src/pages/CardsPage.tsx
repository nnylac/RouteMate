import { PlusSignIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { CardPreview } from '@/components/common/CardPreview';
import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { SegmentTabs } from '@/components/common/SegmentTabs';
import { useCards } from '@/context/CardContext';
import { recentSearches } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export function CardsPage() {
  const navigate = useNavigate();
  const { cards } = useCards();

  function handleTabChange(tab: string) {
    if (tab === 'My Cards') {
      return;
    }

    navigate(tab === 'Saved Routes' ? '/home?tab=saved' : '/home');
  }

  return (
    <div className="page">
      <PageTopBar title="Home" titleAlign="left" />
      <SearchPanel recentSearches={recentSearches} />
      <SegmentTabs
        items={['Recent', 'Saved Routes', 'My Cards']}
        active="My Cards"
        onChange={handleTabChange}
      />

      <button className="card-link-button" onClick={() => navigate('/card-details')}>
        <CardPreview card={cards[0]} />
      </button>

      <button className="floating-add-button" aria-label="Add card">
        <HugeiconsIcon icon={PlusSignIcon} size={24} strokeWidth={1.8} />
      </button>
    </div>
  );
}
