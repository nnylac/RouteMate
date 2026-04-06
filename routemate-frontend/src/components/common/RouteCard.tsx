import { ArrowRight01Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';
import { SavedRoute } from '@/types';

interface RouteCardProps {
  route: SavedRoute;
}

export function RouteCard({ route }: RouteCardProps) {
  const navigate = useNavigate();

  return (
    <button className="route-card" onClick={() => navigate('/route-details')}>
      <div className="route-card__top">
        <span className="route-card__mode">{route.modeSummary}</span>
        <span className="route-card__arrow" aria-hidden="true">
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} strokeWidth={1.8} />
        </span>
      </div>

      <div className="route-card__title">
        <span>{route.from}</span>
        <span className="route-card__title-arrow" aria-hidden="true">
          <HugeiconsIcon icon={ArrowRight02Icon} size={22} strokeWidth={1.8} />
        </span>
        <span>{route.to}</span>
      </div>

      <div className="route-card__meta">
        {route.distanceKm} km {'·'} {route.durationLabel} {'·'} ${route.fare.toFixed(2)}
      </div>
    </button>
  );
}
