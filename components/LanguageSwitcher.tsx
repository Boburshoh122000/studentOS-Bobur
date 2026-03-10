import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLocales, localeLabels, type Locale } from '../src/i18n';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const FLAG_IMG: Record<Locale, string> = {
  uz: '/flags/uz.png',
  en: '/flags/gb.png',
  ru: '/flags/ru.png',
};

interface LanguageSwitcherProps {
  /** Compact mode for collapsed sidebar — shows only the flag */
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = (i18n.language?.substring(0, 2) as Locale) || 'en';
  const current = localeLabels[currentLocale] || localeLabels.en;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const switchLanguage = (locale: Locale) => {
    i18n.changeLanguage(locale);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 rounded-xl transition-all duration-200 select-none
          ${
            compact
              ? 'justify-center p-2 size-10 hover:bg-gray-100 dark:hover:bg-white/[0.07]'
              : 'px-2.5 py-1.5 text-[13px] font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/[0.07]'
          }
        `}
        title={compact ? current.label : undefined}
        aria-label="Switch language"
      >
        <img
          src={FLAG_IMG[currentLocale]}
          alt={current.label}
          className="w-5 h-3.5 rounded-[2px] object-cover flex-shrink-0"
        />
        {!compact && (
          <>
            <span className="font-semibold">{current.label}</span>
            <ChevronDownIcon
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? '-rotate-180' : ''}`}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      <div
        className={`
          absolute z-[100] mt-1 w-36 rounded-xl bg-white dark:bg-[#1a1f32]
          border border-gray-100 dark:border-white/[0.08]
          shadow-xl shadow-black/[0.08] dark:shadow-black/30
          transition-all duration-200 origin-top-right
          ${compact ? 'left-full ml-2 top-0 mt-0 origin-left' : 'right-0'}
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
        `}
      >
        <div className="p-1.5">
          {supportedLocales.map((locale) => {
            const { label } = localeLabels[locale];
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                type="button"
                onClick={() => switchLanguage(locale)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'bg-primary/[0.08] text-primary dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.06] hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <img
                  src={FLAG_IMG[locale]}
                  alt={label}
                  className="w-5 h-3.5 rounded-[2px] object-cover flex-shrink-0"
                />
                <span className="flex-1 text-left">{label}</span>
                {isActive && <CheckIcon className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
