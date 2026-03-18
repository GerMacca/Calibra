import type { GameMode } from '../../types/game';
import './Header.css';

interface HeaderProps {
  mode?: GameMode;
  onBack?: () => void;
}

const MODE_LABELS: Record<GameMode, string> = {
  calibra: 'Calibra',
  recalibra: 'Recalibra',
  excalibra: 'Excalibra',
};

export function Header({ mode, onBack }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        {onBack ? (
          <button className="header__back" onClick={onBack} aria-label="Voltar">
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
            <span className={`header__mode header__mode--${mode}`}>
              {MODE_LABELS[mode]}
            </span>
          )}
        </div>

        <div className="header__spacer" />
      </div>
    </header>
  );
}
