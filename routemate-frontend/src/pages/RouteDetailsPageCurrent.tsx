import {
  ArrowRight01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  Bookmark02Icon,
  Location01Icon,
  RecordIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { TransitBadge } from '@/components/common/TransitBadge';
import { useCards } from '@/context/CardContext';
import { useBookmarkedRoutes } from '@/hooks/useBookmarkedRoutes';
import { readStoredUser } from '@/lib/authStorage';
import { searchRoutes } from '@/lib/journeyApi';
import {
  saveTransactionMetadata,
} from '@/lib/transactionHistoryStorage';
import type { DetailedRouteOption, RouteBadge, RouteSegmentDetail, SavedRoute } from '@/types';

interface SegmentCardData {
  id: string;
  originLabel: string;
  destinationLabel: string;
  lineBadge?: RouteBadge;
  directionLabel?: string;
  modeLabel?: string;
  durationLabel: string;
  isFirst: boolean;
  isFinal: boolean;
  isWalk: boolean;
  arrivalBadgeLabel?: string;
  arrivalTimeLabel?: string;
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

function getTransactionCategory(option: DetailedRouteOption) {
  return option.isPublicTransport ? 'Public Transport' : 'Ride-Hailing';
}

function getTransactionTitle(option: DetailedRouteOption) {
  if (!option.isPublicTransport) {
    return option.summary || 'Ride-Hailing';
  }

  const modes = option.segments
    .map((segment) => {
      if (segment.mode === 'MRT') return 'MRT';
      if (segment.mode === 'BUS') return 'Bus';
      return null;
    })
    .filter((value, index, array): value is string => value !== null && array.indexOf(value) === index);

  return modes.join(' · ') || 'Public Transport';
}

function getSavedRouteModeSummary(option: DetailedRouteOption) {
  const modes = option.segments
    .map((segment) => {
      if (segment.mode === 'MRT') return 'MRT';
      if (segment.mode === 'BUS') return 'Bus';
      return null;
    })
    .filter((value, index, array): value is string => value !== null && array.indexOf(value) === index);

  return modes.join(' · ') || 'Route';
}

function formatClockTime(totalMinutes: number) {
  const minutesInDay = 24 * 60;
  const normalized = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
  const hours24 = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function getCurrentSingaporeTime() {
  const formatter = new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const parts = formatter.formatToParts(new Date());
  const hourPart = parts.find((part) => part.type === 'hour')?.value ?? '12';
  const minutePart = parts.find((part) => part.type === 'minute')?.value ?? '00';
  const dayPeriod = parts.find((part) => part.type === 'dayPeriod')?.value?.toUpperCase() ?? 'AM';
  const hourValue = Number(hourPart);
  const normalizedHour = Number.isFinite(hourValue) ? hourValue : 12;
  const hours24 =
    dayPeriod === 'PM'
      ? normalizedHour % 12 + 12
      : normalizedHour % 12;

  return {
    label: `${hourPart}:${minutePart} ${dayPeriod}`,
    totalMinutes: hours24 * 60 + Number(minutePart),
  };
}

function getArrivalWaitMinutes(segment: RouteSegmentDetail) {
  return segment.arrivalTiming?.predictedArrivalMins ?? null;
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
  headerTimeTotalMins: number,
): SegmentCardData[] {
  let cumulativeMinutesBeforeSegment = 0;

  return segments.map((segment, index) => {
    const isFinal = index === segments.length - 1;
    const minutesBeforeSegment = cumulativeMinutesBeforeSegment;
    cumulativeMinutesBeforeSegment += segment.durationMins;

    if (segment.mode === 'WALK') {
      const targetLabel = getWalkTarget(segments, index, destination);
      const isFirstSegment = index === 0;

      return {
        id: `segment-${segment.segmentId}`,
        originLabel: isFirstSegment ? origin : 'Walk',
        destinationLabel: targetLabel,
        modeLabel: 'Walk',
        durationLabel: formatDurationLabel(segment.durationMins),
        isFirst: isFirstSegment,
        isFinal,
        isWalk: true,
        detailRows: [
          `Distance ${segment.distanceKm.toFixed(2)} km`,
          targetLabel,
        ],
      };
    }

    const directionLabel = segment.toStop ?? destination;
    const arrivalWaitMins = getArrivalWaitMinutes(segment);
    const lineBadge = segment.mode === 'MRT'
      ? { kind: 'mrt' as const, value: segment.lineOrService ?? segment.mode }
      : segment.mode === 'BUS'
        ? { kind: 'bus' as const, value: segment.lineOrService ?? segment.mode }
        : undefined;

    return {
      id: `segment-${segment.segmentId}`,
      originLabel: segment.fromStop ?? origin,
      destinationLabel: directionLabel,
      lineBadge,
      directionLabel,
      modeLabel: segment.mode,
      durationLabel: formatDurationLabel(segment.durationMins),
      isFirst: index === 0,
      isFinal,
      isWalk: false,
      arrivalBadgeLabel:
        arrivalWaitMins !== null ? `In ${arrivalWaitMins} min` : undefined,
      arrivalTimeLabel:
        arrivalWaitMins !== null
          ? `At ${formatClockTime(
              headerTimeTotalMins +
                minutesBeforeSegment +
                arrivalWaitMins,
            )}`
          : undefined,
      detailRows: [
        directionLabel,
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
  const collapsedMarkerIcon = card.isFinal ? Location01Icon : card.isFirst ? undefined : RecordIcon;

  return (
    <article className={`route-detail-card ${expanded ? 'route-detail-card--expanded' : ''}`}>
      <div className="route-detail-card__head">
        {expanded ? (
          <div className="route-detail-card__track">
            <div className="route-detail-card__track-row">
              <div className={`route-detail-card__marker ${card.isFirst ? 'route-detail-card__marker--start' : 'route-detail-card__marker--record'}`}>
                {card.isFirst ? null : (
                  <HugeiconsIcon icon={RecordIcon} size={16} strokeWidth={1.8} fill="currentColor" />
                )}
              </div>
            </div>
            <div className="route-detail-card__track-line" />
            <div className="route-detail-card__track-row">
              <div className="route-detail-card__marker route-detail-card__marker--record">
                <HugeiconsIcon
                  icon={card.isFinal ? Location01Icon : RecordIcon}
                  size={card.isFinal ? 18 : 16}
                  strokeWidth={1.8}
                  fill={card.isFinal ? 'none' : 'currentColor'}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="route-detail-card__collapsed-marker">
            <div className={`route-detail-card__marker ${card.isFirst ? 'route-detail-card__marker--start' : 'route-detail-card__marker--record'}`}>
              {collapsedMarkerIcon ? (
                <HugeiconsIcon
                  icon={collapsedMarkerIcon}
                  size={collapsedMarkerIcon === Location01Icon ? 18 : 16}
                  strokeWidth={1.8}
                  fill={collapsedMarkerIcon === Location01Icon ? 'none' : 'currentColor'}
                />
              ) : null}
            </div>
          </div>
        )}
        <div className="route-detail-card__content">
          <div className="route-detail-card__title">{card.originLabel}</div>
          {expanded ? (
            <>
              {!card.isWalk ? (
                <div className="route-detail-card__subtitle route-detail-card__subtitle--line">
                  {card.lineBadge ? <TransitBadge badge={card.lineBadge} /> : null}
                  <span>{card.directionLabel}</span>
                </div>
              ) : null}
              <div className="route-detail-card__duration-row">
                <span className="duration-pill route-detail-card__duration-pill">{card.durationLabel}</span>
              </div>
              <div className="route-detail-card__destination">{card.destinationLabel}</div>
            </>
          ) : null}
        </div>
        <div className="route-detail-card__side">
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
          {expanded && !card.isWalk && card.arrivalBadgeLabel && card.arrivalTimeLabel ? (
            <div className="route-detail-card__timing">
              <span className="eta-pill">{card.arrivalBadgeLabel}</span>
              <span className="muted-caption">{card.arrivalTimeLabel}</span>
            </div>
          ) : null}
        </div>
      </div>

      {expanded ? (
        <div className="route-detail-card__details" />
      ) : null}
    </article>
  );
}

export function RouteDetailsPageCurrent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cards, deductFare, isLoading: isCardsLoading } = useCards();
  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const optionId = searchParams.get('optionId');
  const routeId = searchParams.get('routeId');
  const [routeOptions, setRouteOptions] = useState<DetailedRouteOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCardIds, setExpandedCardIds] = useState<string[]>([]);
  const [isCompletingJourney, setIsCompletingJourney] = useState(false);
  const [journeyError, setJourneyError] = useState('');
  const { isBookmarked, toggleBookmark } = useBookmarkedRoutes();
  const currentSingaporeTime = useMemo(() => getCurrentSingaporeTime(), []);

  useEffect(() => {
    let isCancelled = false;

    async function loadRouteDetails() {
      if (!isCancelled) {
        setIsLoading(true);
        setRouteOptions([]);
        setExpandedCardIds([]);
      }

      if (!origin.trim() || !destination.trim()) {
        if (!isCancelled) {
          setIsLoading(false);
        }
        return;
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
  const selectedSavedRoute = useMemo<SavedRoute | null>(() => {
    if (!selectedRoute || !routeKey) {
      return null;
    }

    return {
      id: `saved-${origin}-${destination}-${selectedRoute.id}`,
      routeKey,
      routeId: routeId ?? undefined,
      optionId: selectedRoute.id,
      modeSummary: getSavedRouteModeSummary(selectedRoute),
      from: origin,
      to: destination,
      distanceKm: selectedRoute.totalDistanceKm,
      durationLabel: `Est ${selectedRoute.durationLabel}`,
      fare: Number(selectedRoute.fare ?? 0),
    };
  }, [destination, origin, routeId, routeKey, selectedRoute]);
  const currentCard = cards[0] ?? null;
  const currentBalance = currentCard?.balance ?? null;

  const segmentCards = useMemo(
    () =>
      selectedRoute
        ? buildSegmentCards(
            origin,
            destination,
            selectedRoute.segments,
            currentSingaporeTime.totalMinutes,
          )
        : [],
    [currentSingaporeTime.totalMinutes, destination, origin, selectedRoute],
  );

  useEffect(() => {
    if (segmentCards.length > 0) {
      setExpandedCardIds(segmentCards.map((card) => card.id));
    }
  }, [segmentCards]);

  function toggleCard(cardId: string) {
    setExpandedCardIds((current) =>
      current.includes(cardId)
        ? current.filter((id) => id !== cardId)
        : [...current, cardId],
    );
  }

  async function handleMarkJourneyComplete() {
    if (!selectedRoute) {
      setJourneyError('No route is selected for this journey.');
      return;
    }

    if (!currentCard) {
      setJourneyError(
        isCardsLoading
          ? 'Your card is still loading. Please try again in a moment.'
          : 'No transport card was found for this account.',
      );
      return;
    }

    if (!selectedRoute.fare) {
      setJourneyError('This route does not have a payable fare to deduct.');
      return;
    }

    const storedUser = readStoredUser();

    if (!storedUser) {
      setJourneyError('No signed-in user found. Please log in again.');
      return;
    }

    if (!storedUser.transactionUserId) {
      setJourneyError('No signed-in user ID found for this account. Please log in again.');
      return;
    }

    try {
      setIsCompletingJourney(true);
      setJourneyError('');
      const updatedCard = await deductFare(currentCard.id, selectedRoute.fare, {
        transactionUserId: storedUser.transactionUserId,
        appUserId: storedUser.id,
        reference: `journey_${currentCard.id}_${selectedRoute.id}_${Date.now()}`,
      });

      if (updatedCard.transactionId) {
        saveTransactionMetadata({
          transactionId: updatedCard.transactionId,
          cardId: currentCard.id,
          category: getTransactionCategory(selectedRoute),
          title: getTransactionTitle(selectedRoute),
          route: `${origin} -> ${destination}`,
          status: 'success',
          routeBreakdown: selectedRoute,
        });
      }

      navigate('/journey-complete', {
        replace: true,
        state: {
          cardId: currentCard.id,
          fareAmount: selectedRoute.fare,
          transactionWarning: updatedCard.transactionWarning,
        },
      });
    } catch (error) {
      setJourneyError(
        error instanceof Error ? error.message : 'Unable to complete journey.',
      );
    } finally {
      setIsCompletingJourney(false);
    }
  }

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from={origin} to={destination} />

      {selectedRoute ? (
        <div className="route-header-inline route-header-inline--details">
          <button
            className={`bookmark-button ${bookmarked ? 'bookmark-button--active' : ''}`}
            type="button"
            aria-label="Save route"
            aria-pressed={bookmarked}
            onClick={() => {
              if (routeKey) {
                toggleBookmark(routeKey, selectedSavedRoute ?? undefined);
              }
            }}
          >
            <HugeiconsIcon
              icon={Bookmark02Icon}
              size={20}
              strokeWidth={1.8}
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>
          <span className="route-header-inline__separator">·</span>
          <span>{currentSingaporeTime.label}</span>
          <span className="route-header-inline__separator">·</span>
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

        {selectedRoute ? (
          <>
            <div className="route-detail-summary">
              <div>Trip Fare: ${selectedRoute.fare?.toFixed(2) ?? '0.00'}</div>
              <div>
                {isCompletingJourney
                  ? 'Completing journey...'
                  : currentBalance !== null
                    ? `Current Balance (before deduction): $${currentBalance.toFixed(2)}`
                    : isCardsLoading
                      ? 'Loading card balance...'
                      : 'No transport card found.'}
              </div>
            </div>

            {journeyError ? <div className="route-detail-error">{journeyError}</div> : null}

            <div className="route-detail-actions">
              <button
                className="primary-button primary-button--pill"
                type="button"
                onClick={() => void handleMarkJourneyComplete()}
                disabled={isCompletingJourney || isCardsLoading}
              >
                {isCompletingJourney
                  ? 'Completing...'
                  : isCardsLoading
                    ? 'Loading Card...'
                    : 'Mark Journey Complete'}
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
