import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

const LOCALE_KEY = 'roomflow-locale';

const getInitialLanguage = () => {
  if (typeof window === 'undefined') {
    return 'ru';
  }

  const saved = window.localStorage.getItem(LOCALE_KEY);
  if (saved === 'ru' || saved === 'en') {
    return saved;
  }

  return 'ru';
};

void i18n.use(initReactI18next).init({
  resources: {
    ru: {translation: ru},
    en: {translation: en},
  },
  lng: getInitialLanguage(),
  fallbackLng: 'ru',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', (lang) => {
  if (lang === 'ru' || lang === 'en') {
    window.localStorage.setItem(LOCALE_KEY, lang);
  }
});

export default i18n;
