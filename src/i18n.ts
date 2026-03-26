import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';

const STORAGE_KEY = 'calibra_lang';

function detectLanguage(): string {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && ['pt', 'en', 'es'].includes(saved)) return saved;
  const browser = navigator.language.slice(0, 2).toLowerCase();
  if (browser === 'es') return 'es';
  if (browser === 'en') return 'en';
  return 'pt';
}

i18n
  .use(initReactI18next)
  .init({
    resources: { pt: { translation: pt }, en: { translation: en }, es: { translation: es } },
    lng: detectLanguage(),
    fallbackLng: 'pt',
    interpolation: { escapeValue: false },
  });

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
  localStorage.setItem(STORAGE_KEY, lang);
}

export default i18n;
