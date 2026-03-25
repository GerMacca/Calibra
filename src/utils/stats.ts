import type { GameMode, SavedState } from '../types/game';
import { readStreak, readBestStreak } from './streak';
import { getToday } from './puzzle';

const ALL_MODES: GameMode[] = ['calibra', 'recalibra', 'excalibra'];

export interface ModeStats {
  played: number;
  won: number;
  currentStreak: number;
  bestStreak: number;
  distribution: [number, number, number]; // vitórias em 1, 2 e 3 tentativas
}

export interface OverallStats {
  daysWithAnyMode: number;
  daysWithAllModes: number;
  currentStreak: number;
  bestStreak: number;
}

export interface GameStats {
  modes: Record<GameMode, ModeStats>;
  overall: OverallStats;
}

export function readGameStats(): GameStats {
  const today = getToday();

  const modes: Record<GameMode, ModeStats> = {
    calibra:   { played: 0, won: 0, currentStreak: 0, bestStreak: 0, distribution: [0, 0, 0] },
    recalibra: { played: 0, won: 0, currentStreak: 0, bestStreak: 0, distribution: [0, 0, 0] },
    excalibra: { played: 0, won: 0, currentStreak: 0, bestStreak: 0, distribution: [0, 0, 0] },
  };

  const dateModesMap = new Map<string, Set<GameMode>>();

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;

    const match = key.match(/^calibra_(calibra|recalibra|excalibra)_(\d{4}-\d{2}-\d{2})$/);
    if (!match) continue;

    const mode = match[1] as GameMode;
    const date = match[2];

    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const saved = JSON.parse(raw) as SavedState;
      if (!saved.done) continue;

      modes[mode].played++;
      if (saved.solved) {
        modes[mode].won++;
        const idx = Math.min(Math.max(saved.attempts, 1), 3) - 1;
        modes[mode].distribution[idx]++;
      }

      if (!dateModesMap.has(date)) dateModesMap.set(date, new Set());
      dateModesMap.get(date)!.add(mode);
    } catch { /* ignore */ }
  }

  ALL_MODES.forEach(mode => {
    modes[mode].currentStreak = readStreak(mode, today);
    modes[mode].bestStreak = readBestStreak(mode);
  });

  return {
    modes,
    overall: {
      daysWithAnyMode: dateModesMap.size,
      daysWithAllModes: [...dateModesMap.values()].filter(s => ALL_MODES.every(m => s.has(m))).length,
      currentStreak: readStreak('all', today),
      bestStreak: readBestStreak('all'),
    },
  };
}
