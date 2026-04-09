import { ArrowDown01Icon, ArrowRight02Icon, ArrowUp01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useState } from 'react';

interface TransactionBreakdownItem {
  id: string;
  from: string;
  to: string;
  amount: number;
}

interface TransactionItemProps {
  category: string;
  title: string;
  amount: number;
  route?: string | null;
  status?: string;
  showViewMore?: boolean;
  isCredit?: boolean;
  breakdownItems?: TransactionBreakdownItem[];
}

export function TransactionItem({
  category,
  title,
  amount,
  route,
  status,
  showViewMore = true,
  isCredit = false,
  breakdownItems = [],
}: TransactionItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const signedAmountLabel = `${isCredit ? '+' : '-'} $ ${Math.abs(amount).toFixed(2)}`;
  const canExpand = showViewMore && breakdownItems.length > 0;

  return (
    <>
      <div className="transaction-card">
        <div className="transaction-card__top">
          <span>{category}</span>
          <span>{signedAmountLabel}</span>
        </div>
        <div className="transaction-card__title">{title}</div>
        {route ? <div className="transaction-card__route">{route}</div> : null}
        {status ? <div className="transaction-card__route">Status: {status}</div> : null}
        {showViewMore ? (
          <div className="transaction-card__actions">
            <button
              type="button"
              className="link-button transaction-card__view-more"
              onClick={() => {
                if (canExpand) {
                  setIsExpanded((current) => !current);
                }
              }}
              disabled={!canExpand}
            >
              {isExpanded ? 'View Less' : 'View More'}
              <HugeiconsIcon
                icon={isExpanded ? ArrowUp01Icon : ArrowDown01Icon}
                size={18}
                strokeWidth={1.8}
              />
            </button>
          </div>
        ) : null}
      </div>

      {isExpanded ? (
        <div className="transaction-card__breakdown">
          {breakdownItems.map((item) => (
            <div key={item.id} className="transaction-card__breakdown-row">
              <span className="transaction-card__breakdown-route">
                <span>{item.from}</span>
                <HugeiconsIcon icon={ArrowRight02Icon} size={16} strokeWidth={1.8} />
                <span>{item.to}</span>
              </span>
              <span className="transaction-card__breakdown-amount">- $ {Math.abs(item.amount).toFixed(2)}</span>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
