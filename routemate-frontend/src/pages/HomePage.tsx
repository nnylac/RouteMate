import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteCard } from '@/components/common/RouteCard';
import { SearchPanel } from '@/components/common/SearchPanel';
import { SegmentTabs } from '@/components/common/SegmentTabs';
import { recentRoutes, recentSearches, savedRoutes } from '@/data/mockData';

const tabs = ['Recent', 'Saved Routes', 'My Cards'];

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'saved' ? 'Saved Routes' : 'Recent';

  function handleTabChange(tab: string) {
    if (tab === 'My Cards') {
      navigate('/cards');
      return;
    }

    setSearchParams(tab === 'Saved Routes' ? { tab: 'saved' } : {});
  }

  const routesToDisplay = activeTab === 'Saved Routes' ? savedRoutes : recentRoutes;

  return (
    <div className="page">
      <PageTopBar title="Home" titleAlign="left" />
      <SearchPanel recentSearches={recentSearches} />
      <SegmentTabs items={tabs} active={activeTab} onChange={handleTabChange} />

      <div className="stack-lg">
        {routesToDisplay.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
