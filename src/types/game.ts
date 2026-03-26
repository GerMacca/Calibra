export type GameMode = 'calibra' | 'recalibra' | 'excalibra';

export type GameState =
  | 'IDLE'
  | 'WRONG'
  | 'WIN'
  | 'GAME_OVER'
  | 'RESULT';

export type Lang = 'pt' | 'en' | 'es';

export interface LocalizedString {
  pt: string;
  en: string;
  es: string;
}

export interface PuzzleItem {
  label: string | LocalizedString;
  value: number;
}

export interface Puzzle {
  date: string;
  mode: GameMode;
  criteria: string | LocalizedString;
  criteria_source?: string;
  items: PuzzleItem[];
}

/** Resolve a string or localized string to a plain string */
export function localize(value: string | LocalizedString, lang: Lang): string {
  if (typeof value === 'string') return value;
  return value[lang] ?? value.pt;
}

export type AttemptRow = boolean[];
export type AttemptGrid = AttemptRow[];

export interface SavedState {
  date: string;
  mode: GameMode;
  attempts: number;
  solved: boolean;
  done: boolean;
  grid: AttemptGrid;
  livesLeft: number;
  items: string[];
}
