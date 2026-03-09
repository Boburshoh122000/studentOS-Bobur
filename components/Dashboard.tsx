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
  EyeIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  SparklesIcon,
  ChartBarIcon,
  AcademicCapIcon,
  DocumentCheckIcon,
  TableCellsIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/solid';

/* ──── Status config ──── */
const STATUS_CFG: Record<string, { labelKey: string; dot: string; bg: string; text: string }> = {
  NEW: {
    labelKey: 'Dashboard.status_applied',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-600 dark:text-blue-300',
  },
  SCREENING: {
    labelKey: 'Dashboard.status_screening',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-600 dark:text-amber-300',
  },
  INTERVIEW: {
    labelKey: 'Dashboard.status_interview',
    dot: 'bg-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-600 dark:text-violet-300',
  },
  OFFER: {
    labelKey: 'Dashboard.status_offer',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
  REJECTED: {
    labelKey: 'Dashboard.status_rejected',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-600 dark:text-red-300',
  },
  WITHDRAWN: {
    labelKey: 'Dashboard.status_withdrawn',
    dot: 'bg-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-500/10',
    text: 'text-gray-500 dark:text-gray-400',
  },
};

/* ──── Card styles ──── */
const CARD =
  'bg-white dark:bg-[#14161f] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200';
const CARD_HOVER = `${CARD} hover:border-gray-200 dark:hover:border-white/[0.1] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]`;
const CARD_CLICK = `${CARD_HOVER} cursor-pointer hover:-translate-y-px active:translate-y-0`;
const LABEL =
  'text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500';
const VIEW_LINK =
  'text-[11px] font-bold text-primary flex items-center gap-1 hover:opacity-70 transition-opacity';

/* ════════════════════════════════════════════ */
export default function Dashboard({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const { balance } = useCredits();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await userApi.getDashboard();
      if (res.data) {
        setDashboardData(res.data);
        const d = res.data as any;
        const name = d.profile?.fullName || '';
        setFirstName(name.split(' ')[0]);
      }
    } catch (e) {
      console.error('Dashboard load failed', e);
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
  const habits = dashboardData?.habits || [];

  /* ATS ring */
  const R = 36,
    C = 2 * Math.PI * R,
    atsOff = C - (stats.atsScore / 100) * C;

  /* Greeting */
  const hr = new Date().getHours();
  const greetKey =
    hr < 12
      ? 'Dashboard.greeting_morning'
      : hr < 18
        ? 'Dashboard.greeting_afternoon'
        : 'Dashboard.greeting_evening';

  /* ──── Header ──── */
  const headerContent = (
    <header className="h-16 px-5 md:px-6 flex items-center justify-between bg-white dark:bg-[#0c0e16] border-b border-gray-100 dark:border-white/[0.06] z-10">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {t(greetKey)}
          {firstName ? `, ${firstName}` : ''}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">{t('Dashboard.daily_briefing')}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input
            className="pl-8 pr-3 py-1.5 w-44 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white placeholder:text-gray-400"
            placeholder={t('Dashboard.search_placeholder')}
            type="text"
          />
        </div>
        <button
          type="button"
          onClick={() => navigateTo(Screen.SETTINGS)}
          aria-label="Credits"
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/15 rounded-lg cursor-pointer hover:bg-violet-100 dark:hover:bg-violet-500/15 transition-colors text-xs"
        >
          <SparklesIcon className="w-3.5 h-3.5 text-violet-500" />
          <span className="font-bold text-violet-600 dark:text-violet-300 tabular-nums">
            {balance}
          </span>
        </button>
        <LanguageSwitcher compact />
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  /* ──── Loading ──── */
  if (isLoading) {
    return (
      <DashboardLayout
        currentScreen={Screen.DASHBOARD}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex h-full items-center justify-center">
          <div className="w-7 h-7 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentScreen={Screen.DASHBOARD}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="p-4 sm:p-6 bg-[#f6f7fa] dark:bg-[#0a0c14] min-h-full">
        <div className="max-w-[1280px] mx-auto space-y-4 sm:space-y-5">
          {/* ════ Row 1: 4 stat cards ════ */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Active Applications */}
            <div
              onClick={() => navigateTo(Screen.CAREER_TRACKER)}
              className={`${CARD_CLICK} p-5 flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <span className={LABEL}>{t('Dashboard.active_applications')}</span>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <BriefcaseIcon className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <span className="text-[38px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums">
                {stats.activeApplications}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {recentApps.slice(0, 2).map((app: any) => {
                  const b = STATUS_CFG[app.status] || STATUS_CFG.NEW;
                  return (
                    <span
                      key={app.id}
                      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${b.bg} ${b.text}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${b.dot}`} />
                      {t(b.labelKey)}
                    </span>
                  );
                })}
                {recentApps.length === 0 && (
                  <span className={VIEW_LINK}>
                    {t('Dashboard.view_board')} <ArrowRightIcon className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>

            {/* ATS Score */}
            <div
              onClick={() => navigateTo(Screen.ATS_CHECKER)}
              className={`${CARD_CLICK} p-5 flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <span className={LABEL}>{t('Dashboard.cv_ats_score')}</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                  <ChartBarIcon className="w-5 h-5 text-emerald-500" />
                </div>
              </div>
              <div className="relative w-16 h-16">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={R}
                    fill="none"
                    strokeWidth="8"
                    className="stroke-gray-100 dark:stroke-white/[0.06]"
                  />
                  <defs>
                    <linearGradient id="ats-g" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                  </defs>
                  <circle
                    cx="50"
                    cy="50"
                    r={R}
                    fill="none"
                    strokeWidth="8"
                    stroke="url(#ats-g)"
                    strokeDasharray={C}
                    strokeDashoffset={atsOff}
                    strokeLinecap="round"
                    className="[filter:drop-shadow(0_0_4px_rgba(16,185,129,0.3))] [transition:stroke-dashoffset_1s_ease-out]"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[17px] font-extrabold text-gray-900 dark:text-white">
                    {stats.atsScore}
                  </span>
                </div>
              </div>
              <span className={VIEW_LINK}>
                {t('Dashboard.view_details')} <ArrowRightIcon className="w-2.5 h-2.5" />
              </span>
            </div>

            {/* Profile Strength */}
            <div
              onClick={() => navigateTo(Screen.PROFILE)}
              className={`${CARD_CLICK} p-5 flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <span className={LABEL}>{t('Dashboard.profile_strength')}</span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <UserCircleIcon className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <span className="text-[38px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums">
                {stats.profileCompletion}
                <span className="text-2xl font-bold text-gray-300 dark:text-gray-600">%</span>
              </span>
              <div className="space-y-1.5">
                <div className="w-full h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 [transition:width_0.8s_ease-out]"
                    style={{ width: `${stats.profileCompletion}%` }}
                  />
                </div>
                <span className={VIEW_LINK}>
                  {t('Dashboard.update_profile')} <ArrowRightIcon className="w-2.5 h-2.5" />
                </span>
              </div>
            </div>

            {/* Credits */}
            <div
              onClick={() => navigateTo(Screen.SETTINGS)}
              className={`${CARD_CLICK} p-5 flex flex-col gap-3`}
            >
              <div className="flex items-start justify-between">
                <span className={LABEL}>{t('Dashboard.credits')}</span>
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <SparklesIcon className="w-5 h-5 text-violet-500" />
                </div>
              </div>
              <span className="text-[38px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums">
                {balance}
              </span>
              <span className={VIEW_LINK}>
                {t('Dashboard.view_details')} <ArrowRightIcon className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>

          {/* ════ Row 2: Recent Applications + Profile Views ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Recent Applications */}
            <div className={`${CARD_HOVER} overflow-hidden flex flex-col`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Dashboard.recent_applications')}
                </h3>
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                  className={`${VIEW_LINK} cursor-pointer`}
                >
                  {t('Dashboard.view_all')} <ArrowRightIcon className="w-2.5 h-2.5" />
                </button>
              </div>
              {recentApps.length > 0 ? (
                recentApps.slice(0, 5).map((app: any, i: number) => {
                  const b = STATUS_CFG[app.status] || STATUS_CFG.NEW;
                  return (
                    <div
                      key={app.id}
                      onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                      className={`group flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${i < Math.min(recentApps.length, 5) - 1 ? 'border-b border-gray-50 dark:border-white/[0.03]' : ''}`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                          <BriefcaseIcon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                            {app.job.title}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {app.job.company}
                            {app.job.location ? ` · ${app.job.location}` : ''}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${b.bg} ${b.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                        {t(b.labelKey)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                  <BriefcaseIcon className="w-8 h-8 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">{t('Dashboard.no_applications')}</p>
                  <button
                    type="button"
                    onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                    className="mt-2 text-sm font-bold text-primary hover:underline cursor-pointer"
                  >
                    {t('Dashboard.view_board')} →
                  </button>
                </div>
              )}
            </div>

            {/* Profile Views — Coming Soon */}
            <div className={`${CARD_HOVER} flex flex-col`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t('Dashboard.profile_views')}
                  </h3>
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center py-14 text-center px-6">
                <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center mb-4">
                  <EyeIcon className="w-8 h-8 text-violet-200 dark:text-violet-500/40" />
                </div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t('Dashboard.coming_soon')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 max-w-[220px] leading-relaxed">
                  {t('Dashboard.profile_views_coming_soon')}
                </p>
              </div>
            </div>
          </div>

          {/* ════ Row 3: Quick Actions + Today's Habits ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
            {/* Quick Actions */}
            <div className={`${CARD_HOVER} flex flex-col overflow-hidden`}>
              <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Dashboard.quick_actions')}
                </h3>
              </div>
              <div className="flex flex-col gap-0.5 p-3 flex-1">
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <AcademicCapIcon className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.find_scholarships')}
                    </p>
                    <p className="text-xs text-gray-400">{t('Dashboard.browse_opportunities')}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(Screen.ATS_CHECKER)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <DocumentCheckIcon className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.improve_cv')}
                    </p>
                    <p className="text-xs text-gray-400">{t('Dashboard.boost_ats_score')}</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <TableCellsIcon className="w-5 h-5 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.view_board')}
                    </p>
                    <p className="text-xs text-gray-400">{t('Dashboard.pipeline_status')}</p>
                  </div>
                </button>

                {dashboardData?.telegramConnected ? (
                  <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                        {t('Dashboard.telegram_connected')}
                      </p>
                      <p className="text-xs text-emerald-500/70">
                        {t('Dashboard.receiving_notifications')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <a
                    href={`https://t.me/Student_OS_bot?start=${dashboardData?.userId || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-[#229ED9]/5 transition-colors text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <svg
                        className="w-5 h-5 text-[#229ED9]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#229ED9]">
                        {t('Dashboard.connect_telegram')}
                      </p>
                      <p className="text-xs text-[#229ED9]/50">{t('Dashboard.telegram_alerts')}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>

            {/* Today's Habits */}
            <div className={`${CARD_HOVER} flex flex-col overflow-hidden`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <CalendarDaysIcon className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    {t('Dashboard.today_habits')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                  className={`${VIEW_LINK} cursor-pointer`}
                >
                  {t('Dashboard.view_all')} <ArrowRightIcon className="w-2.5 h-2.5" />
                </button>
              </div>
              {habits.length > 0 ? (
                habits.slice(0, 6).map((habit: any, i: number) => (
                  <div
                    key={habit.id}
                    className={`flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors ${i < Math.min(habits.length, 6) - 1 ? 'border-b border-gray-50 dark:border-white/[0.03]' : ''}`}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-sm"
                      style={{ background: (habit.color || '#6366f1') + '20' }}
                    >
                      {habit.icon || '📌'}
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white flex-1 truncate">
                      {habit.title}
                    </p>
                    {habit.completedToday ? (
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-200 dark:text-gray-700 flex-shrink-0" />
                    )}
                  </div>
                ))
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-14 text-center px-6">
                  <CalendarDaysIcon className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-3" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    {t('Dashboard.no_habits_yet')}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                    className="mt-2 text-sm font-bold text-primary hover:underline cursor-pointer"
                  >
                    {t('Dashboard.start_habits')} →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ════ Row 4: Profile completion banner ════ */}
          {stats.profileCompletion < 100 && (
            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#667eea] to-[#764ba2]">
              <div className="px-6 py-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <UserCircleIcon className="w-6 h-6 text-white/80" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {t('Dashboard.complete_profile_banner')}
                    </p>
                    <p className="text-xs text-white/75 mt-0.5 truncate">
                      {t('Dashboard.profile_x_complete', { percent: stats.profileCompletion })}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.PROFILE)}
                  className="px-5 py-2.5 bg-white text-[#6366f1] rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
                >
                  {t('Dashboard.update_profile')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
