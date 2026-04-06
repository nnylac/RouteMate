import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { routeOptions } from '@/data/mockData';
import { TransitBadge } from '@/components/common/TransitBadge';
import { useNavigate } from 'react-router-dom';

export function RouteResultsPage() {
  const navigate = useNavigate();

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from="Jurong East" to="SMU" />

      <div className="transport-toggle">
        <button className="text-chip text-chip--active">🚌 52 min</button>
        <button className="text-chip" onClick={() => navigate('/ride-hailing')}>
          🚕 31 min
        </button>
        <button className="text-chip">Calculate Fares</button>
      </div>

      <div className="stack-md">
        {routeOptions.map((option) => (
          <button
            key={option.id}
            className="route-option"
            onClick={() => navigate('/route-details')}
          >
            <div className="route-option__left">
              <div className="route-option__duration">{option.durationLabel}</div>
            </div>

            <div className="route-option__mid">
              {option.badges.map((badge) => (
                <TransitBadge key={badge} label={badge} />
              ))}
            </div>

            <div className="route-option__right">
              <span className="bookmark">🔖</span>
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
