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

/* ━━━━━━━━ Shared card style ━━━━━━━━ */
const CARD =
  'bg-white dark:bg-[#13151f] rounded-[20px] border border-gray-100 dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.3),0_4px_12px_rgba(0,0,0,0.2)]';
const CARD_HOVER =
  'hover:shadow-[0_4px_20px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:-translate-y-[2px] active:translate-y-0 transition-all duration-300 ease-out cursor-pointer';
const LABEL = 'text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500';

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
    now.getHours() < 12
      ? 'Good morning'
      : now.getHours() < 18
        ? 'Good afternoon'
        : 'Good evening';

  /* ── ATS ring math ── */
  const R = 42;
  const C = 2 * Math.PI * R;
  const atsStroke = C - (stats.atsScore / 100) * C;

  /* ━━━━━━━━ Header ━━━━━━━━ */
  const headerContent = (
    <header className="h-auto min-h-[5rem] px-5 md:px-8 py-3 md:py-0 flex flex-col md:flex-row md:items-center justify-between flex-shrink-0 bg-white dark:bg-[#0c0e16] border-b border-gray-100 dark:border-white/[0.06] z-10 gap-3">
      <div className="flex flex-col justify-center">
        <h2 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-[-0.02em]">
          {greeting}, {firstName} ✨
        </h2>
        <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-0.5">
          {t('Dashboard.daily_briefing')}
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        {/* Search */}
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            className="pl-10 pr-4 py-2 w-52 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all dark:text-white placeholder:text-gray-400"
            placeholder={t('Dashboard.search_placeholder')}
            type="text"
          />
        </div>
        {/* Credits Badge */}
        <button
          onClick={() => navigateTo(Screen.SETTINGS)}
          aria-label="Credits balance"
          className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/15 rounded-xl cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/15 transition-all duration-200"
        >
          <span className="text-sm">💎</span>
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">
            {balance}
          </span>
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
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-10 h-10">
              <div className="absolute inset-0 rounded-full border-2 border-gray-100 dark:border-gray-800" />
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin" />
            </div>
            <span className="text-sm text-gray-400 font-medium">{t('Dashboard.loading')}</span>
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
      <div className="p-5 md:p-8 lg:p-10 bg-gray-50/50 dark:bg-[#0c0e16] min-h-full">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* ═══════════════════════════════════════
              BENTO ROW 1 — 3 cards
          ═══════════════════════════════════════ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* ── Card 1: Active Applications ── */}
            <div
              onClick={() => navigateTo(Screen.CAREER_TRACKER)}
              className={`${CARD} ${CARD_HOVER} p-7`}
            >
              <div className="flex items-center justify-between mb-6">
                <span className={LABEL}>{t('Dashboard.active_applications')}</span>
                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-blue-500" />
                </div>
              </div>
              <div className="flex items-end gap-3 mb-6">
                <span className="text-[52px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums tracking-[-0.04em]">
                  {stats.activeApplications}
                </span>
                <span className="text-[13px] text-gray-400 dark:text-gray-500 mb-2 font-medium">
                  {t('Dashboard.pipeline_status')}
                </span>
              </div>
              {/* Status pills */}
              <div className="flex flex-wrap gap-2">
                {recentApps.slice(0, 3).map((app: any) => {
                  const badge = STATUS_CONFIG[app.status] || STATUS_CONFIG.NEW;
                  return (
                    <span
                      key={app.id}
                      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`} />
                      {t(badge.labelKey)}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* ── Card 2: ATS Score Ring ── */}
            <div
              onClick={() => navigateTo(Screen.ATS_CHECKER)}
              className={`${CARD} ${CARD_HOVER} p-7 flex flex-col`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className={LABEL}>{t('Dashboard.cv_ats_score')}</span>
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                  <ArrowRightIcon className="w-3.5 h-3.5 text-emerald-500" />
                </div>
              </div>
              <div className="flex-1 flex items-center justify-center py-2">
                <div className="relative w-[120px] h-[120px]">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Track */}
                    <circle
                      cx="50" cy="50" r={R}
                      fill="none" strokeWidth="8"
                      className="stroke-gray-100 dark:stroke-white/[0.06]"
                    />
                    {/* Progress — subtle gradient via filter */}
                    <circle
                      cx="50" cy="50" r={R}
                      fill="none" strokeWidth="8"
                      strokeDasharray={C}
                      strokeDashoffset={atsStroke}
                      strokeLinecap="round"
                      className="stroke-emerald-500 transition-all duration-1000 ease-out"
                      style={{ filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.3))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[28px] font-extrabold text-gray-900 dark:text-white tracking-[-0.02em]">
                      {stats.atsScore}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 font-semibold tracking-wider uppercase">
                      score
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
                className={`${CARD} ${CARD_HOVER} p-6 flex-1`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={LABEL}>{t('Dashboard.profile_strength')}</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                    {stats.profileCompletion}
                    <span className="text-sm text-gray-400 dark:text-gray-500 font-semibold">%</span>
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${stats.profileCompletion}%`,
                      background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                      boxShadow: '0 0 8px rgba(99,102,241,0.4)',
                    }}
                  />
                </div>
              </div>

              {/* Habits Today */}
              <div
                onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                className={`${CARD} ${CARD_HOVER} p-6 flex-1`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={LABEL}>{t('Dashboard.completed_habits')}</span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {t('Dashboard.today')}
                  </span>
                </div>
                <span className="text-[40px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums tracking-[-0.04em]">
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
            <div className={`lg:col-span-3 ${CARD} overflow-hidden`}>
              <div className="flex items-center justify-between px-7 py-5">
                <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-[-0.01em]">
                  {t('Dashboard.recent_applications')}
                </h3>
                <button
                  onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                  className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1.5 cursor-pointer transition-colors"
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
                        className={`group flex items-center justify-between px-7 py-4 hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-all duration-200 cursor-pointer ${!isLast ? 'border-b border-gray-100 dark:border-white/[0.04]' : ''}`}
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 rounded-[14px] bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0 group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-colors duration-200">
                            <BriefcaseIcon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors duration-200" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors duration-200">
                              {app.job.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                              {app.job.company}
                              {app.job.location ? ` · ${app.job.location}` : ''}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {t(badge.labelKey)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-7 py-16 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-white/[0.06] flex items-center justify-center mx-auto mb-4">
                      <BriefcaseIcon className="w-6 h-6 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
                      {t('Dashboard.no_applications')}
                    </p>
                    <button
                      onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                    >
                      {t('Dashboard.view_board')} <ArrowRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Quick Actions (2/5 width) ── */}
            <div className={`lg:col-span-2 ${CARD} p-6 flex flex-col`}>
              <h3 className="text-[15px] font-bold text-gray-900 dark:text-white tracking-[-0.01em] mb-5">
                {t('Dashboard.quick_actions')}
              </h3>
              <div className="flex flex-col gap-1 flex-1">
                {/* Find Scholarships */}
                <button
                  onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-200 text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-[14px] bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.find_scholarships')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {t('Dashboard.browse_opportunities')}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                </button>

                {/* Improve CV */}
                <button
                  onClick={() => navigateTo(Screen.ATS_CHECKER)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-200 text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-[14px] bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {t('Dashboard.boost_ats_score')}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                </button>

                {/* Career Tracker */}
                <button
                  onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-all duration-200 text-left cursor-pointer group"
                >
                  <div className="w-11 h-11 rounded-[14px] bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                    <BriefcaseIcon className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t('Dashboard.view_board')}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {t('Dashboard.pipeline_status')}
                    </p>
                  </div>
                  <ArrowRightIcon className="w-4 h-4 text-gray-200 dark:text-gray-700 group-hover:text-gray-400 dark:group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                </button>

                {/* Telegram */}
                {dashboardData?.telegramConnected ? (
                  <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-500/5 border border-emerald-100/80 dark:border-emerald-500/10">
                    <div className="w-11 h-11 rounded-[14px] bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        {t('Dashboard.telegram_connected')}
                      </p>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                        {t('Dashboard.receiving_notifications')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <a
                    href={`https://t.me/Student_OS_bot?start=${dashboardData?.userId || ''}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-[#229ED9]/[0.04] transition-all duration-200 text-left cursor-pointer group"
                  >
                    <div className="w-11 h-11 rounded-[14px] bg-[#229ED9]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <svg className="w-5 h-5 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#229ED9]">
                        {t('Dashboard.connect_telegram')}
                      </p>
                      <p className="text-xs text-[#229ED9]/50 mt-0.5">
                        {t('Dashboard.telegram_alerts')}
                      </p>
                    </div>
                    <ArrowRightIcon className="w-4 h-4 text-[#229ED9]/20 group-hover:text-[#229ED9]/50 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════
              ROW 3 — Profile completion banner
          ═══════════════════════════════════════ */}
          {stats.profileCompletion < 100 && (
            <div className="bg-[#0f1117] dark:bg-[#0a0c14] text-white rounded-[20px] p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
              <div>
                <h3 className="text-[16px] font-bold tracking-[-0.01em]">
                  {t('Dashboard.complete_profile_banner')}
                </h3>
                <p className="text-sm text-gray-400 mt-1.5 leading-relaxed">
                  {t('Dashboard.profile_x_complete', { percent: stats.profileCompletion })}
                </p>
              </div>
              <button
                onClick={() => navigateTo(Screen.PROFILE)}
                className="px-6 py-3 bg-white text-gray-900 rounded-[14px] text-sm font-bold hover:bg-gray-50 hover:shadow-lg active:scale-[0.98] transition-all duration-200 whitespace-nowrap cursor-pointer"
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
