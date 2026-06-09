import forms from '@tailwindcss/forms';
import containerQueries from '@tailwindcss/container-queries';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './index.tsx',
    './src/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D4DE0',
        'primary-dark': '#1E3BB3',
        'background-light': '#f6f6f8',
        'background-dark': '#111421',
        'slate-850': '#1a202c',
        'card-light': '#ffffff',
        'card-dark': '#1e2130',
        'text-main': '#0e111b',
        'text-sub': '#505d95',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        'surface-dark': '#1a1f32',
        'border-light': '#e8eaf3',
        'border-dark': '#2a3146',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        full: '9999px',
      },
      animation: {
        blob: 'blob 7s infinite',
        float: 'float 6s ease-in-out infinite',
        'slide-in-left': 'slideInLeft 0.25s ease-out',
        'qa-scroll': 'qa-scroll 28s linear infinite',
      },
      keyframes: {
        'qa-scroll': {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [forms, containerQueries],
};
