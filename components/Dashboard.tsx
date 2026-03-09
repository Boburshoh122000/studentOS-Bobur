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

/* ━━━━━━━━ Status Badges ━━━━━━━━ */
const STATUS_CONFIG: Record<string, { labelKey: string; dot: string; bg: string; text: string }> = {
  NEW: {
    labelKey: 'Dashboard.status_applied',
    dot: 'bg-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    text: 'text-blue-700 dark:text-blue-300',
  },
  SCREENING: {
    labelKey: 'Dashboard.status_screening',
    dot: 'bg-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
  },
  INTERVIEW: {
    labelKey: 'Dashboard.status_interview',
    dot: 'bg-violet-500',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    text: 'text-violet-700 dark:text-violet-300',
  },
  OFFER: {
    labelKey: 'Dashboard.status_offer',
    dot: 'bg-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  REJECTED: {
    labelKey: 'Dashboard.status_rejected',
    dot: 'bg-red-500',
    bg: 'bg-red-50 dark:bg-red-500/10',
    text: 'text-red-700 dark:text-red-300',
  },
  WITHDRAWN: {
    labelKey: 'Dashboard.status_withdrawn',
    dot: 'bg-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-500/10',
    text: 'text-gray-600 dark:text-gray-400',
  },
};

/* ━━━━━━━━ Main Component ━━━━━━━━ */
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

  const now = new Date();
  const greeting =
    now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';

  /* ── ATS ring math ── */
  const R = 42;
  const C = 2 * Math.PI * R;
  const atsStroke = C - (stats.atsScore / 100) * C;

  /* ━━━━━━━━ Header ━━━━━━━━ */
  const headerContent = (
    <header className="h-auto min-h-[5rem] px-4 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {greeting}, {firstName}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{t('Dashboard.daily_briefing')}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="pl-10 pr-4 py-2 w-56 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white"
            placeholder={t('Dashboard.search_placeholder')}
            type="text"
          />
        </div>
        <button
          onClick={() => navigateTo(Screen.SETTINGS)}
          aria-label="Credits balance"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/40 rounded-full cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors"
        >
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{balance}</span>
        </button>
        <LanguageSwitcher compact />
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  /* ━━━━━━━━ Loading ━━━━━━━━ */
  if (isLoading) {
    return (
      <DashboardLayout
        currentScreen={Screen.DASHBOARD}
        navigateTo={navigateTo}
        headerContent={headerContent}
      >
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
            <span className="text-sm text-gray-400">{t('Dashboard.loading')}</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ━━━━━━━━ Render ━━━━━━━━ */
  return (
    <DashboardLayout
      currentScreen={Screen.DASHBOARD}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="p-5 md:p-8">
        <div className="max-w-[1200px] mx-auto space-y-5">
          {/* ═══════════════════════════════════════
              BENTO ROW 1 — 3 cards
          ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* ── Card 1: Applications (tall) ── */}
            <div
              onClick={() => navigateTo(Screen.CAREER_TRACKER)}
              className="bg-white dark:bg-[#161922] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-6 cursor-pointer hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                  {t('Dashboard.active_applications')}
                </span>
                <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-extrabold text-gray-900 dark:text-white leading-none tabular-nums">
                  {stats.activeApplications}
                </span>
                <span className="text-sm text-gray-400 dark:text-gray-500 mb-1.5">
                  {t('Dashboard.pipeline_status')}
                </span>
              </div>
              {/* Mini status pills */}
              <div className="flex flex-wrap gap-2 mt-5">
                {recentApps.slice(0, 3).map((app: any) => {
                  const badge = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                  return (
                    <span
                      key={app.id}
                      className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {t(badge.labelKey)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* ── Card 2: ATS Score (ring) ── */}
            <div
              onClick={() => navigateTo(Screen.ATS_CHECKER)}
              className="bg-white dark:bg-[#161922] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-6 cursor-pointer hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                  {t('Dashboard.cv_ats_score')}
                </span>
                <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="flex-1 flex items-center justify-center">
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      strokeWidth="7"
                      className="stroke-gray-100 dark:stroke-gray-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r={R}
                      fill="none"
                      strokeWidth="7"
                      strokeDasharray={C}
                      strokeDashoffset={atsStroke}
                      strokeLinecap="round"
                      className="stroke-emerald-500 transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {stats.atsScore}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium -mt-0.5">
                      / 100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 3: Profile + Habits stack ── */}
            <div className="flex flex-col gap-5">
              {/* Profile Strength */}
              <div
                onClick={() => navigateTo(Screen.PROFILE)}
                className="flex-1 bg-white dark:bg-[#161922] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-5 cursor-pointer hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                    {t('Dashboard.profile_strength')}
                  </span>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {stats.profileCompletion}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{ width: `${stats.profileCompletion}%` }}
                  />
                </div>
              </div>

              {/* Habits Today */}
              <div
                onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                className="flex-1 bg-white dark:bg-[#161922] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-5 cursor-pointer hover:shadow-lg hover:shadow-black/[0.04] dark:hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">
                    {t('Dashboard.completed_habits')}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full">
                    {t('Dashboard.today')}
                  </span>
                </div>
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {stats.habitsCompletedToday}
                </span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              BENTO ROW 2 — Recent Apps + Quick Actions
          ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* ── Recent Applications (3/5 width) ── */}
            <div className="lg:col-span-3 bg-white dark:bg-[#161922] rounded-2xl border border-gray-200 dark:border-gray-800/80 overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Dashboard.recent_applications')}
                </h3>
                <button
                  onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                  className="text-xs font-medium text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {t('Dashboard.view_all')} <ArrowRightIcon className="w-3 h-3" />
                </button>
              </div>

              <div>
                {recentApps.length > 0 ? (
                  recentApps.map((app: any, idx: number) => {
                    const badge = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                    const isLast = idx === recentApps.length - 1;
                    return (
                      <div
                        key={app.id}
                        className={`flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${!isLast ? 'border-b border-gray-100 dark:border-gray-800/60' : ''}`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                            <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {app.job.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                              {app.job.company}
                              {app.job.location ? ` · ${app.job.location}` : ''}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg flex-shrink-0 ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {t(badge.labelKey)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-14 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
                      <BriefcaseIcon className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-400">{t('Dashboard.no_applications')}</p>
                    <button
                      onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                      className="mt-2 text-sm font-semibold text-primary hover:underline cursor-pointer"
                    >
                      {t('Dashboard.view_board')} →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Quick Actions (2/5 width) ── */}
            <div className="lg:col-span-2 bg-white dark:bg-[#161922] rounded-2xl border border-gray-200 dark:border-gray-800/80 p-5 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">
                {t('Dashboard.quick_actions')}
              </h3>
              <div className="flex flex-col gap-2 flex-1">
                {/* Find Scholarships */}
                <button
                  onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.find_scholarships')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t('Dashboard.browse_opportunities')}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </button>

                {/* Improve CV */}
                <button
                  onClick={() => navigateTo(Screen.ATS_CHECKER)}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-5 h-5 text-blue-500"
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
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.improve_cv')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t('Dashboard.boost_ats_score')}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </button>

                {/* Career Tracker */}
                <button
                  onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <BriefcaseIcon className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.view_board')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {t('Dashboard.pipeline_status')}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </button>

                {/* Telegram */}
                {dashboardData?.telegramConnected ? (
                  <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        {t('Dashboard.telegram_connected')}
                      </p>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400">
                        {t('Dashboard.receiving_notifications')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <a
                    href={`https://t.me/Student_OS_bot?start=${dashboardData?.userId || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3.5 p-3.5 rounded-xl hover:bg-[#229ED9]/5 transition-colors text-left cursor-pointer group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#229ED9]/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-[#229ED9]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#229ED9]">
                        {t('Dashboard.connect_telegram')}
                      </p>
                      <p className="text-xs text-[#229ED9]/60">{t('Dashboard.telegram_alerts')}</p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-[#229ED9]/30 group-hover:text-[#229ED9]/60 transition-colors flex-shrink-0" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              ROW 3 — Profile completion banner
          ═══════════════════════════════════════ */}
          {stats.profileCompletion < 100 && (
            <div className="bg-gray-900 dark:bg-[#0d0f17] text-white rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold">{t('Dashboard.complete_profile_banner')}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {t('Dashboard.profile_x_complete', { percent: stats.profileCompletion })}
                </p>
              </div>
              <button
                onClick={() => navigateTo(Screen.PROFILE)}
                className="px-5 py-2.5 bg-white text-gray-900 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('Dashboard.update_profile')}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
