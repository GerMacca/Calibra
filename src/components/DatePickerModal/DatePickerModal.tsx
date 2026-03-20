import { useEffect, useState } from 'react';
import { loadIndex, getToday } from '../../utils/puzzle';
import type { GameMode } from '../../types/game';
import './DatePickerModal.css';

interface DatePickerModalProps {
  selectedDate: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}

const ALL_MODES: GameMode[] = ['calibra', 'recalibra', 'excalibra'];
const MODE_COLORS: Record<GameMode, string> = {
  calibra: 'var(--color-calibra)',
  recalibra: 'var(--color-recalibra)',
  excalibra: 'var(--color-excalibra)',
};
const PT_MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const PT_WEEKDAYS_SHORT = ['D','S','T','Q','Q','S','S'];

function toYearMonth(date: string): string { return date.slice(0, 7); }
function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstWeekday(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function getModeStatus(date: string): Record<GameMode, 'done' | 'failed' | 'none'> {
  const result = { calibra: 'none', recalibra: 'none', excalibra: 'none' } as Record<GameMode, 'done' | 'failed' | 'none'>;
  ALL_MODES.forEach(mode => {
    try {
      const raw = localStorage.getItem(`calibra_${mode}_${date}`);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.done) result[mode] = saved.solved ? 'done' : 'failed';
    } catch { /* ignore */ }
  });
  return result;
}

export function DatePickerModal({ selectedDate, onSelect, onClose }: DatePickerModalProps) {
  const today = getToday();
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());

  // Start on the month of the most recent available date (or today)
  const initialDate = new Date(selectedDate + 'T12:00:00');
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    loadIndex().then(dates => setAvailableDates(new Set(dates)));
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Months that have at least one available date
  const availableMonths = new Set([...availableDates].map(toYearMonth));
  const currentYM = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`;

  const canGoPrev = [...availableMonths].some(ym => ym < currentYM);
  const canGoNext = [...availableMonths].some(ym => ym > currentYM);

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }

  const firstWeekday = getFirstWeekday(viewYear, viewMonth);
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return (
    <div className="datepicker-overlay" onClick={onClose}>
      <div className="datepicker-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="datepicker-modal__header">
          <h2 className="datepicker-modal__title">Escolher data</h2>
          <button className="datepicker-modal__close" onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Month navigation */}
        <div className="datepicker-nav">
          <button className="datepicker-nav__btn" onClick={prevMonth} disabled={!canGoPrev} aria-label="Mês anterior">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="datepicker-nav__label">{PT_MONTHS[viewMonth]} {viewYear}</span>
          <button className="datepicker-nav__btn" onClick={nextMonth} disabled={!canGoNext} aria-label="Próximo mês">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Weekday headers */}
        <div className="datepicker-grid">
          {PT_WEEKDAYS_SHORT.map((d, i) => (
            <div key={i} className="datepicker-weekday">{d}</div>
          ))}

          {/* Calendar cells */}
          {Array.from({ length: totalCells }, (_, i) => {
            const day = i - firstWeekday + 1;
            if (day < 1 || day > daysInMonth) {
              return <div key={i} className="datepicker-cell datepicker-cell--empty" />;
            }

            const dateStr = toDateStr(viewYear, viewMonth, day);
            const isAvailable = availableDates.has(dateStr);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today;
            const status = isAvailable ? getModeStatus(dateStr) : null;

            return (
              <button
                key={i}
                className={[
                  'datepicker-cell',
                  isAvailable ? 'datepicker-cell--available' : 'datepicker-cell--disabled',
                  isSelected ? 'datepicker-cell--selected' : '',
                  isToday ? 'datepicker-cell--today' : '',
                ].filter(Boolean).join(' ')}
                onClick={() => { if (isAvailable) { onSelect(dateStr); onClose(); } }}
                disabled={!isAvailable}
              >
                <span className="datepicker-cell__day">{day}</span>
                {status && (
                  <div className="datepicker-cell__dots">
                    {ALL_MODES.map(mode => (
                      <span
                        key={mode}
                        className={`datepicker-cell__dot datepicker-cell__dot--${status[mode]}`}
                        style={{ '--dot-color': MODE_COLORS[mode] } as React.CSSProperties}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="datepicker-legend">
          {ALL_MODES.map(mode => (
            <div key={mode} className="datepicker-legend__item">
              <span className="datepicker-legend__dot" style={{ background: MODE_COLORS[mode] }} />
              <span className="datepicker-legend__label">{mode.charAt(0).toUpperCase() + mode.slice(1)}</span>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
