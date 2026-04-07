import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { SignUpPageConnected } from '@/pages/SignUpPageConnected';
import { HomePage } from '@/pages/HomePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { CardsPage } from '@/pages/CardsPage';
import { RouteResultsPage } from '@/pages/RouteResultsPage';
import { RouteDetailsPage } from '@/pages/RouteDetailsPage';
import { JourneyProgressPage } from '@/pages/JourneyProgressPage';
import { CardDetailsPage } from '@/pages/CardDetailsPage';
import { TopUpPageConnected } from '@/pages/TopUpPageConnected';
import { TopUpSuccessPage } from '@/pages/TopUpSuccessPage';
import { RideHailingPage } from '@/pages/RideHailingPage';
import { AddCardPage } from '@/pages/AddCardPage';
import { ProfilePageConnected } from '@/pages/ProfilePageConnected';
import { EditProfilePageConnected } from '@/pages/EditProfilePageConnected';
import { ShellLayout } from '@/components/layout/ShellLayout';

export function AppRouter() {
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
        <Route path="/route-details" element={<RouteDetailsPage />} />
        <Route path="/journey" element={<JourneyProgressPage />} />
        <Route path="/card-details" element={<CardDetailsPage />} />
        <Route path="/top-up" element={<TopUpPageConnected />} />
        <Route path="/top-up-success" element={<TopUpSuccessPage />} />
        <Route path="/ride-hailing" element={<RideHailingPage />} />
        <Route path="/profile" element={<ProfilePageConnected />} />
        <Route path="/profile/edit" element={<EditProfilePageConnected />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
