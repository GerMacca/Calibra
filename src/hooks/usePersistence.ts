import { useCallback } from 'react';
import type { GameMode, SavedState } from '../types/game';

function getKey(mode: GameMode, date: string): string {
  return `calibra_${mode}_${date}`;
}

export function usePersistence() {
  const load = useCallback((mode: GameMode, date: string): SavedState | null => {
    try {
      const raw = localStorage.getItem(getKey(mode, date));
      return raw ? (JSON.parse(raw) as SavedState) : null;
    } catch {
      return null;
    }
  }, []);

  const save = useCallback((state: SavedState) => {
    const key = getKey(state.mode, state.date);
    localStorage.setItem(key, JSON.stringify(state));
  }, []);

  return { load, save };
}
