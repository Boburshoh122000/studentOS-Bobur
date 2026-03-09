import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { userApi } from '../src/services/api';
import { useCredits } from '../src/contexts/CreditContext';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import LanguageSwitcher from './LanguageSwitcher';
import DashboardLayout from './DashboardLayout';
import {
  ArrowRightIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';

const STATUS_CONFIG: Record<string, { labelKey: string; bg: string; text: string }> = {
  NEW: {
    labelKey: 'Dashboard.status_applied',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  SCREENING: {
    labelKey: 'Dashboard.status_screening',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  INTERVIEW: {
    labelKey: 'Dashboard.status_interview',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  OFFER: {
    labelKey: 'Dashboard.status_offer',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  REJECTED: {
    labelKey: 'Dashboard.status_rejected',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
  },
  WITHDRAWN: {
    labelKey: 'Dashboard.status_withdrawn',
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-500 dark:text-gray-400',
  },
};

export default function Dashboard({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [firstName, setFirstName] = useState('Student');
  const { balance } = useCredits();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const dashboardRes = await userApi.getDashboard();
      if (dashboardRes.data) {
        setDashboardData(dashboardRes.data);
        const data = dashboardRes.data as any;
        const name = data.user?.profile?.fullName || data.user?.email?.split('@')[0] || 'Student';
        setFirstName(name.split(' ')[0]);
      }
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = dashboardData?.stats || {
    activeApplications: 0,
    atsScore: 0,
    habitsCompletedToday: 0,
    profileCompletion: 0,
  };
  const recentApps = dashboardData?.recentApplications || [];

  // ── Get current date info ──
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const headerContent = (
    <header className="h-auto min-h-[5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">
          {t('Dashboard.welcome_back', { name: firstName })}
        </h2>
        <p className="text-sm text-text-sub">{dateStr}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="pl-10 pr-4 py-2 w-64 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white dark:focus:bg-gray-700 transition-all dark:text-white"
            placeholder={t('Dashboard.search_placeholder')}
            type="text"
          />
        </div>
        <button
          onClick={() => navigateTo(Screen.SETTINGS)}
          aria-label="Credits balance — go to settings"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-gray-900 dark:text-white">{balance}</span>
        </button>
        <LanguageSwitcher compact />
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <DashboardLayout
        currentScreen={Screen.DASHBOARD}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex h-full items-center justify-center text-gray-400">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin" />
            <span className="text-sm">{t('Dashboard.loading')}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Compute ATS ring ──
  const atsRadius = 44;
  const atsCircumference = 2 * Math.PI * atsRadius;
  const atsOffset = atsCircumference - (stats.atsScore / 100) * atsCircumference;

  // ── Compute profile ring ──
  const profileOffset = atsCircumference - (stats.profileCompletion / 100) * atsCircumference;

  return (
    <DashboardLayout
      currentScreen={Screen.DASHBOARD}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="p-6 md:p-8 lg:p-10">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* ═══════════════════════════════════════════
              ROW 1 — Four Metric Cards
          ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Applications */}
            <button
              onClick={() => navigateTo(Screen.CAREER_TRACKER)}
              className="text-left bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t('Dashboard.active_applications')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                  <BriefcaseIcon className="w-4 h-4 text-blue-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {stats.activeApplications}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('Dashboard.pipeline_status')}
              </p>
            </button>

            {/* ATS Score */}
            <button
              onClick={() => navigateTo(Screen.ATS_CHECKER)}
              className="text-left bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t('Dashboard.cv_ats_score')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {stats.atsScore}
                <span className="text-lg text-gray-400 dark:text-gray-500">%</span>
              </p>
              <div className="mt-2 w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${stats.atsScore}%` }}
                />
              </div>
            </button>

            {/* Habits Today */}
            <button
              onClick={() => navigateTo(Screen.HABIT_TRACKER)}
              className="text-left bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t('Dashboard.completed_habits')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-violet-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {stats.habitsCompletedToday}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('Dashboard.today')}
              </p>
            </button>

            {/* Profile */}
            <button
              onClick={() => navigateTo(Screen.PROFILE)}
              className="text-left bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {t('Dashboard.profile_strength')}
                </span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                {stats.profileCompletion}
                <span className="text-lg text-gray-400 dark:text-gray-500">%</span>
              </p>
              <div className="mt-2 w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-700"
                  style={{ width: `${stats.profileCompletion}%` }}
                />
              </div>
            </button>
          </div>

          {/* ═══════════════════════════════════════════
              ROW 2 — Two-column: Visual Rings + Quick Actions
          ═══════════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* ATS + Profile Rings */}
            <div className="lg:col-span-2 bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-6">
                {t('Dashboard.career_progress')}
              </h3>
              <div className="flex items-center justify-center gap-8">
                {/* ATS Ring */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={atsRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-gray-100 dark:text-gray-800"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={atsRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray={atsCircumference}
                        strokeDashoffset={atsOffset}
                        strokeLinecap="round"
                        className="text-emerald-500 transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.atsScore}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    ATS Score
                  </span>
                </div>

                {/* Profile Ring */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r={atsRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        className="text-gray-100 dark:text-gray-800"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r={atsRadius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="6"
                        strokeDasharray={atsCircumference}
                        strokeDashoffset={profileOffset}
                        strokeLinecap="round"
                        className="text-amber-500 transition-all duration-700"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {stats.profileCompletion}%
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {t('Dashboard.profile_strength')}
                  </span>
                </div>
              </div>

              {/* Update Profile CTA */}
              <button
                onClick={() => navigateTo(Screen.PROFILE)}
                className="mt-6 w-full py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t('Dashboard.update_profile')}
              </button>
            </div>

            {/* Quick Actions — clean list */}
            <div className="lg:col-span-3 bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl p-6">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-5">
                {t('Dashboard.quick_actions')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    label: t('Dashboard.find_scholarships'),
                    sub: t('Dashboard.browse_opportunities'),
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2zm7 18h-2v-6H7v6H5v-7.81l7-6.36 7 6.36V20z" />
                        <path d="M12 2L1 12h3v9h6v-6h4v6h6v-9h3L12 2z" />
                      </svg>
                    ),
                    color: 'text-amber-500',
                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                    action: () => navigateTo(Screen.SCHOLARSHIPS),
                  },
                  {
                    label: t('Dashboard.improve_cv'),
                    sub: t('Dashboard.boost_ats_score'),
                    icon: (
                      <svg
                        className="w-5 h-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                    ),
                    color: 'text-blue-500',
                    bg: 'bg-blue-50 dark:bg-blue-900/20',
                    action: () => navigateTo(Screen.ATS_CHECKER),
                  },
                  {
                    label: t('Dashboard.view_board'),
                    sub: t('Dashboard.pipeline_status'),
                    icon: <BriefcaseIcon className="w-5 h-5" />,
                    color: 'text-violet-500',
                    bg: 'bg-violet-50 dark:bg-violet-900/20',
                    action: () => navigateTo(Screen.CAREER_TRACKER),
                  },
                  ...(dashboardData?.telegramConnected
                    ? [
                        {
                          label: t('Dashboard.telegram_connected'),
                          sub: t('Dashboard.receiving_notifications'),
                          icon: <CheckCircleIcon className="w-5 h-5" />,
                          color: 'text-emerald-500',
                          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                          action: () => {},
                          isConnected: true,
                        },
                      ]
                    : [
                        {
                          label: t('Dashboard.connect_telegram'),
                          sub: t('Dashboard.telegram_alerts'),
                          icon: (
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                            </svg>
                          ),
                          color: 'text-[#229ED9]',
                          bg: 'bg-[#229ED9]/10',
                          action: () =>
                            window.open(
                              `https://t.me/Student_OS_bot?start=${dashboardData?.userId || ''}`,
                              '_blank'
                            ),
                        },
                      ]),
                ].map((item, i) => (
                  <button
                    key={i}
                    onClick={item.action}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all text-left group"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center flex-shrink-0`}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                        {item.sub}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto flex-shrink-0 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              ROW 3 — Recent Applications
          ═══════════════════════════════════════════ */}
          <div className="bg-white dark:bg-[#1a1d2e] border border-gray-150 dark:border-gray-800 rounded-2xl">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                {t('Dashboard.recent_applications')}
              </h3>
              <button
                onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1"
              >
                {t('Dashboard.view_all')} <ArrowRightIcon className="w-3 h-3" />
              </button>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {recentApps.length > 0 ? (
                recentApps.map((app: any) => {
                  const badge = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                  return (
                    <div
                      key={app.id}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <BriefcaseIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                            {app.job.title}
                          </h4>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {app.job.company}
                            {app.job.location ? ` · ${app.job.location}` : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text} flex-shrink-0`}
                      >
                        {t(badge.labelKey)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="px-6 py-12 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                    <BriefcaseIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                  </div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {t('Dashboard.no_applications')}
                  </p>
                  <button
                    onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                    className="mt-3 text-sm font-medium text-primary hover:underline"
                  >
                    {t('Dashboard.view_board')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
