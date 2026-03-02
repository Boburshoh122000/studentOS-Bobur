import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen } from '../types';
import { STUDENT_NAV_ITEMS } from '../src/config/navigation';
import { useAuth } from '../src/contexts/AuthContext';

import {
  AcademicCapIcon,
  Cog8ToothIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

interface SidebarProps {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
  userData: {
    email: string;
    profile?: {
      fullName?: string;
      avatarUrl?: string;
    };
  } | null;
  /** Mobile drawer state */
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  currentScreen,
  navigateTo,
  userData,
  isMobileOpen = false,
  onCloseMobile,
}: SidebarProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const { t } = useTranslation();
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Map Screen enum to sidebar translation keys
  const sidebarLabelKeys: Partial<Record<Screen, string>> = {
    [Screen.DASHBOARD]: 'Sidebar.dashboard',
    [Screen.CAREER_TOOLS]: 'Sidebar.career_tools',
    [Screen.ACADEMIC_TOOLS]: 'Sidebar.academic_tools',
    [Screen.SCHOLARSHIPS]: 'Sidebar.scholarships',
    [Screen.HABIT_TRACKER]: 'Sidebar.habit_tracker',
    [Screen.SETTINGS]: 'Sidebar.settings',
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 320);
  };

  const isSidebarExpanded = isSidebarLocked || isSidebarHovered;

  // User data
  const fullName = userData?.profile?.fullName || userData?.email?.split('@')[0] || 'User';
  const email = userData?.email || '';
  const avatarUrl =
    userData?.profile?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  // Use shared navigation config (single source of truth)
  const navItems = STUDENT_NAV_ITEMS;

  const handleNavClick = (screen: Screen) => {
    navigateTo(screen);
    onCloseMobile?.();
  };

  /** Shared sidebar content – rendered both in desktop aside and mobile drawer */
  const sidebarContent = (expanded: boolean) => (
    <>
      <div
        className={`flex flex-col ${expanded ? 'items-start px-4' : 'items-center'} gap-8 w-full transition-all duration-300`}
      >
        {/* Logo */}
        <div
          className={`flex items-center gap-3 w-full ${expanded ? 'justify-start' : 'justify-center'}`}
          onClick={() => handleNavClick(Screen.LANDING)}
        >
          <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer group hover:scale-105 transition-transform flex-shrink-0">
            <AcademicCapIcon className="w-6 h-6 text-white" />
          </div>
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
          >
            <h1 className="text-lg font-bold leading-none tracking-tight whitespace-nowrap">
              StudentOS
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={`flex flex-col ${expanded ? 'items-stretch' : 'items-center'} space-y-1 w-full`}
        >
          {navItems.map((item, idx) => {
            const isActive = currentScreen === item.screen;
            return (
              <React.Fragment key={idx}>
                <button
                  onClick={() => handleNavClick(item.screen)}
                  className={`flex items-center ${expanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${isActive ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white'}`}
                  title={!expanded ? item.label : ''}
                >
                  <item.icon
                    className={`${!expanded ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${isActive ? '' : 'group-hover:text-primary'}`}
                  />
                  {expanded && (
                    <span className="text-sm font-medium whitespace-nowrap">
                      {(() => {
                        const key = sidebarLabelKeys[item.screen];
                        const translated = key ? t(key) : '';
                        return translated && translated !== key ? translated : item.label;
                      })()}
                    </span>
                  )}
                  {!expanded && (
                    <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {(() => {
                        const key = sidebarLabelKeys[item.screen];
                        const translated = key ? t(key) : '';
                        return translated && translated !== key ? translated : item.label;
                      })()}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout */}
      <div
        className={`flex flex-col ${expanded ? 'items-stretch px-4' : 'items-center px-2'} space-y-2 w-full mt-auto`}
      >
        {/* 1. User Profile */}
        <div
          onClick={() => handleNavClick(Screen.PROFILE)}
          className={`flex items-center ${expanded ? 'gap-3 px-3 py-2 w-full' : 'justify-center size-10'} rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
        >
          <div
            className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0"
            style={{ backgroundImage: `url('${avatarUrl}')` }}
          />
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}
          >
            <span className="text-sm font-bold text-text-main dark:text-white truncate">
              My Portfolio
            </span>
          </div>
        </div>

        {/* 2. Settings */}
        <button
          onClick={() => handleNavClick(Screen.SETTINGS)}
          className={`flex items-center ${expanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${currentScreen === Screen.SETTINGS ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white'}`}
          title={!expanded ? t('Sidebar.settings') : ''}
        >
          <Cog8ToothIcon
            className={`${!expanded ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0 ${currentScreen === Screen.SETTINGS ? '' : 'group-hover:text-primary'}`}
          />
          {expanded && (
            <span className="text-sm font-medium whitespace-nowrap">{t('Sidebar.settings')}</span>
          )}
          {!expanded && (
            <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {t('Sidebar.settings')}
            </span>
          )}
        </button>

        {/* 4. Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`flex items-center ${expanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative text-text-sub hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400`}
          title={!expanded ? t('Sidebar.log_out') : ''}
        >
          {isLoggingOut ? (
            <ArrowPathIcon
              className={`${!expanded ? 'w-6 h-6' : 'w-5 h-5'} animate-spin flex-shrink-0`}
            />
          ) : (
            <ArrowRightOnRectangleIcon
              className={`${!expanded ? 'w-6 h-6' : 'w-5 h-5'} flex-shrink-0`}
            />
          )}
          {expanded && (
            <span className="text-sm font-medium whitespace-nowrap">
              {isLoggingOut ? t('Sidebar.logging_out') : t('Sidebar.log_out')}
            </span>
          )}
          {!expanded && (
            <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {t('Sidebar.log_out')}
            </span>
          )}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 z-20 flex-shrink-0 relative`}
      >
        {/* Lock/Unlock Toggle */}
        <button
          onClick={() => setIsSidebarLocked(!isSidebarLocked)}
          aria-label={isSidebarLocked ? 'Unlock Sidebar' : 'Lock Sidebar Open'}
          className={`absolute -right-3 top-10 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6 ${isSidebarLocked ? 'text-primary border-primary' : ''}`}
          title={isSidebarLocked ? 'Unlock Sidebar' : 'Lock Sidebar Open'}
        >
          {isSidebarLocked ? (
            <ChevronLeftIcon className="w-3.5 h-3.5" />
          ) : (
            <ChevronRightIcon className="w-3.5 h-3.5" />
          )}
        </button>

        {sidebarContent(isSidebarExpanded)}
      </aside>

      {/* ── Mobile Drawer ── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCloseMobile} />
          {/* Drawer panel */}
          <aside className="absolute inset-y-0 left-0 w-72 bg-card-light dark:bg-card-dark flex flex-col justify-between py-6 shadow-2xl animate-slide-in-left">
            {/* Close button */}
            <button
              onClick={onCloseMobile}
              aria-label="Close menu"
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-text-sub" />
            </button>
            {sidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
