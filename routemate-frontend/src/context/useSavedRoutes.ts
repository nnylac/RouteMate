import { useContext } from 'react';
import { SavedRoutesContext } from './SavedRoutesContext';

export function useSavedRoutes() {
  const context = useContext(SavedRoutesContext);

  if (!context) {
    throw new Error('useSavedRoutes must be used within a SavedRoutesProvider');
  }

  return context;
}
