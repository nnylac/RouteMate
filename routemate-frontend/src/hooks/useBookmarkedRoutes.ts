import { useEffect, useState } from 'react';

const STORAGE_KEY = 'routemate-bookmarked-routes';

function readBookmarks() {
  if (typeof window === 'undefined') {
    return [] as string[];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeBookmarks(bookmarks: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function useBookmarkedRoutes() {
  const [bookmarks, setBookmarks] = useState<string[]>(() => readBookmarks());

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) {
        setBookmarks(readBookmarks());
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function isBookmarked(routeKey: string) {
    return bookmarks.includes(routeKey);
  }

  function toggleBookmark(routeKey: string) {
    setBookmarks((current) => {
      const next = current.includes(routeKey)
        ? current.filter((value) => value !== routeKey)
        : [...current, routeKey];

      writeBookmarks(next);
      return next;
    });
  }

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
  };
}
