import { useEffect, useMemo, useState } from 'react';
import InputSpinner from '@/shims/react-native-input-spinner';
import {
  ArrowDown01Icon,
  ArrowRight02Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  CarSignalIcon,
  SchoolBusIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteModeTabs } from '@/components/common/RouteModeTabs';
import { SearchPanel } from '@/components/common/SearchPanel';
import { TransitBadge } from '@/components/common/TransitBadge';
import { compareFaresRequest, searchRoutes } from '@/lib/journeyApi';
import type { FareComparisonResult, FareComparisonRideQuote } from '@/types';

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60} min`;
  }

  return `${minutes} min`;
}

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

function getSavingsAmount(ptTotal: number, rideTotal: number) {
  return Math.max(0, rideTotal - ptTotal);
}

function getTimeSavingsMinutes(ptMinutes: number, rideMinutes: number) {
  return Math.max(0, ptMinutes - rideMinutes);
}

export function FareComparisonPage() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const requestedRouteId = searchParams.get('routeId');
  const parsedInitialRouteId = requestedRouteId ? Number(requestedRouteId) : NaN;
  const [routeId, setRouteId] = useState<number | null>(
    Number.isFinite(parsedInitialRouteId) ? parsedInitialRouteId : null,
  );
  const [comparison, setComparison] = useState<FareComparisonResult | null>(null);
  const [busDuration, setBusDuration] = useState<string | null>(null);
  const [rideDuration, setRideDuration] = useState<string | null>(null);
  const [paxCount, setPaxCount] = useState(1);
  const [showCheapestDetails, setShowCheapestDetails] = useState(false);
  const [showFastestDetails, setShowFastestDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const parsedRouteId = requestedRouteId ? Number(requestedRouteId) : NaN;

    if (Number.isFinite(parsedRouteId)) {
      setRouteId(parsedRouteId);
      return;
    }

    if (!origin.trim() || !destination.trim()) {
      setRouteId(null);
      setIsLoading(false);
      return;
    }

    let isCancelled = false;

    async function resolveRouteId() {
      if (!isCancelled) {
        setIsLoading(true);
      }

      const routeResult = await searchRoutes(origin, destination)
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (isCancelled) {
        return;
      }

      if (routeResult.status === 'fulfilled') {
        setRouteId(routeResult.value.route_id);
      } else if (!isCancelled) {
        setIsLoading(false);
      }
    }

    void resolveRouteId();

    return () => {
      isCancelled = true;
    };
  }, [destination, origin, requestedRouteId]);

  useEffect(() => {
    if (routeId === null) {
      return;
    }

    let isCancelled = false;

    async function loadFareComparisonData() {
      if (!isCancelled) {
        setIsLoading(true);
        setComparison(null);
        setBusDuration(null);
        setRideDuration(null);
        setShowCheapestDetails(false);
        setShowFastestDetails(false);
      }

      const compareResult = await compareFaresRequest(routeId, paxCount)
        .then((value) => ({ status: 'fulfilled' as const, value }))
        .catch((reason) => ({ status: 'rejected' as const, reason }));

      if (isCancelled) {
        return;
      }

      if (compareResult.status === 'fulfilled') {
        const nextComparison = compareResult.value;
        setComparison(nextComparison);
        setBusDuration(formatDuration(nextComparison.publicTransport.totalDurationMins));

        const fastestQuote = nextComparison.rideHailing.quotes.reduce<FareComparisonRideQuote | null>(
          (fastest, current) => {
            if (fastest === null || current.eta < fastest.eta) {
              return current;
            }

            return fastest;
          },
          null,
        );

        setRideDuration(
          fastestQuote ? formatDuration(fastestQuote.eta) : null,
        );
      } else if (!isCancelled) {
        setComparison(null);
      }

      if (!isCancelled) {
        setIsLoading(false);
      }
    }

    void loadFareComparisonData();

    return () => {
      isCancelled = true;
    };
  }, [paxCount, routeId]);

  const cheapestRoute = useMemo(() => {
    return comparison?.publicTransport.selectedOption ?? null;
  }, [comparison]);

  const fastestRide = useMemo(() => {
    if (!comparison?.rideHailing.quotes.length) {
      return null;
    }

    return comparison.rideHailing.quotes.reduce((fastest, current) =>
      current.eta < fastest.eta ? current : fastest,
    );
  }, [comparison]);

  const ptTotal = (comparison?.publicTransport.farePerPerson ?? 0) * paxCount;
  const ptPerPax = comparison?.publicTransport.farePerPerson ?? 0;
  const rideTotal = fastestRide?.price ?? 0;
  const ridePerPax =
    typeof fastestRide?.pricePerPerson === 'number'
      ? fastestRide.pricePerPerson
      : paxCount > 0
        ? rideTotal / paxCount
        : rideTotal;
  const ptMinutes = comparison?.publicTransport.totalDurationMins ?? 0;
  const rideMinutes = comparison?.filters.fastest.durationMins ?? 0;
  const savingsAmount = getSavingsAmount(ptTotal, rideTotal);
  const savingsPerPax = paxCount > 0 ? savingsAmount / paxCount : savingsAmount;
  const timeSavingsMinutes = getTimeSavingsMinutes(ptMinutes, rideMinutes);

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from={origin} to={destination} />

      <RouteModeTabs
        active="fare-comparison"
        origin={origin}
        destination={destination}
        busDuration={busDuration}
        rideDuration={rideDuration}
        routeId={routeId}
      />

      <div className="stack-md fare-comparison-page">
        {isLoading ? <div className="empty-state">Loading fare comparison...</div> : null}

        {!isLoading && (!origin.trim() || !destination.trim()) ? (
          <div className="empty-state">Enter both origin and destination to compare fares.</div>
        ) : null}

        {!isLoading && origin.trim() && destination.trim() ? (
          <>
            <div className="fare-comparison-header">
              <h2 className="fare-comparison-title">Fare Comparison</h2>
              <div className="fare-comparison-spinner-wrap">
                <span className="fare-comparison-spinner-label">No. Pax</span>
                <InputSpinner
                  value={paxCount}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(value) => setPaxCount(value)}
                />
              </div>
            </div>

            <section className="fare-comparison-section">
              <div className="fare-comparison-section__heading">
                <div className="fare-comparison-section__title-wrap">
                  <HugeiconsIcon icon={SchoolBusIcon} size={22} strokeWidth={1.8} />
                  <span>Cheapest</span>
                </div>
              </div>

              <div className="fare-comparison-section__summary">
                <span>Total: ${ptTotal.toFixed(2)}</span>
                <span className="fare-comparison-section__divider">|</span>
                <span>Per Pax: ${ptPerPax.toFixed(2)}</span>
              </div>

              {cheapestRoute ? (
                <div className="fare-comparison-route-card">
                  <div className="route-option route-option--comparison">
                    <div className="route-option__left">
                      <div className="route-option__duration">
                        {renderDurationParts(cheapestRoute.durationLabel)}
                      </div>
                    </div>

                    <div className="route-option__mid">
                      {cheapestRoute.badges.map((badge, index) => (
                        <div
                          key={`${cheapestRoute.id}-${badge.kind}-${badge.value}-${index}`}
                          className="route-option__mid-item"
                        >
                          <TransitBadge badge={badge} />
                          {index < cheapestRoute.badges.length - 1 ? (
                            <span className="route-option__mid-separator" aria-hidden="true">
                              <HugeiconsIcon icon={ArrowRight01Icon} size={24} strokeWidth={2} />
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div className="route-option__right">
                      <span className="fare-badge">
                        {typeof cheapestRoute.fare === 'number'
                          ? `$ ${cheapestRoute.fare.toFixed(2)}`
                          : '-'}
                      </span>
                    </div>

                    <div className="fare-comparison-card__actions">
                      <button
                        type="button"
                        className="fare-comparison-view-more"
                        onClick={() => setShowCheapestDetails((current) => !current)}
                      >
                        {showCheapestDetails ? 'View Less' : 'View More'}
                        <HugeiconsIcon
                          icon={showCheapestDetails ? ArrowUp01Icon : ArrowDown01Icon}
                          size={18}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </div>

                  {showCheapestDetails && comparison?.publicTransport.fareBreakdown.length ? (
                    <div className="fare-comparison-expand">
                      {comparison.publicTransport.fareBreakdown.map((segment) => {
                        return (
                          <div
                            key={`pt-segment-${segment.segmentId}`}
                            className="fare-comparison-expand__row"
                          >
                            <span className="fare-comparison-expand__route">
                              <span>{segment.fromStop ?? 'Unknown'}</span>
                              <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={1.8} />
                              <span>{segment.toStop ?? 'Unknown'}</span>
                            </span>
                            <span>
                              {typeof segment.fare === 'number'
                                ? `- $ ${segment.fare.toFixed(2)}`
                                : '-'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="empty-state">No public transport fares found.</div>
              )}
            </section>

            <section className="fare-comparison-section">
              <div className="fare-comparison-section__heading">
                <div className="fare-comparison-section__title-wrap">
                  <HugeiconsIcon icon={CarSignalIcon} size={22} strokeWidth={1.8} />
                  <span>Fastest</span>
                </div>
              </div>

              <div className="fare-comparison-section__summary">
                <span>Total: ${rideTotal.toFixed(2)}</span>
                <span className="fare-comparison-section__divider">|</span>
                <span>Per Pax: ${ridePerPax.toFixed(2)}</span>
              </div>

              {fastestRide ? (
                <div className="fare-comparison-ride-card">
                  <div className="ride-card">
                    <div className="ride-card__logo">{fastestRide.provider[0]}</div>
                    <div className="ride-card__info">
                      <div className="ride-card__name">{fastestRide.provider}</div>
                      <div className="muted-caption">{fastestRide.eta} mins away</div>
                      {rideDuration ? (
                        <div className="muted-caption">Trip duration: {rideDuration}</div>
                      ) : null}
                    </div>
                    <div className="ride-card__price">
                      <div className="muted-caption">From</div>
                      <div>$ {fastestRide.price.toFixed(2)}</div>
                      <button className="mini-link-button">Book Now</button>
                    </div>

                    <div className="fare-comparison-card__actions">
                      <button
                        type="button"
                        className="fare-comparison-view-more"
                        onClick={() => setShowFastestDetails((current) => !current)}
                      >
                        {showFastestDetails ? 'View Less' : 'View More'}
                        <HugeiconsIcon
                          icon={showFastestDetails ? ArrowUp01Icon : ArrowDown01Icon}
                          size={18}
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </div>

                  {showFastestDetails ? (
                    <div className="fare-comparison-expand">
                      <div className="fare-comparison-expand__row">
                        <span>Provider</span>
                        <span>{fastestRide.provider}</span>
                      </div>
                      <div className="fare-comparison-expand__row">
                        <span>ETA</span>
                        <span>{fastestRide.eta} min</span>
                      </div>
                      {comparison?.filters.fastest.durationMins ? (
                        <div className="fare-comparison-expand__row">
                          <span>Trip Duration</span>
                          <span>{comparison.filters.fastest.durationMins} min</span>
                        </div>
                      ) : null}
                      <div className="fare-comparison-expand__row">
                        <span>Booking Link</span>
                        <span>{fastestRide.bookingLink ? 'Available' : 'Not available'}</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="empty-state">No ride-hailing options found.</div>
              )}
            </section>

            <section className="fare-comparison-section fare-comparison-section--summary">
              <div className="fare-comparison-summary-row">
                <div className="fare-comparison-summary-label">Total Savings</div>
                <div className="fare-comparison-summary-value">
                  <HugeiconsIcon icon={SchoolBusIcon} size={20} strokeWidth={1.8} />
                  <span>${savingsAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="fare-comparison-summary-row">
                <div className="fare-comparison-summary-label">Savings per Pax</div>
                <div className="fare-comparison-summary-value">
                  <HugeiconsIcon icon={SchoolBusIcon} size={20} strokeWidth={1.8} />
                  <span>${savingsPerPax.toFixed(2)}</span>
                </div>
              </div>

              <div className="fare-comparison-summary-row">
                <div className="fare-comparison-summary-label">Time Savings</div>
                <div className="fare-comparison-summary-value">
                  <HugeiconsIcon icon={CarSignalIcon} size={20} strokeWidth={1.8} />
                  <span>{timeSavingsMinutes} min</span>
                </div>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </div>
  );
}
