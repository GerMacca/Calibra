// Run once: node scripts/encode-puzzles.js
// Encodes all puzzle JSON values in-place using XOR with a date-derived key.
// Safe to run multiple times (XOR is symmetric — running twice restores originals).

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

function dateKey(date) {
  return date.split('').reduce((acc, c) => acc ^ c.charCodeAt(0), 0);
}

const modes = ['calibra', 'recalibra', 'excalibra'];
const dataDir = join(import.meta.dirname, '..', 'public', 'data');

for (const mode of modes) {
  const dir = join(dataDir, mode);
  let files;
  try {
    files = readdirSync(dir).filter(f => f.endsWith('.json'));
  } catch {
    continue;
  }

  for (const file of files) {
    const date = file.replace('.json', '');
    const path = join(dir, file);
    const puzzle = JSON.parse(readFileSync(path, 'utf8'));
    const key = dateKey(date);
    puzzle.items = puzzle.items.map(item => ({ ...item, value: item.value ^ key }));
    writeFileSync(path, JSON.stringify(puzzle, null, 2));
    console.log(`encoded ${mode}/${file} (key=${key})`);
  }
}

console.log('done');
