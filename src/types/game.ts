export type GameMode = 'calibra' | 'recalibra' | 'excalibra';

export type GameState =
  | 'IDLE'
  | 'WRONG'
  | 'WIN'
  | 'GAME_OVER'
  | 'RESULT';

export interface PuzzleItem {
  label: string;
  value: number;
}

export interface Puzzle {
  date: string;
  mode: GameMode;
  criteria: string;
  criteria_source?: string;
  items: PuzzleItem[];
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
