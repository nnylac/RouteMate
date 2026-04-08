import {
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Bookmark02Icon,
  WalkingIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { TransitBadge } from '@/components/common/TransitBadge';
import { recentSearches } from '@/data/mockData';
import { useBookmarkedRoutes } from '@/hooks/useBookmarkedRoutes';
import { searchRoutes } from '@/lib/journeyApi';
import type { DetailedRouteOption, RouteBadge, RouteSegmentDetail } from '@/types';

interface SegmentCardData {
  id: string;
  title: string;
  subtitle?: string;
  durationLabel: string;
  marker: 'start' | 'walk' | 'stop';
  detailRows: string[];
}

function formatDurationLabel(minutes: number) {
  return `${minutes} min${minutes === 1 ? '' : 's'}`;
}

function formatDurationSummary(minutes: number) {
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60} min`;
  }

  return `${minutes} min`;
}

function getHeaderBadges(option: DetailedRouteOption): RouteBadge[] {
  if (option.badges.length <= 4) {
    return option.badges;
  }

  return [...option.badges.slice(0, 3), { kind: 'bus', value: '...' }];
}

function getWalkTarget(
  segments: RouteSegmentDetail[],
  currentIndex: number,
  destination: string,
) {
  const nextTransitSegment = segments
    .slice(currentIndex + 1)
    .find((segment) => segment.mode === 'BUS' || segment.mode === 'MRT');

  return nextTransitSegment?.fromStop ?? destination;
}

function buildSegmentCards(
  origin: string,
  destination: string,
  segments: RouteSegmentDetail[],
): SegmentCardData[] {
  return segments.map((segment, index) => {
    if (segment.mode === 'WALK') {
      const targetLabel = getWalkTarget(segments, index, destination);
      const isFirstSegment = index === 0;

      return {
        id: `segment-${segment.segmentId}`,
        title: isFirstSegment ? origin : 'Walk',
        subtitle: isFirstSegment ? `Walk to ${targetLabel}` : `To ${targetLabel}`,
        durationLabel: formatDurationLabel(segment.durationMins),
        marker: isFirstSegment ? 'start' : 'walk',
        detailRows: [
          `Distance ${segment.distanceKm.toFixed(2)} km`,
          `Destination ${targetLabel}`,
        ],
      };
    }

    const serviceLabel = segment.lineOrService ?? segment.mode;
    const routeLabel = segment.toStop
      ? `${serviceLabel} to ${segment.toStop}`
      : serviceLabel;

    return {
      id: `segment-${segment.segmentId}`,
      title: segment.fromStop ?? destination,
      subtitle: routeLabel,
      durationLabel: formatDurationLabel(segment.durationMins),
      marker: 'stop',
      detailRows: [
        segment.toStop ? `Alight at ${segment.toStop}` : 'Continue on route',
        `Distance ${segment.distanceKm.toFixed(2)} km`,
        segment.arrivalTiming ? `Arrival ${segment.arrivalTiming}` : `Mode ${segment.mode}`,
      ],
    };
  });
}

function SegmentCard({
  card,
  expanded,
  onToggle,
}: {
  card: SegmentCardData;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <article className={`route-detail-card ${expanded ? 'route-detail-card--expanded' : ''}`}>
      <div className="route-detail-card__head">
        <div className={`route-detail-card__marker route-detail-card__marker--${card.marker}`}>
          {card.marker === 'walk' ? (
            <HugeiconsIcon icon={WalkingIcon} size={16} strokeWidth={1.8} />
          ) : null}
        </div>
        <div className="route-detail-card__content">
          <div className="route-detail-card__title">{card.title}</div>
          {card.subtitle ? <div className="route-detail-card__subtitle">{card.subtitle}</div> : null}
          <span className="duration-pill">{card.durationLabel}</span>
        </div>
        <button
          type="button"
          className="route-detail-card__toggle"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <HugeiconsIcon
            icon={expanded ? ArrowUp01Icon : ArrowDown01Icon}
            size={20}
            strokeWidth={1.8}
          />
        </button>
      </div>

      {expanded ? (
        <div className="route-detail-card__details">
          {card.detailRows.map((detail) => (
            <div key={detail} className="route-detail-card__detail-row">
              {detail}
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

export function RouteDetailsPageConnected() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? 'Jurong East';
  const destination = searchParams.get('destination') ?? 'SMU';
  const optionId = searchParams.get('optionId');
  const [routeOptions, setRouteOptions] = useState<DetailedRouteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  const { isBookmarked, toggleBookmark } = useBookmarkedRoutes();

  useEffect(() => {
    let isCancelled = false;

    async function loadRouteDetails() {
      if (!isCancelled) {
        setIsLoading(true);
        setRouteOptions([]);
        setExpandedCardIds([]);
      }

      const result = await searchRoutes(origin, destination)
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (isCancelled) {
        return;
      }

      if (result.status === 'fulfilled') {
        setRouteOptions(result.value.routeOptions);
      }

      setIsLoading(false);
    }

    void loadRouteDetails();

    return () => {
      isCancelled = true;
    };
  }, [destination, origin]);

  const selectedRoute = useMemo(() => {
    if (routeOptions.length === 0) {
      return null;
    }

    return routeOptions.find((option) => option.id === optionId) ?? routeOptions[0];
  }, [optionId, routeOptions]);

  const headerBadges = useMemo(
    () => (selectedRoute ? getHeaderBadges(selectedRoute) : []),
    [selectedRoute],
  );

  const routeKey = selectedRoute ? `${origin}::${destination}::${selectedRoute.id}` : null;
  const bookmarked = routeKey ? isBookmarked(routeKey) : false;

  const segmentCards = useMemo(
    () => (selectedRoute ? buildSegmentCards(origin, destination, selectedRoute.segments) : []),
    [destination, origin, selectedRoute],
  );

  useEffect(() => {
    if (segmentCards.length > 0) {
      setExpandedCardIds([segmentCards[0].id]);
    }
  }, [segmentCards]);

  function toggleCard(cardId: string) {
    setExpandedCardIds((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId],
    );
  }

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from={origin} to={destination} recentSearches={recentSearches} />

      {selectedRoute ? (
        <div className="route-header-inline route-header-inline--details">
          <span>{formatDurationSummary(selectedRoute.totalDurationMins)}</span>
          <span className="route-header-inline__separator">·</span>
          {headerBadges.map((badge, index) => (
            <span key={`${badge.kind}-${badge.value}-${index}`} className="route-header-inline__badge-group">
              <span className="route-header-inline__badge">
                {badge.value === '...' ? (
                  <span className="route-header-inline__ellipsis">...</span>
                ) : (
                  <TransitBadge badge={badge} />
                )}
              </span>
              {index < headerBadges.length - 1 ? (
                <span className="route-header-inline__arrow" aria-hidden="true">
                  <HugeiconsIcon icon={ArrowRight01Icon} size={22} strokeWidth={2} />
                </span>
              ) : null}
            </span>
          ))}
          <span className="route-header-inline__separator">·</span>
          <span>4:40 PM</span>
          <span className="route-header-inline__separator">·</span>
          <button
            className={`bookmark-button ${bookmarked ? 'bookmark-button--active' : ''}`}
            type="button"
            aria-label="Save route"
            aria-pressed={bookmarked}
            onClick={() => {
              if (routeKey) {
                toggleBookmark(routeKey);
              }
            }}
          >
            <HugeiconsIcon
              icon={Bookmark02Icon}
              size={18}
              strokeWidth={1.8}
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>
        </div>
      ) : null}

      <div className="stack-md">
        {isLoading ? <div className="empty-state">Loading route details...</div> : null}

        {!isLoading && !selectedRoute ? (
          <div className="empty-state">No route details found.</div>
        ) : null}

        {segmentCards.map((card) => (
          <SegmentCard
            key={card.id}
            card={card}
            expanded={expandedCardIds.includes(card.id)}
            onToggle={() => toggleCard(card.id)}
          />
        ))}
      </div>
    </div>
  );
}
