import {
  Alert01Icon,
  CheckmarkCircle02Icon,
  ClockArrowDownIcon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageTopBar } from '@/components/common/PageTopBar';
import { readStoredUser } from '@/lib/authStorage';
import { getNotifications, type NotificationRecord } from '@/lib/notificationApi';

type NotificationTone = 'information' | 'complete' | 'clock' | 'warning';

interface NotificationItem extends NotificationRecord {
  tone: NotificationTone;
}

const notificationIcons = {
  information: InformationCircleIcon,
  complete: CheckmarkCircle02Icon,
  clock: ClockArrowDownIcon,
  warning: Alert01Icon,
} as const;

function getNotificationTone(type: string): NotificationTone {
  if (
    type === 'card_topup_success' ||
    type === 'card_topup_rollback' ||
    type === 'card_deduction_success'
  ) {
    return 'complete';
  }

  if (type === 'card_topup_failed' || type === 'card_deduction_failed') {
    if (type === 'card_deduction_failed') {
      return 'warning';
    }

    return 'information';
  }

  return 'clock';
}

export function NotificationsPage() {
  const location = useLocation();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCancelled = false;

    async function loadNotifications() {
      try {
        const storedUser = readStoredUser();
        const userId = storedUser?.id;
        const records = await getNotifications(userId);
        const highlightedNotification =
          typeof location.state === 'object' &&
          location.state !== null &&
          'highlightedNotification' in location.state
            ? (location.state.highlightedNotification as NotificationRecord | undefined)
            : undefined;

        const mergedRecords = highlightedNotification
          ? [
              highlightedNotification,
              ...records.filter((record) => record._id !== highlightedNotification._id),
            ]
          : records;

        if (!isCancelled) {
          setNotifications(
            mergedRecords.map((record) => ({
              ...record,
              tone: getNotificationTone(record.type),
            })),
          );
          setErrorMessage('');
        }
      } catch (error) {
        if (!isCancelled) {
          setNotifications([]);
          setErrorMessage(
            error instanceof Error ? error.message : 'Unable to load notifications.',
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadNotifications();

    return () => {
      isCancelled = true;
    };
  }, [location.state]);

  return (
    <div className="page">
      <PageTopBar title="Notifications" titleAlign="center" showBack showNotifications={false} />

      <div className="stack-md">
        {isLoading ? <div className="empty-state">Loading notifications...</div> : null}

        {!isLoading && errorMessage ? (
          <div className="empty-state">{errorMessage}</div>
        ) : null}

        {!isLoading && !errorMessage && notifications.length === 0 ? (
          <div className="empty-state">No notifications yet.</div>
        ) : null}

        {!isLoading && !errorMessage
          ? notifications.map((item) => (
              <div key={item._id} className="notification-card">
                <span
                  className={`notification-card__icon notification-card__icon--${item.tone}`}
                  aria-hidden="true"
                >
                  <HugeiconsIcon icon={notificationIcons[item.tone]} size={24} strokeWidth={1.8} />
                </span>
                <span className="notification-card__text">{item.message}</span>
              </div>
            ))
          : null}
      </div>
    </div>
  );
}
