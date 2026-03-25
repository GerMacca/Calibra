import type { GameMode } from '../../types/game';
import { modeStyle } from '../../utils/modes';
import './Header.css';

interface HeaderProps {
  mode?: GameMode;
  onBack?: () => void;
  onStats?: () => void;
  onHelp?: () => void;
  onSettings?: () => void;
}

const MODE_LABELS: Record<GameMode, string> = {
  calibra: 'Calibra',
  recalibra: 'Recalibra',
  excalibra: 'Excalibra',
};

export function Header({ mode, onBack, onStats, onHelp, onSettings }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        {onBack ? (
          <button className="header__btn" onClick={onBack} aria-label="Voltar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
        ) : (
          <div className="header__spacer" />
        )}

        <div className="header__title">
          <span className="header__logo">Calibra</span>
          {mode && (
            <span className="header__mode" style={modeStyle(mode)}>
              {MODE_LABELS[mode]}
            </span>
          )}
        </div>

        <div className="header__actions">
          {onStats && (
            <button className="header__btn" onClick={onStats} aria-label="Estatísticas">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </button>
          )}
          {onHelp && (
            <button className="header__btn" onClick={onHelp} aria-label="Como jogar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </button>
          )}
          {onSettings && (
            <button className="header__btn" onClick={onSettings} aria-label="Configurações">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          )}
          {!onStats && !onHelp && !onSettings && <div className="header__spacer" />}
        </div>
      </div>
    </header>
  );
}
