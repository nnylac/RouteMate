import { apiRequest } from '@/lib/api';

export interface NotificationRecord {
  _id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function getNotifications(userId?: string) {
  const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
  return apiRequest<NotificationRecord[]>(`/notification-service/notifications${query}`);
}
