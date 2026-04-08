import { ArrowRight01Icon, Bookmark02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteModeTabs } from '@/components/common/RouteModeTabs';
import { SearchPanel } from '@/components/common/SearchPanel';
import { TransitBadge } from '@/components/common/TransitBadge';
import { recentSearches } from '@/data/mockData';
import { useBookmarkedRoutes } from '@/hooks/useBookmarkedRoutes';
import { searchRoutes } from '@/lib/journeyApi';
import type { DetailedRouteOption } from '@/types';

function renderDurationParts(durationLabel: string) {
  const normalized = durationLabel.trim();
  const hourMatch = normalized.match(/^(\d+h)\s*(\d+)\s*min$/i);

  if (hourMatch) {
    return (
      <>
        <span className="route-option__duration-primary">{hourMatch[1]}</span>
        <span className="route-option__duration-secondary">{hourMatch[2]}min</span>
      </>
    );
  }

  const minuteMatch = normalized.match(/^(\d+)\s*min$/i);
  if (minuteMatch) {
    return (
      <>
        <span className="route-option__duration-primary">{minuteMatch[1]}</span>
        <span className="route-option__duration-secondary">min</span>
      </>
    );
  }

  return <span className="route-option__duration-primary">{normalized}</span>;
}

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60} min`;
  }

  return `${minutes} min`;
}

export function RouteResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? 'Jurong East';
  const destination = searchParams.get('destination') ?? 'SMU';
  const [routeOptions, setRouteOptions] = useState<DetailedRouteOption[]>([]);
  const [busDuration, setBusDuration] = useState<string | null>(null);
  const [rideDuration, setRideDuration] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmarkedRoutes();

  useEffect(() => {
    let isCancelled = false;

    async function loadJourneyData() {
      if (!isCancelled) {
        setIsLoading(true);
        setRouteOptions([]);
        setBusDuration(null);
        setRideDuration(null);
      }

      const routeResult = await searchRoutes(origin, destination)
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (isCancelled) {
        return;
      }

      if (routeResult.status === 'fulfilled') {
        const routeResponse = routeResult.value;

        if (routeResponse.routeOptions.length > 0) {
          setRouteOptions(routeResponse.routeOptions);
        }

        if (routeResponse.quickestDuration !== null) {
          setBusDuration(formatDuration(routeResponse.quickestDuration));
        }

        if (routeResponse.drivingDuration !== null) {
          setRideDuration(formatDuration(routeResponse.drivingDuration));
        }
      }

      if (!isCancelled) {
        setIsLoading(false);
      }
    }

    void loadJourneyData();

    return () => {
      isCancelled = true;
    };
  }, [destination, origin]);

  const visibleRouteOptions = useMemo(() => routeOptions, [routeOptions]);

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from={origin} to={destination} recentSearches={recentSearches} />

      <RouteModeTabs
        active="routes"
        origin={origin}
        destination={destination}
        busDuration={busDuration}
        rideDuration={rideDuration}
      />

      <div className="stack-md">
        {isLoading ? <div className="empty-state">Loading routes...</div> : null}

        {!isLoading && visibleRouteOptions.length === 0 ? (
          <div className="empty-state">No route options found.</div>
        ) : null}

        {visibleRouteOptions.map((option) => {
          const routeKey = `${origin}::${destination}::${option.id}`;
          const bookmarked = isBookmarked(routeKey);

          return (
            <div
              key={option.id}
              className="route-option"
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(
                  `/route-details?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&optionId=${encodeURIComponent(option.id)}`,
                )
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  navigate(
                    `/route-details?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&optionId=${encodeURIComponent(option.id)}`,
                  );
                }
              }}
            >
            <div className="route-option__left">
              <div className="route-option__duration">
                {renderDurationParts(option.durationLabel)}
              </div>
            </div>

            <div className="route-option__mid">
              {option.badges.map((badge, index) => (
                <div
                  key={`${option.id}-${badge.kind}-${badge.value}-${index}`}
                  className="route-option__mid-item"
                >
                  <TransitBadge badge={badge} />
                  {index < option.badges.length - 1 ? (
                    <span className="route-option__mid-separator" aria-hidden="true">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={24} strokeWidth={2} />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="route-option__right">
              <button
                className={`bookmark-button ${bookmarked ? 'bookmark-button--active' : ''}`}
                type="button"
                aria-label="Save route"
                aria-pressed={bookmarked}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleBookmark(routeKey);
                }}
              >
                <HugeiconsIcon
                  icon={Bookmark02Icon}
                  size={18}
                  strokeWidth={1.8}
                  fill={bookmarked ? 'currentColor' : 'none'}
                />
              </button>
              <span className="fare-badge">
                {option.fare ? `$ ${option.fare.toFixed(2)}` : '-'}
              </span>
            </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
