import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from '../messages/en.json';
import ru from '../messages/ru.json';
import uz from '../messages/uz.json';

export const supportedLocales = ['uz', 'en', 'ru'] as const;
export type Locale = (typeof supportedLocales)[number];

export const localeLabels: Record<Locale, { flag: string; label: string }> = {
  uz: { flag: '🇺🇿', label: 'UZ' },
  en: { flag: '🇬🇧', label: 'EN' },
  ru: { flag: '🇷🇺', label: 'RU' },
};

// Default to English for first-time visitors who have no saved preference
if (typeof window !== 'undefined' && !localStorage.getItem('studentos-language')) {
  localStorage.setItem('studentos-language', 'en');
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      uz: { translation: uz },
    },
    lng: localStorage.getItem('studentos-language') || 'en',
    fallbackLng: 'en',
    supportedLngs: ['uz', 'en', 'ru'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'studentos-language',
      caches: ['localStorage'],
    },
  });

export default i18n;
