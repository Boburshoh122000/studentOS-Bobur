import { useTheme } from '../src/contexts/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/solid';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      aria-label="Toggle Dark Mode"
      title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} Mode`}
    >
      {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </button>
  );
}
