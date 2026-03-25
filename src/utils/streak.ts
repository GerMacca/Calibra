import type { GameMode } from '../types/game';

interface StreakData {
  date: string;
  count: number;
  best: number;
}

const ALL_MODES: GameMode[] = ['calibra', 'recalibra', 'excalibra'];

function streakKey(id: string): string {
  return `calibra_streak_${id}`;
}

function getYesterday(date: string): string {
  const d = new Date(date + 'T12:00:00');
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function readStreakData(id: string): StreakData {
  try {
    const raw = localStorage.getItem(streakKey(id));
    if (raw) return JSON.parse(raw) as StreakData;
  } catch { /* ignore */ }
  return { date: '', count: 0, best: 0 };
}

export function readStreak(id: string, today: string): number {
  const s = readStreakData(id);
  const yesterday = getYesterday(today);
  if (s.date === today || s.date === yesterday) return s.count;
  return 0;
}

export function readBestStreak(id: string): number {
  return readStreakData(id).best;
}

export function updateStreak(id: string, today: string): number {
  try {
    const s = readStreakData(id);
    if (s.date === today) return s.count;
    const yesterday = getYesterday(today);
    const newCount = s.date === yesterday ? s.count + 1 : 1;
    const best = Math.max(newCount, s.best);
    localStorage.setItem(streakKey(id), JSON.stringify({ date: today, count: newCount, best }));
    return newCount;
  } catch { return 0; }
}

/** Reads streaks for all modes + overall without updating */
export function readAllStreaks(today: string): Record<string, number> {
  const result: Record<string, number> = { all: readStreak('all', today) };
  ALL_MODES.forEach(mode => { result[mode] = readStreak(mode, today); });
  return result;
}

/** Updates streaks based on which modes are completed today */
export function syncStreaks(completedModes: Set<GameMode>, today: string): Record<string, number> {
  const result: Record<string, number> = {};
  ALL_MODES.forEach(mode => {
    result[mode] = completedModes.has(mode)
      ? updateStreak(mode, today)
      : readStreak(mode, today);
  });
  const allDone = ALL_MODES.every(m => completedModes.has(m));
  result['all'] = allDone ? updateStreak('all', today) : readStreak('all', today);
  return result;
}
