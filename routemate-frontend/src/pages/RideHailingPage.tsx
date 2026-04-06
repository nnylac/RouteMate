import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { rideHailingOptions } from '@/data/mockData';

export function RideHailingPage() {
  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from="Jurong East" to="SMU" />

      <div className="transport-toggle">
        <button className="text-chip">🚌 52 min</button>
        <button className="text-chip text-chip--active">🚕 31 min</button>
        <button className="text-chip">Calculate Fares</button>
      </div>

      <div className="stack-md">
        {rideHailingOptions.map((ride) => (
          <div key={ride.id} className="ride-card">
            <div className="ride-card__logo">{ride.provider[0]}</div>
            <div className="ride-card__info">
              <div className="ride-card__name">{ride.provider}</div>
              <div className="muted-caption">{ride.eta}</div>
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
