import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  AcademicCapIcon,
  BellIcon,
  BriefcaseIcon,
  ChartPieIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UsersIcon,
} from '@heroicons/react/24/solid';

const STORAGE_KEY = 'adminSidebarLocked';

interface AdminSidebarProps {
  currentScreen: Screen;
  navigateTo: (screen: Screen) => void;
}

const NAV_ITEMS = [
  { screen: Screen.ADMIN_DASHBOARD, labelKey: 'Admin.dashboard', Icon: Squares2X2Icon },
  { screen: Screen.ADMIN_EMPLOYERS, labelKey: 'Admin.employers', Icon: BriefcaseIcon },
  { screen: Screen.ADMIN_TOOLS, labelKey: 'Admin.tools', Icon: CreditCardIcon },
  { screen: Screen.ADMIN_USERS, labelKey: 'Admin.users', Icon: UsersIcon },
  { screen: Screen.ADMIN_SCHOLARSHIPS, labelKey: 'Admin.scholarships', Icon: AcademicCapIcon },
  { screen: Screen.ADMIN_BLOG, labelKey: 'Admin.blog_management', Icon: DocumentTextIcon },
  { screen: Screen.ADMIN_ROLES, labelKey: 'Admin.roles_permissions', Icon: ShieldCheckIcon },
  { screen: Screen.ADMIN_NOTIFICATIONS, labelKey: 'Admin.notifications', Icon: BellIcon },
  { screen: Screen.ADMIN_TEAM, labelKey: 'Admin.team_management', Icon: UsersIcon },
  { screen: Screen.ADMIN_DEMOGRAPHICS, labelKey: 'Admin.demographics', Icon: ChartPieIcon },
];

export default function AdminSidebar({ currentScreen, navigateTo }: AdminSidebarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [isSidebarLocked, setIsSidebarLocked] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  });
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSidebarExpanded = isSidebarLocked || isSidebarHovered;

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isSidebarLocked));
    } catch {
      // ignore
    }
  }, [isSidebarLocked]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsSidebarHovered(true), 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setIsSidebarHovered(false), 320);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/');
    } catch {
      toast.error('Logout failed. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`${isSidebarExpanded ? 'w-72' : 'w-20'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-all duration-300 ease-in-out z-20 flex-shrink-0 relative`}
    >
      {/* Collapse toggle pin */}
      <button
        type="button"
        onClick={() => setIsSidebarLocked(!isSidebarLocked)}
        className={`absolute -right-3 top-9 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6 ${isSidebarLocked ? 'text-primary border-primary' : ''}`}
        aria-label={isSidebarLocked ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        <span className="material-symbols-outlined text-[14px]">
          {isSidebarLocked ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>

      <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
        {/* Top: logo + nav */}
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div
            className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded ? 'justify-center px-0' : ''}`}
            onClick={() => navigateTo(Screen.LANDING)}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
              <AcademicCapIcon className="w-6 h-6" />
            </div>
            <div
              className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
            >
              <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white whitespace-nowrap">
                StudentOS
              </h1>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {t('Admin.console')}
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ screen, labelKey, Icon }) => {
              const isActive = currentScreen === screen;
              const label = t(labelKey);
              return (
                <button
                  key={screen}
                  type="button"
                  onClick={() => navigateTo(screen)}
                  title={!isSidebarExpanded ? label : ''}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors w-full ${
                    !isSidebarExpanded ? 'justify-center' : 'text-left'
                  } ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isSidebarExpanded && (
                    <span
                      className={`text-sm whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}
                    >
                      {label}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom: profile + logout */}
        <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
          <button
            type="button"
            onClick={() => navigateTo(Screen.ADMIN_SETTINGS)}
            className={`flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors ${!isSidebarExpanded ? 'justify-center px-0' : ''}`}
          >
            <div className="h-10 w-10 shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold">
              AD
            </div>
            <div
              className={`flex flex-col transition-opacity duration-200 text-left ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                Admin
              </p>
              <p className="text-xs text-primary dark:text-primary-light whitespace-nowrap">
                {t('Admin.profile_settings')}
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors justify-center ${isLoggingOut ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={
              !isSidebarExpanded
                ? isLoggingOut
                  ? t('Sidebar.logging_out')
                  : t('Sidebar.log_out')
                : ''
            }
          >
            <span className="material-symbols-outlined text-lg">
              {isLoggingOut ? 'hourglass_empty' : 'logout'}
            </span>
            {isSidebarExpanded && (
              <span>{isLoggingOut ? t('Sidebar.logging_out') : t('Sidebar.log_out')}</span>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
