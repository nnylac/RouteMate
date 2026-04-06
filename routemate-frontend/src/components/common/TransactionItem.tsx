interface TransactionItemProps {
  category: string;
  title: string;
  amount: number;
  route: string;
}

export function TransactionItem({
  category,
  title,
  amount,
  route,
}: TransactionItemProps) {
  return (
    <div className="transaction-card">
      <div className="transaction-card__top">
        <span>{category}</span>
        <span>- $ {Math.abs(amount).toFixed(2)}</span>
      </div>
      <div className="transaction-card__title">{title}</div>
      <div className="transaction-card__route">{route}</div>
      <button className="link-button">View More ⌄</button>
    </div>
  );
}
