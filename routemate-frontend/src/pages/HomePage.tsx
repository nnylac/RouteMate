import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteCard } from '@/components/common/RouteCard';
import { SearchPanel } from '@/components/common/SearchPanel';
import { SegmentTabs } from '@/components/common/SegmentTabs';
import { recentSearches, savedRoutes } from '@/data/mockData';
import { getRecentSelectedRoutes } from '@/lib/journeyApi';
import type { SavedRoute } from '@/types';

const tabs = ['Recent', 'Saved Routes', 'My Cards'];

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'saved' ? 'Saved Routes' : 'Recent';
  const [recentRoutes, setRecentRoutes] = useState<SavedRoute[]>([]);
  const [isLoadingRecentRoutes, setIsLoadingRecentRoutes] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadRecentRoutes() {
      try {
        const routes = await getRecentSelectedRoutes();

        if (!isCancelled) {
          setRecentRoutes(routes);
        }
      } catch {
        if (!isCancelled) {
          setRecentRoutes([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRecentRoutes(false);
        }
      }
    }

    void loadRecentRoutes();

    return () => {
      isCancelled = true;
    };
  }, []);

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
        {activeTab === 'Recent' && isLoadingRecentRoutes ? (
          <div className="empty-state">Loading recent routes...</div>
        ) : null}

        {activeTab === 'Recent' && !isLoadingRecentRoutes && routesToDisplay.length === 0 ? (
          <div className="empty-state">No recent selected routes yet.</div>
        ) : null}

        {routesToDisplay.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </div>
    </div>
  );
}
