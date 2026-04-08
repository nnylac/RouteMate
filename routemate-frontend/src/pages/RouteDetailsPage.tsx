import { useSearchParams } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';

export function RouteDetailsPage() {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get('origin') ?? 'Jurong East';
  const destination = searchParams.get('destination') ?? 'SMU';

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from={origin} to={destination} />

      <div className="route-header-inline">
        44 min · 6 · EW · 190 · 4:40 PM · 🔖
      </div>

      <div className="stack-md">
        <div className="timeline-card">
          <div className="timeline-card__dot timeline-card__dot--active" />
          <div className="timeline-card__content">
            <div className="timeline-card__title">Jurong East</div>
            <div className="timeline-card__subtitle">EW · Pasir Ris</div>
            <span className="duration-pill">24 mins</span>
          </div>
          <div className="timeline-card__side">
            <span className="eta-pill">In 2 min</span>
            <span className="muted-caption">4:42 PM</span>
          </div>
        </div>

        <div className="timeline-card">
          <div className="timeline-card__dot" />
          <div className="timeline-card__content">
            <div className="timeline-card__title">City Hall</div>
          </div>
        </div>

        <div className="timeline-card">
          <div className="timeline-card__dot" />
          <div className="timeline-card__content">
            <div className="timeline-card__title">SMU</div>
          </div>
        </div>
      </div>
    </div>
  );
}
