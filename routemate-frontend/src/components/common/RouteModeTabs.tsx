import { CarSignalIcon, SchoolBusIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';

interface RouteModeTabsProps {
  active: 'routes' | 'ride-hailing' | 'fare-comparison';
  busDuration?: string | null;
  rideDuration?: string | null;
  origin?: string;
  destination?: string;
  routeId?: string | number | null;
}

export function RouteModeTabs({
  active,
  busDuration = null,
  rideDuration = null,
  origin = '',
  destination = '',
  routeId = null,
}: RouteModeTabsProps) {
  const navigate = useNavigate();
  const params = new URLSearchParams();

  if (origin) {
    params.set('origin', origin);
  }

  if (destination) {
    params.set('destination', destination);
  }

  if (routeId !== null && routeId !== undefined && String(routeId).trim()) {
    params.set('routeId', String(routeId));
  }

  const search = params.toString() ? `?${params.toString()}` : '';

  return (
    <div className="transport-toggle">
      <button
        className={`transport-tab ${active === 'routes' ? 'transport-tab--active' : ''}`}
        type="button"
        onClick={() => navigate(`/routes${search}`)}
      >
        <HugeiconsIcon icon={SchoolBusIcon} size={18} strokeWidth={1.8} />
        <span>{busDuration ?? '...'}</span>
      </button>

      <button
        className={`transport-tab ${active === 'ride-hailing' ? 'transport-tab--active' : ''}`}
        type="button"
        onClick={() => navigate(`/ride-hailing${search}`)}
      >
        <HugeiconsIcon icon={CarSignalIcon} size={18} strokeWidth={1.8} />
        <span>{rideDuration ?? '...'}</span>
      </button>

      <button
        className={`text-chip ${active === 'fare-comparison' ? 'text-chip--active' : ''}`}
        type="button"
        onClick={() => navigate(`/fare-comparison${search}`)}
      >
        Calculate Fares
      </button>
    </div>
  );
}
