import { apiRequest } from '@/lib/api';

export interface User {
  id: string;
  fullName: string;
  email: string;
  username: string;
  phoneNumber?: string;
  isActive: boolean;
  transactionUserId?: string | number;
  outsystemsUserId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  message: string;
  user: User;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  username: string;
  password: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<User>('/user-service/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<LoginResponse>('/user-service/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getUserById(userId: string) {
  return apiRequest<User>(`/user-service/users/${userId}`);
}

export function updateUser(
  userId: string,
  payload: { fullName?: string; email?: string; username?: string },
) {
  return apiRequest<User>(`/user-service/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function changePassword(
  userId: string,
  payload: { currentPassword: string; newPassword: string },
) {
  return apiRequest<{ message: string }>(
    `/user-service/users/${userId}/change-password`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function forgotPassword(payload: {
  usernameOrEmail: string;
  newPassword: string;
}) {
  return apiRequest<{ message: string }>('/user-service/forgot-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
