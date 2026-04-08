import { CardInfo } from '@/types';

interface CardPreviewProps {
  card: CardInfo;
  compact?: boolean;
}

export function CardPreview({ card, compact = false }: CardPreviewProps) {
  return (
    <div className={`wallet-card ${compact ? 'wallet-card--compact' : ''}`}>
      <div className="wallet-card__shine" />
      <div className="wallet-card__label">{card.label}</div>
      <div className="wallet-card__subtext">Available Balance</div>
      <div className="wallet-card__balance">$ {card.balance.toFixed(2)}</div>
      <div className="wallet-card__id-label">Card ID</div>
      <div className="wallet-card__number">{card.cardNumber}</div>
      <div className="wallet-card__type" aria-label={`Card type ${card.cardType}`}>
        {card.cardType.toUpperCase()}
      </div>
    </div>
  );
}
