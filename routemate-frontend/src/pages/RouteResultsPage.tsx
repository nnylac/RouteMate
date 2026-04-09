import { ArrowRight01Icon, Bookmark02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteModeTabs } from '@/components/common/RouteModeTabs';
import { SearchPanel } from '@/components/common/SearchPanel';
import { TransitBadge } from '@/components/common/TransitBadge';
import { useBookmarkedRoutes } from '@/hooks/useBookmarkedRoutes';
import { getRecentSearchInputs, searchRoutes, selectRoute } from '@/lib/journeyApi';
import type { DetailedRouteOption, SavedRoute } from '@/types';

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

function getModeSummary(option: DetailedRouteOption) {
  const modes = option.segments
    .map((segment) => {
      if (segment.mode === 'BUS') return 'Bus';
      if (segment.mode === 'MRT') return 'MRT';
      return null;
    })
    .filter((value, index, array): value is string => value !== null && array.indexOf(value) === index);

  return modes.join(' · ') || 'Route';
}

function toSavedRouteSnapshot(
  origin: string,
  destination: string,
  option: DetailedRouteOption,
  routeId: number | null,
): SavedRoute {
  return {
    id: `saved-${origin}-${destination}-${option.id}`,
    routeKey: `${origin}::${destination}::${option.id}`,
    routeId: routeId !== null ? String(routeId) : undefined,
    optionId: option.id,
    modeSummary: getModeSummary(option),
    from: origin,
    to: destination,
    distanceKm: option.totalDistanceKm,
    durationLabel: `Est ${option.durationLabel}`,
    fare: Number(option.fare ?? 0),
  };
}

export function RouteResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const [routeOptions, setRouteOptions] = useState<DetailedRouteOption[]>([]);
  const [routeId, setRouteId] = useState<number | null>(null);
  const [busDuration, setBusDuration] = useState<string | null>(null);
  const [rideDuration, setRideDuration] = useState<string | null>(null);
  const [recentSearchInputs, setRecentSearchInputs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isBookmarked, toggleBookmark } = useBookmarkedRoutes();

  useEffect(() => {
    let isCancelled = false;

    async function loadRecentSearchInputs() {
      try {
        const inputs = await getRecentSearchInputs();

        if (!isCancelled) {
          setRecentSearchInputs(inputs);
        }
      } catch {
        if (!isCancelled) {
          setRecentSearchInputs([]);
        }
      }
    }

    void loadRecentSearchInputs();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadJourneyData() {
      if (!isCancelled) {
        setIsLoading(true);
        setRouteOptions([]);
        setRouteId(null);
        setBusDuration(null);
        setRideDuration(null);
      }

      if (!origin.trim() || !destination.trim()) {
        if (!isCancelled) {
          setIsLoading(false);
        }
        return;
      }

      const routeResult = await searchRoutes(origin, destination)
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (isCancelled) {
        return;
      }

      if (routeResult.status === 'fulfilled') {
        const routeResponse = routeResult.value;
        setRouteId(routeResponse.route_id);

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
      <SearchPanel from={origin} to={destination} recentSearches={recentSearchInputs} />

      <RouteModeTabs
        active="routes"
        origin={origin}
        destination={destination}
        busDuration={busDuration}
        rideDuration={rideDuration}
        routeId={routeId}
      />

      <div className="stack-md">
        {isLoading ? <div className="empty-state">Loading routes...</div> : null}

        {!isLoading && (!origin.trim() || !destination.trim()) ? (
          <div className="empty-state">Enter both origin and destination to search for routes.</div>
        ) : null}

        {!isLoading && origin.trim() && destination.trim() && visibleRouteOptions.length === 0 ? (
          <div className="empty-state">No route options found.</div>
        ) : null}

        {visibleRouteOptions.map((option) => {
          const routeKey = `${origin}::${destination}::${option.id}`;
          const bookmarked = isBookmarked(routeKey);
          const savedRouteSnapshot = toSavedRouteSnapshot(origin, destination, option, routeId);
          const targetPath = `/route-details?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&optionId=${encodeURIComponent(option.id)}${routeId !== null ? `&routeId=${encodeURIComponent(String(routeId))}` : ''}`;

          return (
            <div
              key={option.id}
              className="route-option"
              role="button"
              tabIndex={0}
              onClick={() => {
                const proceed = async () => {
                  if (routeId !== null) {
                    await selectRoute(routeId, option.id);
                  }
                  navigate(targetPath);
                };

                void proceed();
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  const proceed = async () => {
                    if (routeId !== null) {
                      await selectRoute(routeId, option.id);
                    }
                    navigate(targetPath);
                  };

                  void proceed();
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
                  toggleBookmark(routeKey, savedRouteSnapshot);
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
