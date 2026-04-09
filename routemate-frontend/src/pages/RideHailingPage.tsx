import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RouteModeTabs } from '@/components/common/RouteModeTabs';
import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { getRideQuotes, searchRoutes, type RideQuote } from '@/lib/journeyApi';

function formatDuration(minutes: number) {
  if (minutes >= 60) {
    return `${Math.floor(minutes / 60)}h ${minutes % 60} min`;
  }

  return `${minutes} min`;
}

export function RideHailingPage() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? '';
  const destination = searchParams.get('destination') ?? '';
  const initialRouteId = searchParams.get('routeId');
  const [busDuration, setBusDuration] = useState<string | null>(null);
  const [rideDuration, setRideDuration] = useState<string | null>(null);
  const [rideHailingOptions, setRideHailingOptions] = useState<RideQuote[]>([]);
  const [routeId, setRouteId] = useState<string | null>(initialRouteId);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadJourneyData() {
      if (!isCancelled) {
        setIsLoading(true);
        setBusDuration(null);
        setRideDuration(null);
        setRideHailingOptions([]);
      }

      if (!origin.trim() || !destination.trim()) {
        if (!isCancelled) {
          setIsLoading(false);
        }
        return;
      }

      const [routeResult, rideResult] = await Promise.allSettled([
        searchRoutes(origin, destination),
        getRideQuotes(origin, destination),
      ]);

      if (isCancelled) {
        return;
      }

      if (routeResult.status === 'fulfilled') {
        const routeResponse = routeResult.value;
        setRouteId(String(routeResponse.route_id));

        if (routeResponse.quickestDuration !== null) {
          setBusDuration(formatDuration(routeResponse.quickestDuration));
        }

        if (routeResponse.drivingDuration !== null) {
          setRideDuration(formatDuration(routeResponse.drivingDuration));
        }
      }

      if (rideResult.status === 'fulfilled') {
        const rideResponse = rideResult.value;

        if (rideResponse.quotes.length > 0) {
          setRideHailingOptions(rideResponse.quotes);
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

  const visibleRideOptions = useMemo(() => rideHailingOptions, [rideHailingOptions]);

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from={origin} to={destination} />

      <RouteModeTabs
        active="ride-hailing"
        origin={origin}
        destination={destination}
        busDuration={busDuration}
        rideDuration={rideDuration}
        routeId={routeId}
      />

      <div className="stack-md">
        {isLoading ? <div className="empty-state">Loading ride options...</div> : null}

        {!isLoading && (!origin.trim() || !destination.trim()) ? (
          <div className="empty-state">Enter both origin and destination to search for rides.</div>
        ) : null}

        {!isLoading && origin.trim() && destination.trim() && visibleRideOptions.length === 0 ? (
          <div className="empty-state">No ride options found.</div>
        ) : null}

        {visibleRideOptions.map((ride) => (
          <div key={ride.provider} className="ride-card">
            <div className="ride-card__logo">{ride.provider[0]}</div>
            <div className="ride-card__info">
              <div className="ride-card__name">{ride.provider}</div>
              <div className="muted-caption">{ride.eta} mins away</div>
            </div>
            <div className="ride-card__price">
              <div className="muted-caption">From</div>
              <div>$ {ride.price.toFixed(2)}</div>
              <button className="mini-link-button">Book Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
