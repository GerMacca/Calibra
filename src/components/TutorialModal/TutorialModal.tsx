import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './TutorialModal.css';

interface TutorialModalProps {
  onClose: () => void;
}

function DragHandle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function CheckBadge() {
  return (
    <span className="demo-badge">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </span>
  );
}

export function TutorialModal({ onClose }: TutorialModalProps) {
  const { t } = useTranslation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const demoItems = t('tutorial.demoItems', { returnObjects: true }) as string[];

  return (
    <div className="tutorial-overlay" onClick={onClose}>
      <div className="tutorial-modal" onClick={e => e.stopPropagation()}>
        <div className="tutorial-modal__scroll">

          {/* Header */}
          <div className="tutorial-modal__header">
            <h2 className="tutorial-modal__title">{t('tutorial.title')}</h2>
            <button className="tutorial-modal__close" onClick={onClose} aria-label={t('common.close')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="tutorial-modal__body">

            {/* Step 1: Drag to reorder */}
            <div className="tutorial-section" style={{ animationDelay: '80ms' }}>
              <p className="tutorial-section__label">
                <span className="tutorial-section__num">1</span>
                {t('tutorial.step1')}
              </p>
              <div className="tutorial-demo">
                <div className="demo-items">
                  <div className="demo-item demo-item--active">
                    <span className="demo-item__index">1</span>
                    <span className="demo-item__label">{demoItems[0]}</span>
                    <span className="demo-item__handle"><DragHandle /></span>
                  </div>

                  <div className="demo-swap-arrow">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="18 8 12 2 6 8" />
                      <polyline points="6 16 12 22 18 16" />
                      <line x1="12" y1="2" x2="12" y2="22" />
                    </svg>
                  </div>

                  <div className="demo-item">
                    <span className="demo-item__index">2</span>
                    <span className="demo-item__label">{demoItems[1]}</span>
                    <span className="demo-item__handle"><DragHandle /></span>
                  </div>

                  <div className="demo-item">
                    <span className="demo-item__index">3</span>
                    <span className="demo-item__label">{demoItems[2]}</span>
                    <span className="demo-item__handle"><DragHandle /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Confirm and see result */}
            <div className="tutorial-section" style={{ animationDelay: '160ms' }}>
              <p className="tutorial-section__label">
                <span className="tutorial-section__num">2</span>
                {t('tutorial.step2')}
              </p>
              <div className="tutorial-demo">
                <div className="demo-items">
                  <div className="demo-item demo-item--correct">
                    <span className="demo-item__index">1</span>
                    <span className="demo-item__label">{demoItems[0]}</span>
                    <span className="demo-dot demo-dot--correct" />
                  </div>
                  <div className="demo-item demo-item--wrong">
                    <span className="demo-item__index">2</span>
                    <span className="demo-item__label">{demoItems[1]}</span>
                    <span className="demo-dot demo-dot--wrong" />
                  </div>
                  <div className="demo-item demo-item--wrong">
                    <span className="demo-item__index">3</span>
                    <span className="demo-item__label">{demoItems[2]}</span>
                    <span className="demo-dot demo-dot--wrong" />
                  </div>
                </div>
                <p className="tutorial-demo__hint">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span dangerouslySetInnerHTML={{ __html: t('tutorial.step2hint') }} />
                </p>
              </div>
            </div>

            {/* Step 3: Locked item */}
            <div className="tutorial-section" style={{ animationDelay: '240ms' }}>
              <p className="tutorial-section__label">
                <span className="tutorial-section__num">3</span>
                {t('tutorial.step3')}
              </p>
              <div className="tutorial-demo">
                <div className="demo-items">
                  <div className="demo-item demo-item--confirmed">
                    <span className="demo-item__index">1</span>
                    <span className="demo-item__label">{demoItems[0]}</span>
                    <CheckBadge />
                  </div>
                  <div className="demo-item">
                    <span className="demo-item__index">2</span>
                    <span className="demo-item__label">{demoItems[1]}</span>
                    <span className="demo-item__handle"><DragHandle /></span>
                  </div>
                  <div className="demo-item">
                    <span className="demo-item__index">3</span>
                    <span className="demo-item__label">{demoItems[2]}</span>
                    <span className="demo-item__handle"><DragHandle /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 4: Lives */}
            <div className="tutorial-section" style={{ animationDelay: '320ms' }}>
              <p className="tutorial-section__label">
                <span className="tutorial-section__num">4</span>
                <span dangerouslySetInnerHTML={{ __html: t('tutorial.step4label') }} />
              </p>
              <div className="tutorial-demo tutorial-demo--lives">
                {[0, 1, 2].map(i => (
                  <svg key={i} className="demo-heart" style={{ animationDelay: `${400 + i * 80}ms` }}
                    width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                ))}
              </div>
            </div>

            {/* Step 5: Settings */}
            <div className="tutorial-section" style={{ animationDelay: '400ms' }}>
              <p className="tutorial-section__label">
                <span className="tutorial-section__num">5</span>
                <span dangerouslySetInnerHTML={{ __html: t('tutorial.step5') }} />
              </p>
              <div className="tutorial-demo">
                <div className="tutorial-settings-list">

                  <div className="tutorial-setting tutorial-setting--highlight">
                    <span className="tutorial-setting__icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </span>
                    <div className="tutorial-setting__text">
                      <span className="tutorial-setting__label">{t('tutorial.settings.hardMode')}</span>
                      <span className="tutorial-setting__desc">{t('tutorial.settings.hardModeDesc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-setting">
                    <span className="tutorial-setting__icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" />
                      </svg>
                    </span>
                    <div className="tutorial-setting__text">
                      <span className="tutorial-setting__label">{t('tutorial.settings.dyslexia')}</span>
                      <span className="tutorial-setting__desc">{t('tutorial.settings.dyslexiaDesc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-setting">
                    <span className="tutorial-setting__icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 5C7 5 2.73 8.11 1 12.5 2.73 16.89 7 20 12 20s9.27-3.11 11-7.5C21.27 8.11 17 5 12 5z" />
                      </svg>
                    </span>
                    <div className="tutorial-setting__text">
                      <span className="tutorial-setting__label">{t('tutorial.settings.colorblind')}</span>
                      <span className="tutorial-setting__desc">{t('tutorial.settings.colorblindDesc')}</span>
                    </div>
                  </div>

                  <div className="tutorial-setting">
                    <span className="tutorial-setting__icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      </svg>
                    </span>
                    <div className="tutorial-setting__text">
                      <span className="tutorial-setting__label">{t('tutorial.settings.sound')}</span>
                      <span className="tutorial-setting__desc">{t('tutorial.settings.soundDesc')}</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>{/* end scroll */}

        <div className="tutorial-modal__footer">
          <button className="tutorial-modal__btn" onClick={onClose}>
            {t('common.play')}
          </button>
        </div>
      </div>
    </div>
  );
}
