import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameMode } from '../../types/game';
import { readGameStats, type ModeStats } from '../../utils/stats';
import { modeStyle } from '../../utils/modes';
import './StatsModal.css';

interface StatsModalProps {
  onClose: () => void;
}

const MODE_COLORS: Record<GameMode, string> = {
  calibra: '#06B6D4',
  recalibra: '#8B5CF6',
  excalibra: '#F97316',
};

const ALL_MODES: GameMode[] = ['calibra', 'recalibra', 'excalibra'];

function StatCard({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="stat-card">
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

function DistributionBar({ attempt, count, max, color }: { attempt: number; count: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max((count / max) * 100, count > 0 ? 8 : 0) : 0;
  return (
    <div className="dist-row">
      <span className="dist-row__num">{attempt}</span>
      <div className="dist-row__bar-wrap">
        <div className="dist-row__bar" style={{ width: `${pct}%`, background: color }}>
          <span className="dist-row__count">{count}</span>
        </div>
      </div>
    </div>
  );
}

function ModeSection({ mode, stats }: { mode: GameMode; stats: ModeStats }) {
  const { t } = useTranslation();
  const winRate = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxDist = Math.max(...stats.distribution);

  return (
    <div className="stats-mode">
      <div className="stats-mode__header">
        <span className="stats-mode__badge" style={modeStyle(mode)}>
          {t(`modes.${mode}`)}
        </span>
      </div>

      <div className="stats-mode__cards">
        <StatCard value={stats.played} label={t('stats.played')} />
        <StatCard value={`${winRate}%`} label={t('stats.wins')} />
        <StatCard value={stats.currentStreak} label={t('stats.currentStreak')} />
        <StatCard value={stats.bestStreak} label={t('stats.bestStreak')} />
      </div>

      <div className="stats-mode__dist">
        <p className="stats-mode__dist-title">{t('stats.distribution')}</p>
        {stats.distribution.map((count, i) => (
          <DistributionBar key={i} attempt={i + 1} count={count} max={maxDist} color={MODE_COLORS[mode]} />
        ))}
      </div>
    </div>
  );
}

export function StatsModal({ onClose }: StatsModalProps) {
  const { t } = useTranslation();
  const stats = readGameStats();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="stats-overlay" onClick={onClose}>
      <div className="stats-modal" onClick={e => e.stopPropagation()}>
        <div className="stats-modal__scroll">

          <div className="stats-modal__header">
            <h2 className="stats-modal__title">{t('stats.title')}</h2>
            <button className="stats-modal__close" onClick={onClose} aria-label={t('common.close')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Overall */}
          <div className="stats-overall">
            <p className="stats-section__title">{t('stats.overall')}</p>
            <div className="stats-overall__cards">
              <StatCard value={stats.overall.daysWithAnyMode} label={t('stats.daysPlayed')} />
              <StatCard value={stats.overall.daysWithAllModes} label={t('stats.daysCompleted')} />
              <StatCard value={stats.overall.currentStreak} label={t('stats.streak')} />
              <StatCard value={stats.overall.bestStreak} label={t('stats.best')} />
            </div>
          </div>

          <div className="stats-divider" />

          {/* Per mode */}
          <p className="stats-section__title">{t('stats.byMode')}</p>
          {ALL_MODES.map(mode => (
            <ModeSection key={mode} mode={mode} stats={stats.modes[mode]} />
          ))}

        </div>

        <div className="stats-modal__footer">
          <button className="stats-modal__btn" onClick={onClose}>{t('stats.close')}</button>
        </div>
      </div>
    </div>
  );
}
