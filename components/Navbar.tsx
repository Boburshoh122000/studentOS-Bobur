import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navbar({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  const navLinks = [
    { key: 'Header.product', to: '/' },
    { key: 'Header.features', to: '/features' },
    { key: 'Header.pricing', to: '/pricing' },
    { key: 'Header.resources', to: '/resources' },
  ];

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
      <div className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex items-center justify-between px-6 py-3">
        {/* Left: Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none"
          onClick={() => navigateTo(Screen.LANDING)}
        >
          <span className="text-lg font-bold text-gray-900 tracking-tight">StudentOS</span>
        </div>

        {/* Center: Links */}
        <nav className="hidden md:flex items-center gap-7">
          {navLinks.map((l) => (
            <button
              key={l.key}
              onClick={() => navigate(l.to)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              {t(l.key)}
            </button>
          ))}
        </nav>

        {/* Right: Auth / CTA */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <div
                className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white cursor-pointer hover:ring-indigo-400 transition-all hidden sm:block"
                style={{
                  backgroundImage: `url('${user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.fullName || user?.email?.split('@')[0] || 'U')}&background=random`}')`,
                }}
                onClick={() => navigate('/app/profile')}
              />
              <button
                onClick={() => navigate('/app')}
                className="rounded-full bg-gray-900 px-5 py-2 text-sm font-medium text-white hover:bg-black transition-all shadow-sm"
              >
                {t('Header.dashboard')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => navigate('/signin')}
                className="hidden sm:block text-sm font-medium text-gray-900 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                {t('Header.sign_in')}
              </button>
              <button
                onClick={() => navigate('/signup/step-1')}
                className="rounded-full bg-indigo-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/30"
              >
                {t('Header.get_started')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
