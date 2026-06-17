import { useTranslation } from 'react-i18next';
import { useTheme } from '../src/contexts/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      aria-label={t('Common.theme_toggle')}
      title={t('Common.theme_current', {
        mode: theme === 'dark' ? t('Common.theme_dark') : t('Common.theme_light'),
      })}
    >
      {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </button>
  );
}
