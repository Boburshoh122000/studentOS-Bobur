import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supportedLocales, localeLabels, type Locale } from '../src/i18n';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

interface LanguageSwitcherProps {
  /** Compact mode for collapsed sidebar — shows only the globe icon */
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLocale = (i18n.language?.substring(0, 2) as Locale) || 'en';
  const current = localeLabels[currentLocale] || localeLabels.en;

  // Close dropdown on outside click
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
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 rounded-xl transition-all duration-200 select-none
          ${
            compact
              ? 'justify-center p-2.5 size-10 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'px-3 py-2 text-[13px] font-medium text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 dark:text-gray-400 dark:hover:text-indigo-400'
          }
        `}
        title={compact ? `${current.flag} ${current.label}` : undefined}
        aria-label="Switch language"
      >
        <span className="text-base leading-none">{current.flag}</span>
        {!compact && (
          <>
            <span className="font-semibold">{current.label}</span>
            <ChevronDownIcon className="w-5 h-5" className={`text-[14px] transition-transform duration-200 ${isOpen ? '-rotate-180' : ''}`} />
          </>
        )}
      </button>

      {/* Dropdown Menu */}
      <div
        className={`
          absolute z-[100] mt-1 w-36 rounded-xl bg-white dark:bg-gray-900
          border border-gray-100 dark:border-gray-800
          shadow-xl shadow-black/[0.08] dark:shadow-black/30
          transition-all duration-200 origin-top
          ${compact ? 'left-full ml-2 top-0 mt-0 origin-left' : 'right-0'}
          ${isOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
        `}
      >
        <div className="p-1.5">
          {supportedLocales.map((locale) => {
            const { flag, label } = localeLabels[locale];
            const isActive = locale === currentLocale;
            return (
              <button
                key={locale}
                onClick={() => switchLanguage(locale)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium
                  transition-colors duration-150
                  ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
              >
                <span className="text-lg leading-none">{flag}</span>
                <span>{label}</span>
                {isActive && (
                  <CheckIcon className="w-4 h-4 text-indigo-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
