interface TransitBadgeProps {
  label: string;
}

const greenLines = new Set(['EW', '190', '867', '53', '123']);
const brownLines = new Set(['TE']);

export function TransitBadge({ label }: TransitBadgeProps) {
  const tone = greenLines.has(label)
    ? 'green'
    : brownLines.has(label)
      ? 'brown'
      : 'neutral';

  return <span className={`transit-badge transit-badge--${tone}`}>{label}</span>;
}
