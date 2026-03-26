import { useState } from 'react';
import type { GameMode, SavedState, AttemptGrid } from '../../types/game';
import { modeStyle } from '../../utils/modes';
import { buildShareText } from '../../utils/share';
import { getToday } from '../../utils/puzzle';
import { syncStreaks } from '../../utils/streak';
import { useCountdown } from '../../hooks/useCountdown';
import { DatePickerModal } from '../DatePickerModal/DatePickerModal';
import './ModeSelector.css';

const MAX_LIVES = 3;

interface ModeConfig {
  mode: GameMode;
  label: string;
  description: string;
  items: number;
  difficulty: string;
}

const MODES: ModeConfig[] = [
  {
    mode: 'calibra',
    label: 'Calibra',
    description: 'Ordene 4 itens do maior ao menor',
    items: 4,
    difficulty: 'Fácil',
  },
  {
    mode: 'recalibra',
    label: 'Recalibra',
    description: 'Ordene 5 itens do maior ao menor',
    items: 5,
    difficulty: 'Médio',
  },
  {
    mode: 'excalibra',
    label: 'Excalibra',
    description: 'Ordene 6 itens do maior ao menor',
    items: 6,
    difficulty: 'Difícil',
  },
];

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void;
  completedModes: Set<GameMode>;
  savedStates: Partial<Record<GameMode, SavedState>>;
  selectedDate: string;
  onDateChange: (date: string) => void;
}


function MiniGrid({ grid }: { grid: AttemptGrid }) {
  return (
    <div className="mode-card__mini-grid">
      {grid.map((row, i) => (
        <div key={i} className="mode-card__mini-row">
          {row.map((correct, j) => (
            <div
              key={j}
              className={`mode-card__mini-cell ${correct ? 'mode-card__mini-cell--correct' : 'mode-card__mini-cell--wrong'}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function ItemDots({ count }: { count: number }) {
  return (
    <div className="mode-card__dots">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="mode-card__dot" />
      ))}
    </div>
  );
}

const PT_MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

function formatSelectedDate(date: string): string {
  const d = new Date(date + 'T12:00:00');
  return `${d.getDate()} de ${PT_MONTHS_SHORT[d.getMonth()]} de ${d.getFullYear()}`;
}

export function ModeSelector({ onSelect, completedModes, savedStates, selectedDate, onDateChange }: ModeSelectorProps) {
  const today = getToday();
  const countdown = useCountdown();
  const streaks = selectedDate === today
    ? syncStreaks(completedModes, today)
    : { all: 0, calibra: 0, recalibra: 0, excalibra: 0 };
  const streak = streaks['all'];
  const [copied, setCopied] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const isPastDate = selectedDate !== today;

  const doneCount = completedModes.size;
  const totalCount = MODES.length;
  const allDone = doneCount === totalCount;

  const sortedModes = [...MODES].sort((a, b) => {
    return (completedModes.has(a.mode) ? 1 : 0) - (completedModes.has(b.mode) ? 1 : 0);
  });

  function handleShareAll() {
    const parts = MODES
      .filter(m => completedModes.has(m.mode) && savedStates[m.mode])
      .map(m => {
        const s = savedStates[m.mode]!;
        return buildShareText(m.mode, today, s.grid, s.solved, MAX_LIVES);
      });
    const text = parts.join('\n\n---\n\n');
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="mode-selector">
      {isPastDate && (
        <div className="mode-selector__past-banner">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{formatSelectedDate(selectedDate)}</span>
          <button className="mode-selector__past-back" onClick={() => onDateChange(today)}>
            Voltar para hoje
          </button>
        </div>
      )}

      <div className="mode-selector__hero">
        <p className="mode-selector__subtitle">
          Ordene os itens pelo critério apresentado (ou não).<br />
          Descubra a ordem certa em até 3 tentativas.
        </p>
      </div>

      <div className="mode-selector__stats">
        {streak > 0 && (
          <div className="mode-selector__streak">
            <svg className="mode-selector__streak-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 011.925-3.545 3.75 3.75 0 013.255 3.717z" clipRule="evenodd" />
            </svg>
            <span className="mode-selector__streak-count">{streak}</span>
            <span className="mode-selector__streak-label">dia{streak !== 1 ? 's' : ''}</span>
          </div>
        )}
        <div className="mode-selector__progress">
          <span className="mode-selector__progress-text">{doneCount} de {totalCount} completos</span>
          <div className="mode-selector__progress-bar">
            <div
              className="mode-selector__progress-fill"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mode-selector__modes">
        {sortedModes.map(({ mode, label, description, items, difficulty }, idx) => {
          const done = completedModes.has(mode);
          const saved = savedStates[mode];
          const attemptsUsed = saved?.attempts ?? 0;
          return (
            <button
              key={mode}
              className={`mode-card ${done ? 'mode-card--done' : ''} mode-card--anim-${idx}`}
              style={modeStyle(mode)}
              onClick={() => onSelect(mode)}
            >
              <div className="mode-card__top">
                <span className="mode-card__label">{label}</span>
                {done ? (
                  <span className="mode-card__done-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {saved?.solved ? `${attemptsUsed}/${MAX_LIVES}` : `X/${MAX_LIVES}`}
                  </span>
                ) : (
                  <span className="mode-card__difficulty">{difficulty}</span>
                )}
              </div>
              <p className="mode-card__desc">{description}</p>
              {streaks[mode] > 0 && (
                <p className="mode-card__streak">
                  🔥 {streaks[mode]} dia{streaks[mode] !== 1 ? 's' : ''} seguidos
                </p>
              )}
              <div className="mode-card__meta">
                <ItemDots count={items} />
                {done && saved?.grid && <MiniGrid grid={saved.grid} />}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mode-selector__footer">
        {allDone && (
          <button className="mode-selector__share-btn" onClick={handleShareAll}>
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copiado!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Compartilhar dia
              </>
            )}
          </button>
        )}
        {!isPastDate && (
          <p className="mode-selector__hint">
            Próximo puzzle em <span className="mode-selector__countdown">{countdown}</span>
          </p>
        )}
        <button className="mode-selector__calendar" onClick={() => setShowDatePicker(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          Dias anteriores
        </button>
      </div>

      {showDatePicker && (
        <DatePickerModal
          selectedDate={selectedDate}
          onSelect={onDateChange}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}
