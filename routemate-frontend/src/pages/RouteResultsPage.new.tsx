import {
  ArrowRight01Icon,
  CarSignalIcon,
  SchoolBusIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
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

      <div className="transport-toggle">
        <button className="transport-tab transport-tab--active" type="button">
          <HugeiconsIcon icon={SchoolBusIcon} size={26} strokeWidth={1.8} />
          <span>52 min</span>
        </button>
        <button
          className="transport-tab"
          type="button"
          onClick={() => navigate('/ride-hailing')}
        >
          <HugeiconsIcon icon={CarSignalIcon} size={26} strokeWidth={1.8} />
          <span>31 min</span>
        </button>
        <button className="text-chip" type="button">
          Calculate Fares
        </button>
      </div>

      <div className="stack-md">
        {routeOptions.map((option) => (
          <button
            key={option.id}
            className="route-option"
            onClick={() => navigate('/route-details')}
          >
            <div className="route-option__left">
              <div className="route-option__duration">
                {renderDurationParts(option.durationLabel)}
              </div>
            </div>

            <div className="route-option__mid">
              {option.badges.map((badge, index) => (
                <div
                  key={`${option.id}-${badge}-${index}`}
                  className="route-option__mid-item"
                >
                  <TransitBadge label={badge} />
                  {index < option.badges.length - 1 ? (
                    <span className="route-option__mid-separator" aria-hidden="true">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={24} strokeWidth={2} />
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="route-option__right">
              <span className="bookmark" aria-hidden="true">
                &#128278;
              </span>
              <span className="fare-badge">
                {option.fare ? `$ ${option.fare.toFixed(2)}` : '-'}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
