import { useEffect, useMemo, useState } from 'react';
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

function readBookmarks() {
  if (typeof window === 'undefined') {
    return [] as BookmarkEntry[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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

function writeBookmarks(bookmarks: BookmarkEntry[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT));
}

export function useBookmarkedRoutes() {
  const [bookmarkEntries, setBookmarkEntries] = useState<BookmarkEntry[]>(() => readBookmarks());

  useEffect(() => {
    function syncBookmarks(event?: StorageEvent) {
      if (!event || event.key === STORAGE_KEY) {
        setBookmarkEntries(readBookmarks());
      }
    }

    function handleBookmarkEvent() {
      setBookmarkEntries(readBookmarks());
    }

    window.addEventListener('storage', syncBookmarks);
    window.addEventListener(STORAGE_EVENT, handleBookmarkEvent);
    return () => {
      window.removeEventListener('storage', syncBookmarks);
      window.removeEventListener(STORAGE_EVENT, handleBookmarkEvent);
    };
  }, []);

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

      writeBookmarks(next);
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
