import { CardInfo } from '@/types';

interface TopUpCardPreviewProps {
  card: CardInfo;
}

export function TopUpCardPreview({ card }: TopUpCardPreviewProps) {
  return (
    <div className="top-up-card-preview">
      <div className="top-up-card-preview__shine" />
      <div className="top-up-card-preview__left">
        <div className="top-up-card-preview__label">{card.label}</div>
        <div className="top-up-card-preview__type" aria-label={`Card type ${card.cardType}`}>
          {card.cardType.toUpperCase()}
        </div>
      </div>

      <div className="top-up-card-preview__right">
        <div className="top-up-card-preview__caption">Available Balance</div>
        <div className="top-up-card-preview__balance">$ {card.balance.toFixed(2)}</div>
      </div>
    </div>
  );
}
