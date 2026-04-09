import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteCard } from '@/components/common/RouteCard';
import { SearchPanel } from '@/components/common/SearchPanel';
import { SegmentTabs } from '@/components/common/SegmentTabs';
import { recentSearches } from '@/data/mockData';
import { useBookmarkedRoutes } from '@/hooks/useBookmarkedRoutes';
import { getRecentSelectedRoutes } from '@/lib/journeyApi';
import type { SavedRoute } from '@/types';

const tabs = ['Recent', 'Saved Routes', 'My Cards'];

export function HomePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') === 'saved' ? 'Saved Routes' : 'Recent';
  const [recentRoutes, setRecentRoutes] = useState<SavedRoute[]>([]);
  const [isLoadingRecentRoutes, setIsLoadingRecentRoutes] = useState(true);
  const { bookmarks, bookmarkedRoutes, isBookmarked, toggleBookmark } = useBookmarkedRoutes();

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

  const savedRoutes = useMemo(() => {
    const savedRouteMap = new Map<string, SavedRoute>();

    bookmarkedRoutes.forEach((route) => {
      if (route.routeKey) {
        savedRouteMap.set(route.routeKey, route);
      }
    });

    recentRoutes.forEach((route) => {
      if (route.routeKey && bookmarks.includes(route.routeKey) && !savedRouteMap.has(route.routeKey)) {
        savedRouteMap.set(route.routeKey, route);
      }
    });

    return Array.from(savedRouteMap.values());
  }, [bookmarkedRoutes, bookmarks, recentRoutes]);

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

        {activeTab === 'Saved Routes' && routesToDisplay.length === 0 ? (
          <div className="empty-state">No saved routes yet.</div>
        ) : null}

        {routesToDisplay.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            showBookmark={Boolean(route.routeKey)}
            bookmarked={route.routeKey ? isBookmarked(route.routeKey) : false}
            onToggleBookmark={(savedRoute) => {
              if (savedRoute.routeKey) {
                toggleBookmark(savedRoute.routeKey, savedRoute);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}
