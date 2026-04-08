import { CarSignalIcon, SchoolBusIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';

interface RouteModeTabsProps {
  active: 'routes' | 'ride-hailing';
  busDuration?: string | null;
  rideDuration?: string | null;
  origin?: string;
  destination?: string;
}

export function RouteModeTabs({
  active,
  busDuration = null,
  rideDuration = null,
  origin = '',
  destination = '',
}: RouteModeTabsProps) {
  const navigate = useNavigate();
  const search = origin && destination
    ? `?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`
    : '';

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

      <button className="text-chip" type="button">
        Calculate Fares
      </button>
    </div>
  );
}
