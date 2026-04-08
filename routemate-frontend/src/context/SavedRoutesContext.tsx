import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';
import { savedRoutes as defaultSavedRoutes } from '@/data/mockData';
import type { SavedRoute } from '@/types';

const STORAGE_KEY = 'routemate-saved-routes';

interface SavedRoutesContextValue {
  savedRoutes: SavedRoute[];
  isSavedRoute: (routeId: string) => boolean;
  toggleSavedRoute: (route: SavedRoute) => void;
}

export const SavedRoutesContext = createContext<SavedRoutesContextValue | null>(null);

function readSavedRoutes() {
  const storedRoutes = localStorage.getItem(STORAGE_KEY);

  if (!storedRoutes) {
    return defaultSavedRoutes;
  }

  try {
    const parsed = JSON.parse(storedRoutes) as SavedRoute[];
    return Array.isArray(parsed) ? parsed : defaultSavedRoutes;
  } catch {
    return defaultSavedRoutes;
  }
}

export function SavedRoutesProvider({ children }: { children: ReactNode }) {
  const [savedRoutes, setSavedRoutes] = useState<SavedRoute[]>(() => readSavedRoutes());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRoutes));
  }, [savedRoutes]);

  function isSavedRoute(routeId: string) {
    return savedRoutes.some((route) => route.id === routeId);
  }

  function toggleSavedRoute(route: SavedRoute) {
    setSavedRoutes((currentRoutes) => {
      const alreadySaved = currentRoutes.some((savedRoute) => savedRoute.id === route.id);

      if (alreadySaved) {
        return currentRoutes.filter((savedRoute) => savedRoute.id !== route.id);
      }

      return [route, ...currentRoutes];
    });
  }

  const value = useMemo(
    () => ({
      savedRoutes,
      isSavedRoute,
      toggleSavedRoute,
    }),
    [savedRoutes],
  );

  return <SavedRoutesContext.Provider value={value}>{children}</SavedRoutesContext.Provider>;
}
