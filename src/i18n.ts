import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../messages/en.json';
import ru from '../messages/ru.json';
import uz from '../messages/uz.json';

export const supportedLocales = ['en', 'ru', 'uz'] as const;
export type Locale = (typeof supportedLocales)[number];

export const localeLabels: Record<Locale, { flag: string; label: string }> = {
  en: { flag: '🇬🇧', label: 'EN' },
  ru: { flag: '🇷🇺', label: 'RU' },
  uz: { flag: '🇺🇿', label: 'UZ' },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru', 'uz'],
    interpolation: {
      escapeValue: false, // React already handles XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'studentos-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
