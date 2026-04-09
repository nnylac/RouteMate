import { useEffect, useMemo, useState } from 'react';
import { readStoredUser } from '@/lib/authStorage';
import type { SavedRoute } from '@/types';

const STORAGE_KEY = 'routemate-bookmarked-routes';
const STORAGE_EVENT = 'routemate-bookmarked-routes-changed';

interface BookmarkEntry {
  key: string;
  route?: SavedRoute;
}

function isSavedRoute(value: unknown): value is SavedRoute {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<SavedRoute>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.modeSummary === 'string' &&
    typeof candidate.from === 'string' &&
    typeof candidate.to === 'string' &&
    typeof candidate.distanceKm === 'number' &&
    typeof candidate.durationLabel === 'string' &&
    typeof candidate.fare === 'number'
  );
}

function getBookmarkStorageKey() {
  const storedUser = readStoredUser();
  return storedUser ? `${STORAGE_KEY}:${storedUser.id}` : STORAGE_KEY;
}

function readBookmarks(storageKey = getBookmarkStorageKey()) {
  if (typeof window === 'undefined') {
    return [] as BookmarkEntry[];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((value) => {
      if (typeof value === 'string') {
        return [{ key: value }];
      }

      if (!value || typeof value !== 'object') {
        return [];
      }

      const candidate = value as { key?: unknown; route?: unknown };
      if (typeof candidate.key !== 'string') {
        return [];
      }

      return [
        {
          key: candidate.key,
          route: isSavedRoute(candidate.route) ? candidate.route : undefined,
        },
      ];
    });
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks: BookmarkEntry[], storageKey = getBookmarkStorageKey()) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(bookmarks));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

export function useBookmarkedRoutes() {
  const storageKey = useMemo(() => getBookmarkStorageKey(), []);
  const [bookmarkEntries, setBookmarkEntries] = useState<BookmarkEntry[]>(() => readBookmarks(storageKey));

  useEffect(() => {
    function syncBookmarks(event?: StorageEvent) {
      if (!event || event.key === storageKey) {
        setBookmarkEntries(readBookmarks(storageKey));
      }
    }

    function handleBookmarkEvent() {
      setBookmarkEntries(readBookmarks(storageKey));
    }

    window.addEventListener('storage', syncBookmarks);
    window.addEventListener(STORAGE_EVENT, handleBookmarkEvent);
    setBookmarkEntries(readBookmarks(storageKey));
    return () => {
      window.removeEventListener('storage', syncBookmarks);
      window.removeEventListener(STORAGE_EVENT, handleBookmarkEvent);
    };
  }, [storageKey]);

  const bookmarks = useMemo(
    () => bookmarkEntries.map((entry) => entry.key),
    [bookmarkEntries],
  );

  const bookmarkedRoutes = useMemo(
    () =>
      bookmarkEntries
        .map((entry) => entry.route)
        .filter((route): route is SavedRoute => Boolean(route))
        .reverse(),
    [bookmarkEntries],
  );

  function isBookmarked(routeKey: string) {
    return bookmarkEntries.some((entry) => entry.key === routeKey);
  }

  function toggleBookmark(routeKey: string, route?: SavedRoute) {
    setBookmarkEntries((current) => {
      const existingIndex = current.findIndex((entry) => entry.key === routeKey);

      const next =
        existingIndex >= 0
          ? current.filter((entry) => entry.key !== routeKey)
          : [...current, { key: routeKey, route }];

      writeBookmarks(next, storageKey);
      return next;
    });
  }

  return {
    bookmarks,
    bookmarkedRoutes,
    isBookmarked,
    toggleBookmark,
  };
}
