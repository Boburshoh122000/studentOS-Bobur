import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { userApi, habitApi } from '../src/services/api';
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
  ClockIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  AcademicCapIcon,
  UserCircleIcon,
  FireIcon,
  XMarkIcon,
  SparklesIcon,
  ChevronRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MinusIcon,
} from '@heroicons/react/24/solid';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import folderImg from '../public/icons/folder.png';
import atsImg from '../public/icons/ATS.png';
import plagiarismImg from '../public/icons/plagiarism checker.png';
import telegramImg from '../public/icons/telegram 3d.png';
import cvImg from '../public/icons/CV.png';
import diamondImg from '../public/icons/diamond.png';

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

/* ──── ATS chart custom tooltip ──── */
const AtsTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white dark:bg-[#1e2330] border border-gray-100 dark:border-white/[0.08] rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-bold text-gray-900 dark:text-white text-sm">{d.score}</p>
      <p className="text-gray-400">{d.label}</p>
      {d.jobTitle && <p className="text-gray-400 truncate max-w-[160px]">{d.jobTitle}</p>}
    </div>
  );
};

/* ═══════════════════════════════════════════════ */
export default function Dashboard({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [firstName, setFirstName] = useState('');
  const { balance } = useCredits();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [dismissedNudge, setDismissedNudge] = useState<string | null>(null);
  const [togglingHabit, setTogglingHabit] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard();
    const today = new Date().toDateString();
    const key = localStorage.getItem('nudge_dismissed_day');
    if (key !== today) {
      localStorage.removeItem('nudge_dismissed_type');
      localStorage.setItem('nudge_dismissed_day', today);
    }
    setDismissedNudge(localStorage.getItem('nudge_dismissed_type'));
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

  const toggleHabit = async (habit: any) => {
    setTogglingHabit(habit.id);
    try {
      if (habit.completedToday) {
        await habitApi.unlog(habit.id);
      } else {
        await habitApi.log(habit.id);
      }
      await fetchDashboard();
    } catch (e) {
      console.error('Habit toggle failed', e);
    } finally {
      setTogglingHabit(null);
    }
  };

  const dismissNudge = (type: string) => {
    setDismissedNudge(type);
    localStorage.setItem('nudge_dismissed_type', type);
  };

  const stats = dashboardData?.stats || {
    activeApplications: 0,
    atsScore: 0,
    habitsCompletedToday: 0,
    profileCompletion: 0,
    totalHabits: 0,
  };
  const recentApps = dashboardData?.recentApplications || [];
  const habits: any[] = dashboardData?.habits || [];
  const atsHistory: any[] = dashboardData?.atsHistory || [];
  const upcomingDeadlines: any[] = dashboardData?.upcomingDeadlines || [];
  const activityHeatmap: any[] = dashboardData?.activityHeatmap || [];
  const streakDays: number = dashboardData?.streakDays || 0;
  const lastCvScanDate: string | null = dashboardData?.lastCvScanDate || null;
  const previousAtsScore: number | null = dashboardData?.previousAtsScore ?? null;
  const lastLoginAt: string | null = dashboardData?.lastLoginAt || null;
  const profile = dashboardData?.profile || {};
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
      : t('Dashboard.profile_in_progress');

  /* ATS gauge geometry */
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

  /* ──── Nudge computation ──── */
  const nudgeType = (() => {
    if (!dashboardData) return null;
    // 1. CV stale
    if (!lastCvScanDate) return 'cv_stale';
    const daysSinceScan = Math.floor((Date.now() - new Date(lastCvScanDate).getTime()) / 86400000);
    if (daysSinceScan > 14) return 'cv_stale';
    // 2. Scholarship deadline ≤7 days
    if (upcomingDeadlines.length > 0) {
      const daysLeft = Math.ceil(
        (new Date(upcomingDeadlines[0].deadline).getTime() - Date.now()) / 86400000
      );
      if (daysLeft <= 7) return 'scholarship_deadline';
    }
    // 3. Profile incomplete
    if (stats.profileCompletion < 70) return 'profile_incomplete';
    // 4. Habit streak at risk
    if (streakDays > 0 && stats.habitsCompletedToday === 0 && hr >= 14) return 'habit_streak';
    return null;
  })();

  const nudge = (() => {
    if (!nudgeType || nudgeType === dismissedNudge) return null;
    const daysSinceScan = lastCvScanDate
      ? Math.floor((Date.now() - new Date(lastCvScanDate).getTime()) / 86400000)
      : null;
    if (nudgeType === 'cv_stale')
      return {
        type: 'cv_stale',
        Icon: ExclamationTriangleIcon,
        colors:
          'bg-amber-50 dark:bg-amber-500/10 border-amber-400 text-amber-800 dark:text-amber-200',
        message: `Your CV hasn't been scanned in ${daysSinceScan ?? 'many'} days. Job markets move fast — rescan now.`,
        cta: 'Rescan CV',
        screen: Screen.ATS_CHECKER,
      };
    if (nudgeType === 'scholarship_deadline') {
      const item = upcomingDeadlines[0];
      const daysLeft = Math.ceil((new Date(item.deadline).getTime() - Date.now()) / 86400000);
      return {
        type: 'scholarship_deadline',
        Icon: AcademicCapIcon,
        colors: 'bg-blue-50 dark:bg-blue-500/10 border-indigo-400 text-blue-800 dark:text-blue-200',
        message: `"${item.title}" deadline is in ${daysLeft} days. Don't miss it.`,
        cta: 'View Scholarship',
        screen: Screen.SCHOLARSHIPS,
      };
    }
    if (nudgeType === 'profile_incomplete')
      return {
        type: 'profile_incomplete',
        Icon: UserCircleIcon,
        colors:
          'bg-purple-50 dark:bg-purple-500/10 border-purple-400 text-purple-800 dark:text-purple-200',
        message: `Your profile is ${stats.profileCompletion}% complete. Employers skip incomplete profiles.`,
        cta: 'Complete Profile',
        screen: Screen.PROFILE,
      };
    if (nudgeType === 'habit_streak')
      return {
        type: 'habit_streak',
        Icon: FireIcon,
        colors:
          'bg-orange-50 dark:bg-orange-500/10 border-orange-400 text-orange-800 dark:text-orange-200',
        message: `You haven't checked any habits today. Your ${streakDays}-day streak is at risk.`,
        cta: 'Track Now',
        screen: Screen.HABIT_TRACKER,
      };
    return null;
  })();

  /* ──── Profile checklist ──── */
  const incompleteItems = [
    !profile.headline && 'Add headline',
    !profile.avatarUrl && 'Upload avatar',
    (!profile.workExperience ||
      (Array.isArray(profile.workExperience) && profile.workExperience.length === 0)) &&
      'Add work experience',
    (!profile.educationHistory ||
      (Array.isArray(profile.educationHistory) && profile.educationHistory.length === 0)) &&
      'Add education',
    (!profile.skills || (Array.isArray(profile.skills) && profile.skills.length === 0)) &&
      'Add skills',
    !profile.bio && 'Write bio',
  ].filter(Boolean) as string[];
  const top3Incomplete = incompleteItems.slice(0, 3);

  /* ──── ATS trend delta ──── */
  const atsDelta = previousAtsScore !== null ? stats.atsScore - previousAtsScore : null;

  /* ──── ATS chart data ──── */
  const chartData = atsHistory.map((s: any) => ({
    score: s.score,
    label: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    jobTitle: s.jobTitle,
  }));

  /* ──── Heatmap cell color ──── */
  const cellColor = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-white/[0.05]';
    if (count <= 2) return 'bg-indigo-200 dark:bg-indigo-900/50';
    if (count <= 5) return 'bg-indigo-400 dark:bg-indigo-600/60';
    return 'bg-indigo-600 dark:bg-indigo-500';
  };

  /* ──── Heatmap total ──── */
  const totalActions = activityHeatmap.reduce((s: number, d: any) => s + d.count, 0);
  const mostActiveDay = (() => {
    if (activityHeatmap.length === 0) return null;
    const max = activityHeatmap.reduce((a: any, b: any) => (b.count > a.count ? b : a));
    if (max.count === 0) return null;
    return new Date(max.date).toLocaleDateString('en-US', { weekday: 'long' });
  })();

  /* ──── Suggested actions ──── */
  interface Suggestion {
    id: string;
    Icon: React.ComponentType<{ className?: string }>;
    iconBg: string;
    message: string;
    cta: string;
    screen?: Screen;
  }
  const suggestions: Suggestion[] = (() => {
    const s: Suggestion[] = [];
    if (!lastCvScanDate)
      s.push({
        id: 'no_cv',
        Icon: AcademicCapIcon,
        iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
        message: 'Upload your CV for an ATS scan to see how you score.',
        cta: 'Scan CV',
        screen: Screen.ATS_CHECKER,
      });
    else if (stats.atsScore < 50)
      s.push({
        id: 'low_ats',
        Icon: AcademicCapIcon,
        iconBg: 'bg-red-100 dark:bg-red-500/20',
        message: 'Your ATS score is below average. Optimize your CV for your target role.',
        cta: 'Improve CV',
        screen: Screen.ATS_CHECKER,
      });
    if (stats.profileCompletion < 60)
      s.push({
        id: 'profile',
        Icon: UserCircleIcon,
        iconBg: 'bg-purple-100 dark:bg-purple-500/20',
        message: 'Complete your profile — it takes 3 minutes and makes you visible to employers.',
        cta: 'Complete Profile',
        screen: Screen.PROFILE,
      });
    if (stats.activeApplications === 0)
      s.push({
        id: 'no_apps',
        Icon: BriefcaseIcon,
        iconBg: 'bg-blue-100 dark:bg-blue-500/20',
        message: 'Start applying. Add your first job application to the career tracker.',
        cta: 'Open Tracker',
        screen: Screen.CAREER_TRACKER,
      });
    if (stats.totalHabits === 0)
      s.push({
        id: 'no_habits',
        Icon: FireIcon,
        iconBg: 'bg-orange-100 dark:bg-orange-500/20',
        message:
          'Students with daily habits are 2.4× more likely to land internships. Create your first habit.',
        cta: 'Create Habit',
        screen: Screen.HABIT_TRACKER,
      });
    else if (streakDays === 0 && stats.totalHabits > 0)
      s.push({
        id: 'streak_reset',
        Icon: FireIcon,
        iconBg: 'bg-orange-100 dark:bg-orange-500/20',
        message: 'Your streak reset. Restart today — consistency beats perfection.',
        cta: 'Track Now',
        screen: Screen.HABIT_TRACKER,
      });
    if (atsDelta !== null && atsDelta >= 10)
      s.push({
        id: 'ats_improved',
        Icon: ArrowTrendingUpIcon,
        iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
        message: `Great progress! Your ATS score jumped +${atsDelta} points since your last scan.`,
        cta: 'View Score',
        screen: Screen.ATS_CHECKER,
      });
    else if (lastLoginAt) {
      const daysSinceLogin = Math.floor((Date.now() - new Date(lastLoginAt).getTime()) / 86400000);
      if (daysSinceLogin >= 3)
        s.push({
          id: 'welcome_back',
          Icon: SparklesIcon,
          iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
          message: `Welcome back! You were last here ${timeAgo(lastLoginAt)}.`,
          cta: 'Explore',
          screen: Screen.DASHBOARD,
        });
    }
    return s.slice(0, 3);
  })();

  /* ──── Header ──── */
  const headerContent = (
    <header className="h-16 px-4 md:px-6 flex items-center gap-3 bg-white dark:bg-[#0c0e16] border-b border-gray-100 dark:border-white/[0.06]">
      <div className="flex-shrink-0 min-w-0">
        <p className="text-[15px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug truncate">
          {t(greetKey)}, {firstName || 'there'}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-none mt-0.5">
          {t('Dashboard.daily_briefing')}
        </p>
      </div>

      <div className="hidden md:block relative ml-auto mr-2 lg:mr-4">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder={`${t('Dashboard.search_placeholder')}...`}
          className="w-[200px] focus:w-[280px] h-10 pl-11 pr-12 rounded-full bg-slate-50 border border-transparent text-sm font-medium focus:outline-none focus:border-[#4F46E5]/30 focus:bg-white focus:shadow-[0_0_0_4px_rgba(79,70,229,0.1)] transition-all duration-300 ease-in-out placeholder:text-slate-400 text-slate-700 hover:bg-slate-100 dark:bg-white/[0.04] dark:border-white/[0.06] dark:text-white dark:hover:bg-white/[0.08]"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto md:ml-0 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigateTo(Screen.SETTINGS)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.08] rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.07] transition-colors"
        >
          <img src={diamondImg} alt="Credits" className="w-4 h-4 object-contain flex-shrink-0" />
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
          {/* ════ SECTION 1: Smart Nudge Banner ════ */}
          {nudge && (
            <div
              className={`rounded-xl border-l-4 ${nudge.colors} p-3.5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 animate-in slide-in-from-top-2 fade-in duration-300`}
            >
              <div className="flex items-center gap-3">
                <nudge.Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium leading-snug">{nudge.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => navigateTo(nudge.screen)}
                  className="text-sm font-bold underline underline-offset-2 whitespace-nowrap"
                >
                  {nudge.cta}
                </button>
                <button
                  type="button"
                  onClick={() => dismissNudge(nudge.type)}
                  className="p-1 rounded-lg hover:bg-black/10 transition-colors"
                  aria-label="Dismiss"
                >
                  <XMarkIcon className="w-4 h-4 opacity-60" />
                </button>
              </div>
            </div>
          )}

          {/* ════ SECTION 2: KPI Stat Cards ════ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ── Card 1: ATS Score ── */}
            <div
              onClick={() => navigateTo(Screen.ATS_CHECKER)}
              className={`${CARD_CLICK} p-5 min-h-[220px] flex flex-col`}
            >
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
              <div className="mt-2 relative">
                <svg
                  viewBox="0 0 200 115"
                  className="w-full max-w-[180px] mx-auto block"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="ats-gauge-g" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor={atsRating.g0} />
                      <stop offset="100%" stopColor={atsRating.g1} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20,100 A 80,80 0 0,1 180,100"
                    fill="none"
                    strokeWidth="14"
                    strokeLinecap="round"
                    className="stroke-gray-100 dark:stroke-white/[0.07]"
                  />
                  <path
                    d="M 20,100 A 80,80 0 0,1 180,100"
                    fill="none"
                    stroke="url(#ats-gauge-g)"
                    strokeWidth="14"
                    strokeLinecap="round"
                    strokeDasharray={`${atsDash} ${ATS_ARC}`}
                    className="[transition:stroke-dasharray_1s_ease-out]"
                  />
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

              {/* Trend delta */}
              <div className="mt-auto pt-2 flex items-center justify-center gap-1.5">
                {atsDelta === null ? (
                  <span className="text-xs text-gray-400">First scan — no trend yet</span>
                ) : atsDelta === 0 ? (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MinusIcon className="w-3 h-3" /> No change since last scan
                  </span>
                ) : atsDelta > 0 ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-500">
                    <ArrowTrendingUpIcon className="w-3.5 h-3.5" /> +{atsDelta} since last scan
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                    <ArrowTrendingDownIcon className="w-3.5 h-3.5" /> {atsDelta} since last scan
                  </span>
                )}
              </div>
            </div>

            {/* ── Card 2: Profile Strength ── */}
            <div
              onClick={() => navigateTo(Screen.PROFILE)}
              className={`${CARD_CLICK} p-5 min-h-[220px] flex flex-col`}
            >
              <span className={LABEL}>{t('Dashboard.profile_strength')}</span>
              <div className="mt-3 flex items-center gap-4">
                {/* Circular ring */}
                <div className="relative flex-shrink-0 w-[80px] h-[80px]">
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
                      <span className="text-[15px] font-extrabold text-gray-900 dark:text-white tabular-nums leading-none">
                        {stats.profileCompletion}
                        <span className="text-[9px] font-bold text-gray-400">%</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{profLabel}</p>
                  <div className="mt-2 w-full h-1.5 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full [transition:width_1s_ease-out]"
                      style={{ width: `${stats.profileCompletion}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Micro-checklist */}
              <div className="mt-3 space-y-1.5 flex-1">
                {stats.profileCompletion >= 100 ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-500">
                    <CheckCircleIcon className="w-4 h-4" /> Profile complete
                  </div>
                ) : top3Incomplete.length > 0 ? (
                  top3Incomplete.map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400"
                    >
                      <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                      {item}
                    </div>
                  ))
                ) : null}
              </div>
            </div>

            {/* ── Card 3: Today's Habits ── */}
            <div
              className={`${CARD_HOVER} p-5 min-h-[220px] sm:col-span-2 lg:col-span-1 flex flex-col`}
            >
              <div className="flex items-center justify-between">
                <span className={LABEL}>Today's Habits</span>
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                  className={VIEW_LINK}
                >
                  View all <ArrowRightIcon className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* Progress */}
              <div className="mt-3 flex items-center gap-3">
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">
                  {stats.habitsCompletedToday}
                  <span className="text-sm font-semibold text-gray-400">
                    /{stats.totalHabits || habits.length}
                  </span>
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                    style={{
                      width:
                        habits.length > 0
                          ? `${(stats.habitsCompletedToday / habits.length) * 100}%`
                          : '0%',
                    }}
                  />
                </div>
              </div>

              {/* Inline habit list */}
              <div className="mt-3 space-y-2 flex-1">
                {habits.length === 0 ? (
                  <div className="flex flex-col items-start gap-1 py-2">
                    <p className="text-xs text-gray-400">No habits yet</p>
                    <button
                      type="button"
                      onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Create one →
                    </button>
                  </div>
                ) : (
                  habits.slice(0, 4).map((habit: any) => (
                    <div key={habit.id} className="flex items-center gap-2.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: habit.color || '#6366f1' }}
                      />
                      <span
                        className={`flex-1 text-xs truncate ${habit.completedToday ? 'line-through text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}
                      >
                        {habit.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleHabit(habit)}
                        disabled={togglingHabit === habit.id}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          habit.completedToday
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-gray-600 hover:border-indigo-400'
                        } disabled:opacity-50`}
                        aria-label={habit.completedToday ? 'Unmark' : 'Mark done'}
                      >
                        {habit.completedToday && <CheckCircleIcon className="w-3 h-3 text-white" />}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* ════ Quick Actions (PRESERVED — DO NOT MODIFY) ════ */}
          {(() => {
            const qaCards = [
              {
                label: dashboardData?.telegramConnected
                  ? t('Dashboard.telegram_connected')
                  : t('Dashboard.connect_telegram'),
                icon: telegramImg,
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
                icon: plagiarismImg,
                emoji: '🛡️',
                bg: 'bg-gradient-to-br from-[#4caf7d] to-[#2e8a5b]',
                shadow: 'shadow-[0_4px_14px_rgba(46,138,91,0.35)]',
                onClick: () => navigateTo(Screen.PLAGIARISM),
              },
              {
                label: t('Dashboard.view_board'),
                icon: folderImg,
                emoji: '🗂️',
                bg: 'bg-gradient-to-br from-[#f06292] to-[#c2185b]',
                shadow: 'shadow-[0_4px_14px_rgba(194,24,91,0.35)]',
                onClick: () => navigateTo(Screen.CAREER_TRACKER),
              },
              {
                label: t('Dashboard.cv_ats_score'),
                icon: atsImg,
                emoji: '📄',
                bg: 'bg-gradient-to-br from-[#7c6fcd] to-[#5c4fad]',
                shadow: 'shadow-[0_4px_14px_rgba(92,79,173,0.35)]',
                onClick: () => navigateTo(Screen.ATS_CHECKER),
              },
              {
                label: t('Dashboard.improve_cv'),
                icon: cvImg,
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
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
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

          {/* ════ SECTION 3+4: ATS Trend Chart + Upcoming Deadlines ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* ── Section 3: ATS Trend Chart ── */}
            <div className={`${CARD_HOVER} p-5 lg:col-span-3`}>
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    ATS Score Trend
                  </h3>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    Track how your CV improves over time
                  </p>
                </div>
                {chartData.length > 0 && (
                  <span className="text-2xl font-black text-gray-900 dark:text-white tabular-nums">
                    {chartData[chartData.length - 1]?.score}
                  </span>
                )}
              </div>

              {chartData.length < 2 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                  <AcademicCapIcon className="w-9 h-9 text-gray-200 dark:text-gray-700" />
                  <p className="text-sm text-gray-400">
                    Scan your CV multiple times to see your progress trend here.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo(Screen.ATS_CHECKER)}
                    className="text-sm font-bold text-primary hover:underline"
                  >
                    Scan Now →
                  </button>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="atsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip
                      content={<AtsTooltip />}
                      cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                    />
                    <ReferenceLine
                      y={70}
                      stroke="#10b981"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Pass Zone',
                        fill: '#10b981',
                        fontSize: 9,
                        position: 'insideTopRight',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fill="url(#atsGradient)"
                      dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#6366f1' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* ── Section 4: Upcoming Deadlines ── */}
            <div className={`${CARD_HOVER} p-5 lg:col-span-2 flex flex-col`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Upcoming Deadlines
                </h3>
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                  className={VIEW_LINK}
                >
                  Browse <ArrowRightIcon className="w-2.5 h-2.5" />
                </button>
              </div>

              {upcomingDeadlines.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 text-center gap-2">
                  <ClockIcon className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                  <p className="text-xs text-gray-400 leading-snug max-w-[180px]">
                    No upcoming deadlines. Save scholarships to track them here.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    Browse Scholarships →
                  </button>
                </div>
              ) : (
                <div className="space-y-3 flex-1">
                  {upcomingDeadlines.map((item: any) => {
                    const daysLeft = Math.ceil(
                      (new Date(item.deadline).getTime() - Date.now()) / 86400000
                    );
                    const urgency =
                      daysLeft <= 3
                        ? { border: 'border-red-400', days: 'text-red-500' }
                        : daysLeft <= 7
                          ? { border: 'border-amber-400', days: 'text-amber-500' }
                          : {
                              border: 'border-gray-200 dark:border-white/[0.1]',
                              days: 'text-gray-400',
                            };
                    const deadlineDate = new Date(item.deadline);
                    return (
                      <div
                        key={item.id}
                        onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                        className={`flex gap-3 border-l-4 pl-3 py-1 cursor-pointer hover:opacity-80 transition-opacity ${urgency.border}`}
                      >
                        <div className="w-10 text-center shrink-0">
                          <div className="text-[9px] font-bold uppercase text-gray-400 leading-none">
                            {deadlineDate.toLocaleDateString('en-US', { month: 'short' })}
                          </div>
                          <div className="text-lg font-black text-gray-900 dark:text-white leading-tight">
                            {deadlineDate.getDate()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-[9px] font-bold uppercase tracking-wide rounded-full px-1.5 py-0.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                            Scholarship
                          </span>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mt-0.5 truncate">
                            {item.title}
                          </p>
                          <p className={`text-[10px] font-medium ${urgency.days}`}>
                            in {daysLeft} day{daysLeft !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ════ SECTION 5+6: Activity Heatmap + Suggested Actions ════ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* ── Section 5: Activity Heatmap ── */}
            <div className={`${CARD_HOVER} p-5`}>
              <div className="mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Your Activity</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 28 days</p>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                  <span key={i} className="text-center text-[10px] text-gray-400">
                    {d}
                  </span>
                ))}
              </div>

              {/* Heatmap grid — 4 rows × 7 cols */}
              <div className="grid grid-cols-7 gap-1">
                {activityHeatmap.map((day: any, i: number) => (
                  <div
                    key={i}
                    title={`${day.date}: ${day.count} action${day.count !== 1 ? 's' : ''}`}
                    className={`h-4 w-full rounded-sm ${cellColor(day.count)}`}
                  />
                ))}
              </div>

              {/* Legend + stats */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                  <span>Less</span>
                  {[
                    'bg-gray-100 dark:bg-white/[0.05]',
                    'bg-indigo-200 dark:bg-indigo-900/50',
                    'bg-indigo-400 dark:bg-indigo-600/60',
                    'bg-indigo-600 dark:bg-indigo-500',
                  ].map((c, i) => (
                    <div key={i} className={`h-3 w-3 rounded-sm ${c}`} />
                  ))}
                  <span>More</span>
                </div>
                <div className="text-[10px] text-gray-400 text-right">
                  <span className="font-semibold text-gray-700 dark:text-gray-300">
                    {totalActions}
                  </span>{' '}
                  actions this month
                  {mostActiveDay && (
                    <>
                      {' '}
                      ·{' '}
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {mostActiveDay}
                      </span>{' '}
                      most active
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Section 6: Suggested Actions ── */}
            <div className={`${CARD_HOVER} p-5 flex flex-col`}>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
                Suggested for You
              </h3>

              {suggestions.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-2 py-6 text-center">
                  <CheckCircleIcon className="w-8 h-8 text-emerald-400" />
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    You're on track. Keep going.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {suggestions.map((s, i) => (
                    <div key={s.id}>
                      <div className="flex items-start gap-3 py-2.5">
                        <div
                          className={`w-8 h-8 rounded-full ${s.iconBg} flex items-center justify-center shrink-0 mt-0.5`}
                        >
                          <s.Icon className="w-4 h-4 text-gray-700 dark:text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
                            {s.message}
                          </p>
                          {s.screen && s.screen !== Screen.DASHBOARD && (
                            <button
                              type="button"
                              onClick={() => navigateTo(s.screen!)}
                              className="mt-1 text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
                            >
                              {s.cta} <ChevronRightIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      {i < suggestions.length - 1 && (
                        <div className="border-b border-gray-50 dark:border-white/[0.04]" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
