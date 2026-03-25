import { useEffect } from 'react';
import type { AppSettings } from '../../types/settings';
import './SettingsModal.css';

interface SettingsModalProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onChange, onClose }: SettingsModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggle = (key: keyof AppSettings) =>
    onChange({ ...settings, [key]: !settings[key] });

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={e => e.stopPropagation()}>
        <div className="settings-modal__header">
          <span className="settings-modal__title">Acessibilidade</span>
          <button className="settings-modal__close" onClick={onClose} aria-label="Fechar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="settings-modal__body">
          <SettingsRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            }
            label="Som"
            desc="Toca som de vitória ao acertar"
            checked={settings.soundEnabled}
            onToggle={() => toggle('soundEnabled')}
          />

          <SettingsRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            }
            label="Tema dinâmico"
            desc="Claro de dia (6h–18h), escuro à noite"
            checked={settings.dynamicTheme}
            onToggle={() => toggle('dynamicTheme')}
          />

          <SettingsRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
            label="Modo Difícil"
            desc="Esconde o tema durante o jogo"
            checked={settings.hardMode}
            onToggle={() => toggle('hardMode')}
          />

          <SettingsRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h16v3" />
                <path d="M9 20h6" />
                <path d="M12 4v16" />
              </svg>
            }
            label="Fonte para dislexia"
            desc="Usa a fonte OpenDyslexic"
            checked={settings.dyslexicFont}
            onToggle={() => toggle('dyslexicFont')}
          />

          <SettingsRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z" />
              </svg>
            }
            label="Modo daltonismo"
            desc="Troca verde/vermelho por azul/âmbar"
            checked={settings.colorblindMode}
            onToggle={() => toggle('colorblindMode')}
          />

          <SettingsRow
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            }
            label="Reduzir animações"
            desc="Desativa efeitos visuais"
            checked={settings.reduceMotion}
            onToggle={() => toggle('reduceMotion')}
          />
        </div>
      </div>
    </div>
  );
}

interface SettingsRowProps {
  icon: React.ReactNode;
  label: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
}

function SettingsRow({ icon, label, desc, checked, onToggle }: SettingsRowProps) {
  return (
    <div className="settings-row">
      <span className="settings-row__icon">{icon}</span>
      <div className="settings-row__text">
        <span className="settings-row__label">{label}</span>
        <span className="settings-row__desc">{desc}</span>
      </div>
      <button
        className={`settings-toggle${checked ? ' settings-toggle--on' : ''}`}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={onToggle}
      />
    </div>
  );
}
