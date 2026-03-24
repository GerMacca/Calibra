import type { GameMode, Puzzle, PuzzleItem } from '../types/game';

export function getToday(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export async function loadIndex(): Promise<string[]> {
  try {
    const res = await fetch('/data/index.json');
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function dateKey(date: string): number {
  return date.split('').reduce((acc, c) => acc ^ c.charCodeAt(0), 0);
}

export async function loadPuzzle(mode: GameMode, date: string): Promise<Puzzle> {
  const res = await fetch(`/data/${mode}/${date}.json`);
  if (!res.ok) {
    throw new Error(`Puzzle not found for ${mode} on ${date}`);
  }
  const data = await res.json();
  const key = dateKey(date);
  return {
    ...data,
    mode,
    items: data.items.map((item: PuzzleItem) => ({ ...item, value: item.value ^ key })),
  };
}

export function getCorrectOrder(puzzle: Puzzle): string[] {
  return [...puzzle.items]
    .sort((a, b) => b.value - a.value)
    .map(item => item.label);
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
