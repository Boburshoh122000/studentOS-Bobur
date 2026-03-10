import { useState, useEffect, useRef } from 'react';
import { Gem } from 'lucide-react';
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
  ClockIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/solid';

/* ──── Status badge config ──── */
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

/* ──── Shared class constants ──── */
const CARD =
  'bg-white dark:bg-[#14161f] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-[0_1px_4px_rgba(0,0,0,0.04)] dark:shadow-none transition-all duration-200';
const CARD_HOVER = `${CARD} hover:border-gray-200 dark:hover:border-white/[0.1] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)]`;
const CARD_CLICK = `${CARD_HOVER} cursor-pointer hover:-translate-y-0.5 active:translate-y-0`;
const LABEL =
  'text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-400 dark:text-gray-500';
const VIEW_LINK =
  'text-[11px] font-bold text-primary flex items-center gap-1 hover:opacity-70 transition-opacity';

/* ──── Company avatar color (hash by first char) ──── */
const AVATAR_COLORS = [
  'bg-blue-600',
  'bg-violet-600',
  'bg-emerald-600',
  'bg-amber-500',
  'bg-rose-600',
  'bg-cyan-600',
  'bg-orange-500',
  'bg-slate-600',
];
const avatarColor = (name: string) =>
  AVATAR_COLORS[Math.abs((name.toUpperCase().charCodeAt(0) || 65) - 65) % AVATAR_COLORS.length];

/* ──── Relative time ──── */
const timeAgo = (dateInput?: string | Date): string => {
  if (!dateInput) return '';
  const d = Math.floor((Date.now() - new Date(dateInput).getTime()) / 86400000);
  if (d === 0) return 'today';
  if (d === 1) return '1d ago';
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return `${Math.floor(d / 30)}mo ago`;
};

/* ──── Pipeline step index ──── */
const stepFromStatus = (status: string): number => {
  if (status === 'OFFER') return 2;
  if (status === 'INTERVIEW') return 1;
  return 0;
};

const PIPELINE_STEPS = [
  'Dashboard.status_applied',
  'Dashboard.status_interview',
  'Dashboard.status_offer',
] as const;

/* ═══════════════════════════════════════════════ */
export default function Dashboard({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const { balance } = useCredits();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    const onOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onOutside);
    };
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
  const latestApp = recentApps[0] || null;

  /* Greeting */
  const hr = new Date().getHours();
  const greetKey =
    hr < 12
      ? 'Dashboard.greeting_morning'
      : hr < 18
        ? 'Dashboard.greeting_afternoon'
        : 'Dashboard.greeting_evening';

  /* Profile ring geometry */
  const PR = 44;
  const PC = 2 * Math.PI * PR;
  const profOff = PC - (stats.profileCompletion / 100) * PC;
  const profLabel =
    stats.profileCompletion >= 90
      ? t('Dashboard.profile_almost_complete')
      : stats.profileCompletion >= 50
        ? t('Dashboard.profile_in_progress')
        : t('Dashboard.profile_in_progress');

  /* ATS gauge geometry  (semicircle path length = π × r = π × 80 ≈ 251.33) */
  const ATS_ARC = 251.33;
  const atsDash = (stats.atsScore / 100) * ATS_ARC;
  const atsRating =
    stats.atsScore >= 70
      ? {
          label: t('Dashboard.ats_good'),
          textClass: 'text-emerald-500',
          g0: '#10b981',
          g1: '#34d399',
          svgFill: '#10b981',
        }
      : stats.atsScore >= 40
        ? {
            label: t('Dashboard.ats_fair'),
            textClass: 'text-amber-500',
            g0: '#f59e0b',
            g1: '#fcd34d',
            svgFill: '#f59e0b',
          }
        : {
            label: t('Dashboard.ats_poor'),
            textClass: 'text-red-500',
            g0: '#ef4444',
            g1: '#f87171',
            svgFill: '#ef4444',
          };

  /* Latest app pipeline */
  const currentStep = latestApp ? stepFromStatus(latestApp.status) : 0;
  const isRejected = latestApp?.status === 'REJECTED';

  /* ──── Header ──── */
  const headerContent = (
    <header className="h-16 px-4 md:px-6 flex items-center gap-3 bg-white dark:bg-[#0c0e16] border-b border-gray-100 dark:border-white/[0.06]">
      {/* Greeting */}
      <div className="flex-shrink-0 min-w-0">
        <p className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug truncate">
          {t(greetKey)}, {firstName || 'there'}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
          {t('Dashboard.daily_briefing')}
        </p>
      </div>

      {/* Collapsible search */}
      <div className="flex-1 flex justify-center px-4" ref={searchRef}>
        {searchOpen ? (
          <div className="flex items-center gap-2 bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.1] rounded-xl px-3 py-2 w-full max-w-sm transition-all">
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              placeholder={`${t('Dashboard.search_placeholder')}...`}
              autoFocus
              className="flex-1 text-sm bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-sm leading-none px-0.5"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-sm text-gray-400 hover:border-gray-300 dark:hover:border-white/[0.15] transition-all"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="hidden sm:inline">{t('Dashboard.search_placeholder')}...</span>
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1.5 ml-auto md:ml-0 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigateTo(Screen.SETTINGS)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
        >
          <Gem className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 tabular-nums">
            {(balance || 0).toLocaleString()}
          </span>
        </button>
        <LanguageSwitcher compact />
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  /* ──── Loading skeleton ──── */
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
        <div className="max-w-[1280px] mx-auto space-y-4">
          {/* ════ Row 1: 3 stat cards ════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ── 1. Profile Status ── */}
            <div onClick={() => navigateTo(Screen.PROFILE)} className={`${CARD_CLICK} p-5`}>
              <span className={LABEL}>{t('Dashboard.profile_strength')}</span>
              <div className="mt-4 flex items-center gap-4">
                {/* Circular progress ring */}
                <div className="relative flex-shrink-0 w-[88px] h-[88px]">
                  <svg viewBox="0 0 104 104" className="w-full h-full -rotate-90">
                    <circle
                      cx="52"
                      cy="52"
                      r={PR}
                      fill="none"
                      strokeWidth="7"
                      className="stroke-gray-100 dark:stroke-white/[0.07]"
                    />
                    <circle
                      cx="52"
                      cy="52"
                      r={PR}
                      fill="none"
                      strokeWidth="7"
                      stroke="#2D4DE0"
                      strokeLinecap="round"
                      strokeDasharray={PC}
                      strokeDashoffset={profOff}
                      className="[transition:stroke-dashoffset_1s_ease-out]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {stats.profileCompletion >= 100 ? (
                      <CheckCircleIcon className="w-6 h-6 text-primary" />
                    ) : (
                      <span className="text-[17px] font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">
                        {stats.profileCompletion}
                        <span className="text-[10px] font-bold text-gray-400">%</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Text block */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{profLabel}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug line-clamp-2">
                    {t('Dashboard.profile_x_complete', { percent: stats.profileCompletion })}
                  </p>
                  <div className="mt-2.5 w-full h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full [transition:width_1s_ease-out]"
                      style={{ width: `${stats.profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2. ATS CV Match ── */}
            <div onClick={() => navigateTo(Screen.ATS_CHECKER)} className={`${CARD_CLICK} p-5`}>
              <div className="flex items-center justify-between">
                <span className={LABEL}>{t('Dashboard.cv_ats_score')}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo(Screen.ATS_CHECKER);
                  }}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-primary/5 text-primary border border-primary/15 hover:bg-primary/10 transition-colors whitespace-nowrap"
                >
                  {t('Dashboard.scan_again')}
                </button>
              </div>

              {/* Semi-circle gauge */}
              <div className="mt-3 relative">
                <svg
                  viewBox="0 0 200 115"
                  className="w-full max-w-[200px] mx-auto block"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ats-gauge-g" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={atsRating.g0} />
                      <stop offset="100%" stopColor={atsRating.g1} />
                    </linearGradient>
                  </defs>
                  {/* Track */}
                  <path
                    d="M 20,100 A 80,80 0 0,1 180,100"
                    fill="none"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="stroke-gray-100 dark:stroke-white/[0.07]"
                  />
                  {/* Progress */}
                  <path
                    d="M 20,100 A 80,80 0 0,1 180,100"
                    fill="none"
                    stroke="url(#ats-gauge-g)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${atsDash} ${ATS_ARC}`}
                    className="[transition:stroke-dasharray_1s_ease-out] [filter:drop-shadow(0_0_6px_rgba(16,185,129,0.25))]"
                  />
                  {/* Score value */}
                  <text
                    x="100"
                    y="92"
                    textAnchor="middle"
                    fontSize="26"
                    fontWeight="800"
                    className="fill-gray-900 dark:fill-white"
                  >
                    {stats.atsScore}
                  </text>
                  {/* Rating label */}
                  <text
                    x="100"
                    y="110"
                    textAnchor="middle"
                    fontSize="12"
                    fontWeight="700"
                    fill={atsRating.svgFill}
                  >
                    {atsRating.label}
                  </text>
                </svg>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-1 leading-snug px-2">
                Your CV matches{' '}
                <span className={`font-bold ${atsRating.textClass}`}>{stats.atsScore}%</span> of
                targeted job requirements.
              </p>
            </div>

            {/* ── 3. Latest Application ── */}
            <div
              onClick={() => navigateTo(Screen.CAREER_TRACKER)}
              className={`${CARD_CLICK} p-5 sm:col-span-2 lg:col-span-1`}
            >
              <div className="flex items-center justify-between">
                <span className={LABEL}>{t('Dashboard.latest_application')}</span>
                <ArrowRightIcon className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
              </div>

              {latestApp ? (
                <div className="mt-4 space-y-5">
                  {/* Company row */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-white ${avatarColor(latestApp.job?.company || 'C')}`}
                    >
                      {(latestApp.job?.company || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {latestApp.job?.company}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{latestApp.job?.title}</p>
                    </div>
                  </div>

                  {/* Pipeline step indicator */}
                  <div>
                    <div className="flex items-center">
                      {PIPELINE_STEPS.map((stepKey, i) => (
                        <div key={i} className="flex items-center flex-1 last:flex-none">
                          {/* Dot */}
                          <div
                            className={`relative w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                              isRejected && i === currentStep
                                ? 'border-red-400 bg-red-50 dark:bg-red-500/10'
                                : i < currentStep
                                  ? 'border-primary bg-primary'
                                  : i === currentStep
                                    ? 'border-primary bg-white dark:bg-[#14161f] ring-2 ring-primary/20'
                                    : 'border-gray-200 dark:border-white/[0.1] bg-white dark:bg-[#14161f]'
                            }`}
                          >
                            {i < currentStep ? (
                              <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
                            ) : i === currentStep ? (
                              <div
                                className={`w-2 h-2 rounded-full ${isRejected ? 'bg-red-400' : 'bg-primary'}`}
                              />
                            ) : null}
                          </div>
                          {/* Connector */}
                          {i < PIPELINE_STEPS.length - 1 && (
                            <div
                              className={`flex-1 h-[2px] mx-1 rounded transition-all ${
                                i < currentStep ? 'bg-primary' : 'bg-gray-100 dark:bg-white/[0.07]'
                              }`}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Step labels */}
                    <div className="flex mt-1.5">
                      {PIPELINE_STEPS.map((stepKey, i) => (
                        <div key={i} className="flex-1 last:flex-none">
                          <span
                            className={`text-[9px] font-semibold ${
                              i === currentStep
                                ? isRejected
                                  ? 'text-red-500'
                                  : 'text-primary'
                                : i < currentStep
                                  ? 'text-gray-500 dark:text-gray-400'
                                  : 'text-gray-300 dark:text-gray-600'
                            }`}
                          >
                            {t(stepKey)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
                  <BriefcaseIcon className="w-8 h-8 text-gray-200 dark:text-gray-700 mb-2" />
                  <p className="text-sm text-gray-400">{t('Dashboard.no_applications')}</p>
                </div>
              )}
            </div>
          </div>

          {/* ════ Row 2: Recent Applications (≈70%) + Profile Views (≈30%) ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
            {/* Recent Applications */}
            <div className={`${CARD_HOVER} overflow-hidden flex flex-col min-h-[300px]`}>
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
                      className={`group flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        i < Math.min(recentApps.length, 5) - 1
                          ? 'border-b border-gray-50 dark:border-white/[0.03]'
                          : ''
                      }`}
                    >
                      {/* Company letter avatar */}
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-white ${avatarColor(app.job?.company || 'C')}`}
                      >
                        {(app.job?.company || 'C').charAt(0).toUpperCase()}
                      </div>

                      {/* Company + role */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                          {app.job?.company}
                        </p>
                        <p className="text-xs text-gray-400 truncate">{app.job?.title}</p>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${b.bg} ${b.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${b.dot}`} />
                        {t(b.labelKey)}
                      </span>

                      {/* Time ago */}
                      <div className="hidden sm:flex items-center gap-1 text-[10px] text-gray-400 flex-shrink-0">
                        <ClockIcon className="w-3 h-3" />
                        {timeAgo(app.createdAt)}
                      </div>

                      {/* Three-dot menu */}
                      <button
                        type="button"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.05] transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                        aria-label="More options"
                      >
                        <EllipsisHorizontalIcon className="w-4 h-4 text-gray-400" />
                      </button>
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
                    className="mt-2 text-sm font-bold text-primary hover:underline"
                  >
                    {t('Dashboard.view_board')} →
                  </button>
                </div>
              )}
            </div>

            {/* Profile Views */}
            <div className={`${CARD_HOVER} flex flex-col`}>
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/[0.04]">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {t('Dashboard.profile_views')}
                </h3>
                <EyeIcon className="w-4 h-4 text-gray-300 dark:text-gray-600" />
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                {/* Decorative scattered dots */}
                <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
                  <div className="absolute top-6 left-8 w-2.5 h-2.5 rounded-full bg-violet-200 dark:bg-violet-500/25" />
                  <div className="absolute top-12 right-10 w-1.5 h-1.5 rounded-full bg-blue-200 dark:bg-blue-500/25" />
                  <div className="absolute top-20 left-16 w-1.5 h-1.5 rounded-full bg-pink-200 dark:bg-pink-500/25" />
                  <div className="absolute bottom-16 left-10 w-2 h-2 rounded-full bg-amber-200 dark:bg-amber-500/25" />
                  <div className="absolute bottom-10 right-12 w-2.5 h-2.5 rounded-full bg-emerald-200 dark:bg-emerald-500/25" />
                  <div className="absolute bottom-20 right-6 w-1.5 h-1.5 rounded-full bg-violet-300 dark:bg-violet-500/20" />
                </div>

                {/* Eye circle icon */}
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                  <EyeIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                </div>

                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {t('Dashboard.no_views_this_week')}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5 leading-relaxed max-w-[200px]">
                  {t('Dashboard.views_cta_subtitle')}
                </p>

                <button
                  type="button"
                  onClick={() => navigateTo(Screen.PROFILE)}
                  className="mt-5 px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 active:scale-[0.97] transition-all shadow-[0_4px_12px_rgba(99,102,241,0.25)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.35)]"
                >
                  {t('Dashboard.update_profile')}
                </button>
              </div>
            </div>
          </div>

          {/* ════ Quick Actions ════ */}
          {(() => {
            const qaCards = [
              {
                label: dashboardData?.telegramConnected
                  ? t('Dashboard.telegram_connected')
                  : t('Dashboard.connect_telegram'),
                icon: '/icons/qa-telegram.png',
                emoji: '✈️',
                bg: 'bg-gradient-to-br from-[#29b6f6] to-[#0288d1]',
                shadow: 'shadow-[0_4px_14px_rgba(2,136,209,0.35)]',
                onClick: () => {
                  if (!dashboardData?.telegramConnected) {
                    window.open(
                      `https://t.me/Student_OS_bot?start=${dashboardData?.userId || ''}`,
                      '_blank'
                    );
                  }
                },
              },
              {
                label: t('Dashboard.plagiarism_checker'),
                icon: '/icons/qa-plagiarism.png',
                emoji: '🛡️',
                bg: 'bg-gradient-to-br from-[#4caf7d] to-[#2e8a5b]',
                shadow: 'shadow-[0_4px_14px_rgba(46,138,91,0.35)]',
                onClick: () => navigateTo(Screen.PLAGIARISM),
              },
              {
                label: t('Dashboard.find_scholarships'),
                icon: '/icons/qa-scholarship.png',
                emoji: '🏅',
                bg: 'bg-gradient-to-br from-[#f6a623] to-[#e08010]',
                shadow: 'shadow-[0_4px_14px_rgba(230,144,16,0.35)]',
                onClick: () => navigateTo(Screen.SCHOLARSHIPS),
              },
              {
                label: t('Dashboard.view_board'),
                icon: '/icons/qa-career.png',
                emoji: '🗂️',
                bg: 'bg-gradient-to-br from-[#f06292] to-[#c2185b]',
                shadow: 'shadow-[0_4px_14px_rgba(194,24,91,0.35)]',
                onClick: () => navigateTo(Screen.CAREER_TRACKER),
              },
              {
                label: t('Dashboard.cv_ats_score'),
                icon: '/icons/qa-ats.png',
                emoji: '📄',
                bg: 'bg-gradient-to-br from-[#7c6fcd] to-[#5c4fad]',
                shadow: 'shadow-[0_4px_14px_rgba(92,79,173,0.35)]',
                onClick: () => navigateTo(Screen.ATS_CHECKER),
              },
              {
                label: t('Dashboard.improve_cv'),
                icon: '/icons/qa-cv.png',
                emoji: '✨',
                bg: 'bg-gradient-to-br from-[#ab7adb] to-[#7b3fbf]',
                shadow: 'shadow-[0_4px_14px_rgba(123,63,191,0.35)]',
                onClick: () => navigateTo(Screen.CAREER_TOOLS),
              },
            ];
            return (
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                  {t('Dashboard.quick_actions')}
                </h2>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {qaCards.map((card, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={card.onClick}
                      className={`rounded-2xl p-3.5 h-[160px] flex flex-col text-left transition-transform duration-200 hover:-translate-y-1 active:translate-y-0 ${card.bg} ${card.shadow}`}
                    >
                      <span className="text-[11px] font-semibold text-white/95 leading-snug">
                        {card.label}
                      </span>
                      <div className="flex-1 flex items-center justify-center">
                        <img
                          src={card.icon}
                          alt={card.label}
                          draggable={false}
                          className="w-16 h-16 object-contain drop-shadow-xl select-none"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fb = (e.target as HTMLImageElement)
                              .nextElementSibling as HTMLElement;
                            if (fb) fb.style.display = 'block';
                          }}
                        />
                        <span className="text-4xl hidden select-none leading-none">
                          {card.emoji}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            );
          })()}

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
                  className="px-5 py-2.5 bg-white text-[#6366f1] rounded-xl text-sm font-bold hover:bg-gray-50 active:scale-[0.97] transition-all whitespace-nowrap flex-shrink-0"
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
