import type { User } from '@/lib/userApi';

const USER_STORAGE_KEY = 'routemate-user';

export interface StoredUser extends User {
  transactionUserId?: string | number;
}

export function toRouteCacheUserId(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) | 0;
  }

  return Math.abs(hash) || 1;
}

export function writeStoredUser(user: User) {
  const storedUser: StoredUser = {
    ...user,
    transactionUserId: user.transactionUserId ?? user.outsystemsUserId ?? user.id,
  };

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
  return storedUser;
}

export function readStoredUser() {
  const rawUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    const parsedUser = JSON.parse(rawUser) as Partial<StoredUser>;

    if (!parsedUser.id || !parsedUser.fullName || !parsedUser.email || !parsedUser.username) {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }

    const storedUser: StoredUser = {
      id: parsedUser.id,
      fullName: parsedUser.fullName,
      email: parsedUser.email,
      username: parsedUser.username,
      isActive: Boolean(parsedUser.isActive),
      transactionUserId: parsedUser.transactionUserId ?? parsedUser.outsystemsUserId ?? parsedUser.id,
      outsystemsUserId:
        typeof parsedUser.outsystemsUserId === 'number' && Number.isFinite(parsedUser.outsystemsUserId)
          ? parsedUser.outsystemsUserId
          : undefined,
      createdAt: parsedUser.createdAt,
      updatedAt: parsedUser.updatedAt,
    };

    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(storedUser));
    return storedUser;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function clearStoredUser() {
  localStorage.removeItem(USER_STORAGE_KEY);
}
