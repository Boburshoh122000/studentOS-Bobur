
import React from 'react';
import { useTheme } from '../src/contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme}
      className="p-2 rounded-full text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
      aria-label="Toggle Dark Mode"
      title={`Current: ${theme === 'dark' ? 'Dark' : 'Light'} Mode`}
    >
      <span className="material-symbols-outlined text-[20px] transition-transform active:rotate-180">
        {theme === 'dark' ? 'light_mode' : 'dark_mode'}
      </span>
    </button>
  );
}
