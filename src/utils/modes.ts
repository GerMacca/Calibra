import type { CSSProperties } from 'react';
import type { GameMode } from '../types/game';

/**
 * Single source of truth for per-mode visual identity.
 * Change a mode's colors here — no other file needs to know about mode names.
 */
const MODE_VARS: Record<GameMode, Record<string, string>> = {
  calibra:   { '--mode-color': '#06B6D4', '--mode-color-end': '#0284C7' },
  recalibra: { '--mode-color': '#8B5CF6', '--mode-color-end': '#6D28D9' },
  excalibra: { '--mode-color': '#F97316', '--mode-color-end': '#DC2626' },
};

/** Returns an inline style object with CSS custom properties for the given mode. */
export function modeStyle(mode: GameMode): CSSProperties {
  return MODE_VARS[mode] as CSSProperties;
}
