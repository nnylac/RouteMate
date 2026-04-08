import { ArrowRight01Icon, Bookmark02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { RouteModeTabs } from '@/components/common/RouteModeTabs';
import { SearchPanel } from '@/components/common/SearchPanel';
import { TransitBadge } from '@/components/common/TransitBadge';
import { routeOptions } from '@/data/mockData';

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

export function RouteResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from="Jurong East" to="SMU" />

      <RouteModeTabs active="routes" />

      <div className="stack-md">
        {routeOptions.map((option) => (
          <div
            key={option.id}
            className="route-option"
            role="button"
            tabIndex={0}
            onClick={() => navigate('/route-details')}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                navigate('/route-details');
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
                className="bookmark-button"
                type="button"
                aria-label="Save route"
                onClick={(event) => event.stopPropagation()}
              >
                <HugeiconsIcon
                  icon={Bookmark02Icon}
                  size={18}
                  strokeWidth={1.8}
                  fill="none"
                />
              </button>
              <span className="fare-badge">
                {option.fare ? `$ ${option.fare.toFixed(2)}` : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
