import type { GameMode } from '../../types/game';
import { modeStyle } from '../../utils/modes';
import './ModeSelector.css';

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
    description: 'Ordene 4 itens do menor ao maior',
    items: 4,
    difficulty: 'Fácil',
  },
  {
    mode: 'recalibra',
    label: 'Recalibra',
    description: 'Ordene 5 itens do menor ao maior',
    items: 5,
    difficulty: 'Médio',
  },
  {
    mode: 'excalibra',
    label: 'Excalibra',
    description: 'Ordene 6 itens do menor ao maior',
    items: 6,
    difficulty: 'Difícil',
  },
];

interface ModeSelectorProps {
  onSelect: (mode: GameMode) => void;
  completedModes: Set<GameMode>;
}

function clearSiteData() {
  localStorage.clear();
  location.reload();
}

export function ModeSelector({ onSelect, completedModes }: ModeSelectorProps) {
  return (
    <div className="mode-selector">
      <div className="mode-selector__hero">
        <h1 className="mode-selector__title">Calibra</h1>
        <p className="mode-selector__subtitle">
          Ordene os itens pelo critério secreto.<br />
          Descubra a ordem certa em até 3 tentativas.
        </p>
      </div>

      <div className="mode-selector__modes">
        {MODES.map(({ mode, label, description, items, difficulty }) => {
          const done = completedModes.has(mode);
          return (
            <button
              key={mode}
              className={`mode-card ${done ? 'mode-card--done' : ''}`}
              style={modeStyle(mode)}
              onClick={() => onSelect(mode)}
            >
              <div className="mode-card__top">
                <span className="mode-card__label">{label}</span>
                {done && (
                  <span className="mode-card__done-badge">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Feito
                  </span>
                )}
              </div>
              <p className="mode-card__desc">{description}</p>
              <div className="mode-card__meta">
                <span className="mode-card__items">{items} itens</span>
                <span className="mode-card__difficulty">
                  {difficulty}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={clearSiteData}></button>

      <p className="mode-selector__hint">
        Novo puzzle todo dia às meia-noite
      </p>
    </div>
  );
}
