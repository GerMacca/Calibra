import type { GameMode, AttemptGrid } from '../types/game';

const MODE_NAMES: Record<GameMode, string> = {
  calibra: 'Calibra',
  recalibra: 'Recalibra',
  excalibra: 'Excalibra',
};

export function buildShareText(
  mode: GameMode,
  date: string,
  grid: AttemptGrid,
  solved: boolean,
  maxLives: number
): string {
  const modeName = MODE_NAMES[mode];
  const [year, month, day] = date.split('-');
  const formattedDate = `${day}/${month}/${year}`;
  const attemptsUsed = grid.length;
  const result = solved ? `${attemptsUsed}/${maxLives}` : `X/${maxLives}`;

  const emojiGrid = grid
    .map(row => row.map(correct => (correct ? '🟩' : '🟥')).join(''))
    .join('\n');

  return `${modeName} ${formattedDate} — ${result}\n\n${emojiGrid}`;
}
