import { PageTopBar } from '@/components/common/PageTopBar';
import { SearchPanel } from '@/components/common/SearchPanel';
import { useCards } from '@/context/CardContext';
import { journeyStops } from '@/data/mockData';
import { AccordionStop } from '@/components/common/AccordionStop';

export function JourneyProgressPage() {
  const { cards } = useCards();

  return (
    <div className="page">
      <PageTopBar showBack />
      <SearchPanel from="Jurong East" to="SMU" />

      <div className="route-header-inline">44 min · 6 · EW · 190 · 4:40 PM · 📱</div>

      <div className="stack-sm">
        {journeyStops.map((stop) => (
          <AccordionStop key={stop.id} stop={stop} />
        ))}
      </div>

      <div className="info-block">
        <div>Trip Fare: $1.98</div>
        <div>Current Balance (before deduction): ${cards[0].balance.toFixed(2)}</div>
      </div>

      <button className="primary-button primary-button--wide">Mark Journey Complete</button>
    </div>
  );
}
