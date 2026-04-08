interface SegmentTabsProps {
  items: string[];
  active: string;
  onChange?: (item: string) => void;
}

export function SegmentTabs({ items, active, onChange }: SegmentTabsProps) {
  return (
    <div className="segment-tabs">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`segment-tabs__item ${active === item ? 'segment-tabs__item--active' : ''}`}
          onClick={() => onChange?.(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
