import { JourneyStop } from '@/types';

interface AccordionStopProps {
  stop: JourneyStop;
}

export function AccordionStop({ stop }: AccordionStopProps) {
  return (
    <div className="accordion-stop">
      <div className="accordion-stop__head">
        <div>
          <div className="accordion-stop__title">{stop.title}</div>
          {stop.subtitle && <div className="accordion-stop__subtitle">{stop.subtitle}</div>}
        </div>
        <div className="accordion-stop__actions">
          {stop.eta && <span className="eta-pill">{stop.eta}</span>}
          <button className="icon-button icon-button--small">⌄</button>
        </div>
      </div>
      {stop.duration && <div className="duration-pill">{stop.duration}</div>}
    </div>
  );
}
