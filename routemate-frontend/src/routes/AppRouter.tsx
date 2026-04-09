import { Alert01Icon, CheckmarkCircle03Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { SignUpPageConnected } from '@/pages/SignUpPageConnected';
import { HomePage } from '@/pages/HomePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { CardsPage } from '@/pages/CardsPage';
import { RouteResultsPage } from '@/pages/RouteResultsPage';
import { RouteDetailsPageCurrent } from '@/pages/RouteDetailsPageCurrent';
import { JourneyProgressPage } from '@/pages/JourneyProgressPage';
import { JourneyCompleteSuccessPage } from '@/pages/JourneyCompleteSuccessPage';
import { CardDetailsPage } from '@/pages/CardDetailsPage';
import { TopUpPageConnected } from '@/pages/TopUpPageConnected';
import { TopUpSuccessPage } from '@/pages/TopUpSuccessPage';
import { RideHailingPage } from '@/pages/RideHailingPage';
import { FareComparisonPage } from '@/pages/FareComparisonPage';
import { AddCardPage } from '@/pages/AddCardPage';
import { ProfilePageConnected } from '@/pages/ProfilePageConnected';
import { EditProfilePageConnected } from '@/pages/EditProfilePageConnected';
import { ShellLayout } from '@/components/layout/ShellLayout';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import { readStoredUser } from '@/lib/authStorage';
import { connectNotificationSocket, disconnectNotificationSocket } from '@/lib/notificationSocket';


export function AppRouter() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = readStoredUser();

    if (!user?.id) {
      disconnectNotificationSocket();
      return;
    }

    const socket = connectNotificationSocket(user.id);

    if (!socket) {
      return;
    }

    const handleNotification = (notification: {
      _id?: string;
      type?: string;
      title?: string;
      message?: string;
    }) => {
      const isFailure =
        notification.type?.includes('failed') ||
        notification.type?.includes('rollback');

      toast.custom(
        (toastInstance) => (
          <div
            className={`notification-toast ${
              isFailure ? 'notification-toast--error' : ''
            } ${toastInstance.visible ? 'notification-toast--visible' : ''}`}
            role="button"
            tabIndex={0}
            onClick={() => {
              toast.dismiss(toastInstance.id);
              navigate('/notifications', {
                state: { highlightedNotification: notification },
              });
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toast.dismiss(toastInstance.id);
                navigate('/notifications', {
                  state: { highlightedNotification: notification },
                });
              }
            }}
          >
            <div className="notification-toast__icon" aria-hidden="true">
              {isFailure ? (
                <HugeiconsIcon icon={Alert01Icon} size={18} strokeWidth={1.9} />
              ) : (
                <HugeiconsIcon icon={CheckmarkCircle03Icon} size={18} strokeWidth={1.9} />
              )}
            </div>
            <div className="notification-toast__content">
              <div className="notification-toast__title">
                {notification.title ?? 'Notification'}
              </div>
              <div className="notification-toast__message">
                {notification.message ?? 'New notification received.'}
              </div>
            </div>
          </div>
        ),
        {
          duration: 4000,
        },
      );
    };

    socket.on('notification.created', handleNotification);

    return () => {
      socket.off('notification.created', handleNotification);
    };
  }, [location.pathname, navigate]);
  
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/sign-up" element={<SignUpPageConnected />} />
      <Route element={<ShellLayout />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/cards/add" element={<AddCardPage />} />
        <Route path="/routes" element={<RouteResultsPage />} />
        <Route path="/route-details" element={<RouteDetailsPageCurrent />} />
        <Route path="/journey" element={<JourneyProgressPage />} />
        <Route path="/journey-complete" element={<JourneyCompleteSuccessPage />} />
        <Route path="/card-details" element={<CardDetailsPage />} />
        <Route path="/top-up" element={<TopUpPageConnected />} />
        <Route path="/top-up-success" element={<TopUpSuccessPage />} />
        <Route path="/ride-hailing" element={<RideHailingPage />} />
        <Route path="/fare-comparison" element={<FareComparisonPage />} />
        <Route path="/profile" element={<ProfilePageConnected />} />
        <Route path="/profile/edit" element={<EditProfilePageConnected />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
