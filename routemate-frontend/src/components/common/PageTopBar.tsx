import { ArrowLeft01Icon, Notification01Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useNavigate } from 'react-router-dom';

interface PageTopBarProps {
  title?: string;
  showBack?: boolean;
  showNotifications?: boolean;
  titleAlign?: 'center' | 'left';
}

export function PageTopBar({
  title,
  showBack = false,
  showNotifications = true,
  titleAlign = 'center',
}: PageTopBarProps) {
  const navigate = useNavigate();
  const topBarClassName = [
    'page-topbar',
    titleAlign === 'left' ? 'page-topbar--title-left' : '',
    titleAlign === 'left' && !showBack ? 'page-topbar--flush-left' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={topBarClassName}>
      {showBack ? (
        <button className="icon-button" onClick={() => navigate(-1)} aria-label="Go back">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={20} strokeWidth={1.8} />
        </button>
      ) : (
        <div className="page-topbar__slot" aria-hidden="true" />
      )}

      {title ? <h1 className="page-title">{title}</h1> : <div />}

      {showNotifications ? (
        <button
          className="icon-button"
          onClick={() => navigate('/notifications')}
          aria-label="Open notifications"
        >
          <HugeiconsIcon icon={Notification01Icon} size={20} strokeWidth={1.8} />
        </button>
      ) : (
        <div className="page-topbar__slot" aria-hidden="true" />
      )}
    </div>
  );
}
