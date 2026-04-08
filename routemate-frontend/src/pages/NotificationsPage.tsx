import {
  CheckmarkCircle02Icon,
  ClockArrowDownIcon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { PageTopBar } from '@/components/common/PageTopBar';

type NotificationTone = 'information' | 'complete' | 'clock';

interface NotificationItem {
  message: string;
  tone: NotificationTone;
}

const notifications: NotificationItem[] = [
  {
    message: 'Fare alert: Bus 190 is arriving in 3 minutes.',
    tone: 'clock',
  },
  {
    message: 'Card top-up successful for $20.00.',
    tone: 'complete',
  },
  {
    message: 'Saved route to City Hall has a faster option available.',
    tone: 'information',
  },
];

const notificationIcons = {
  information: InformationCircleIcon,
  complete: CheckmarkCircle02Icon,
  clock: ClockArrowDownIcon,
} as const;

export function NotificationsPage() {
  return (
    <div className="page">
      <PageTopBar title="Notifications" showBack showNotifications={false} />

      <div className="stack-md">
        {notifications.map((item) => (
          <div key={item.message} className="notification-card">
            <span
              className={`notification-card__icon notification-card__icon--${item.tone}`}
              aria-hidden="true"
            >
              <HugeiconsIcon icon={notificationIcons[item.tone]} size={24} strokeWidth={1.8} />
            </span>
            <span className="notification-card__text">{item.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
