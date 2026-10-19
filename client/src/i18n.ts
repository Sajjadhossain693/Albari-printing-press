import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationBn from './locales/bn/translation.json';
import translationEn from './locales/en/translation.json';

const resources = {
  bn: {
    translation: translationBn,
  },
  en: {
    translation: translationEn,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'bn',
    lng: localStorage.getItem('i18nextLng') || 'bn', // Bengali as default
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
