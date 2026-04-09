import { ArrowRight02Icon, Bookmark02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';
import { SavedRoute } from '@/types';

interface RouteCardProps {
  route: SavedRoute;
  bookmarked?: boolean;
  showBookmark?: boolean;
  onToggleBookmark?: (route: SavedRoute) => void;
}

export function RouteCard({
  route,
  bookmarked = false,
  showBookmark = false,
  onToggleBookmark,
}: RouteCardProps) {
  const navigate = useNavigate();
  const targetPath = route.optionId
    ? `/route-details?origin=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(route.to)}&optionId=${encodeURIComponent(route.optionId)}${route.routeId ? `&routeId=${encodeURIComponent(route.routeId)}` : ''}`
    : '/route-details';

  return (
    <div
      className="route-card"
      role="button"
      tabIndex={0}
      onClick={() => navigate(targetPath)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate(targetPath);
        }
      }}
    >
      <div className="route-card__top">
        <span className="route-card__mode">{route.modeSummary}</span>
        {showBookmark && route.routeKey ? (
          <button
            className={`bookmark-button ${bookmarked ? 'bookmark-button--active' : ''}`}
            type="button"
            aria-label={bookmarked ? 'Remove saved route' : 'Save route'}
            aria-pressed={bookmarked}
            onClick={(event) => {
              event.stopPropagation();
              onToggleBookmark?.(route);
            }}
          >
            <HugeiconsIcon
              icon={Bookmark02Icon}
              size={18}
              strokeWidth={1.8}
              fill={bookmarked ? 'currentColor' : 'none'}
            />
          </button>
        ) : null}
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
    </div>
  );
}
