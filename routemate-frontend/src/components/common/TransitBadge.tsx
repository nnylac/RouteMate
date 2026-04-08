import { WalkingIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { RouteBadge } from '@/types';

interface TransitBadgeProps {
  badge: RouteBadge;
}

const lineToneMap: Record<string, string> = {
  EW: 'green',
  NS: 'red',
  NE: 'purple',
  CC: 'yellow',
  CE: 'yellow',
  DT: 'blue',
  TE: 'brown',
  CG: 'green',
  BP: 'grey',
  SE: 'grey',
  SW: 'grey',
  PE: 'grey',
  PW: 'grey',
  SK: 'grey',
  PTC: 'grey',
};

function getMrtCode(value: string) {
  return value.trim().slice(0, 2).toUpperCase();
}

export function TransitBadge({ badge }: TransitBadgeProps) {
  if (badge.kind === 'walk') {
    return (
      <span className="transit-badge transit-badge--walk">
        <HugeiconsIcon icon={WalkingIcon} size={15} strokeWidth={1.8} />
        <span>{badge.value}</span>
      </span>
    );
  }

  if (badge.kind === 'bus') {
    return <span className="transit-badge transit-badge--green">{badge.value}</span>;
  }

  const mrtCode = getMrtCode(badge.value);
  const tone = lineToneMap[mrtCode] ?? 'neutral';

  return <span className={`transit-badge transit-badge--${tone}`}>{mrtCode}</span>;
}
