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
} from '@heroicons/react/24/solid';

/* ──── Status config ──── */
const STATUS_CFG: Record<string, { labelKey: string; dot: string; bg: string; text: string }> = {
  NEW: { labelKey: 'Dashboard.status_applied', dot: 'bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-300' },
  SCREENING: { labelKey: 'Dashboard.status_screening', dot: 'bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-600 dark:text-amber-300' },
  INTERVIEW: { labelKey: 'Dashboard.status_interview', dot: 'bg-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-600 dark:text-violet-300' },
  OFFER: { labelKey: 'Dashboard.status_offer', dot: 'bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-300' },
  REJECTED: { labelKey: 'Dashboard.status_rejected', dot: 'bg-red-500', bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-600 dark:text-red-300' },
  WITHDRAWN: { labelKey: 'Dashboard.status_withdrawn', dot: 'bg-gray-400', bg: 'bg-gray-100 dark:bg-gray-500/10', text: 'text-gray-500 dark:text-gray-400' },
};

/* ──── Mock profile viewers ──── */
const MOCK_VIEWERS = [
  { company: 'TechCorp', role: 'HR Manager', time: '2h ago', color: '#6366f1' },
  { company: 'DataFlow', role: 'Recruiter', time: '5h ago', color: '#0ea5e9' },
  { company: 'Innovate Inc', role: 'Talent Lead', time: '1d ago', color: '#f59e0b' },
  { company: 'CloudBase', role: 'CTO', time: '2d ago', color: '#10b981' },
];

/* ──── Shared styles ──── */
const CARD = 'bg-white dark:bg-[#14161f] rounded-2xl border border-gray-100 dark:border-white/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] dark:shadow-none';
const CARD_CLICK = `${CARD} cursor-pointer hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:-translate-y-px active:translate-y-0 transition-all duration-200`;
const LABEL = 'text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 dark:text-gray-500';

/* ════════════════════════════════════════════════════════ */
export default function Dashboard({ navigateTo }: NavigationProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [firstName, setFirstName] = useState('Student');
  const { balance } = useCredits();

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const res = await userApi.getDashboard();
      if (res.data) {
        setDashboardData(res.data);
        const d = res.data as any;
        const name = d.user?.profile?.fullName || d.user?.email?.split('@')[0] || 'Student';
        setFirstName(name.split(' ')[0]);
      }
    } catch (e) { console.error('Dashboard load failed', e); }
    finally { setIsLoading(false); }
  };

  const stats = dashboardData?.stats || { activeApplications: 0, atsScore: 0, habitsCompletedToday: 0, profileCompletion: 0 };
  const recentApps = dashboardData?.recentApplications || [];
  const hr = new Date().getHours();
  const greeting = hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';

  /* ATS ring */
  const R = 38, C = 2 * Math.PI * R, atsOff = C - (stats.atsScore / 100) * C;

  /* ──── Header ──── */
  const headerContent = (
    <header className="h-16 px-5 md:px-8 flex items-center justify-between bg-white dark:bg-[#0c0e16] border-b border-gray-100 dark:border-white/[0.06] z-10">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">
          {greeting}, {firstName}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">{t('Dashboard.daily_briefing')}</p>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          <input className="pl-8 pr-3 py-1.5 w-44 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-200 dark:border-white/[0.08] text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white placeholder:text-gray-400" placeholder={t('Dashboard.search_placeholder')} type="text" />
        </div>
        <button onClick={() => navigateTo(Screen.SETTINGS)} aria-label="Credits" className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/15 rounded-lg cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-500/15 transition-colors text-xs">
          <span>💎</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-300 tabular-nums">{balance}</span>
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
      <DashboardLayout currentScreen={Screen.DASHBOARD} navigateTo={navigateTo} headerContent={headerContent}>
        <div className="flex h-full items-center justify-center">
          <div className="w-7 h-7 border-2 border-gray-200 dark:border-gray-700 border-t-primary rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentScreen={Screen.DASHBOARD} navigateTo={navigateTo} headerContent={headerContent}>
      <div className="p-4 md:p-6 bg-[#f8f9fb] dark:bg-[#0a0c14] min-h-full">
        <div className="max-w-[1240px] mx-auto space-y-4">

          {/* ═══════════════════════════════════
              ROW 1 — 4 compact KPI cards
          ═══════════════════════════════════ */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Applications */}
            <div onClick={() => navigateTo(Screen.CAREER_TRACKER)} className={CARD_CLICK}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={LABEL}>{t('Dashboard.active_applications')}</span>
                  <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                    <BriefcaseIcon className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                </div>
                <span className="text-[36px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums tracking-tight">
                  {stats.activeApplications}
                </span>
                <div className="flex gap-1.5 mt-3">
                  {recentApps.slice(0, 2).map((app: any) => {
                    const b = STATUS_CFG[app.status] || STATUS_CFG.NEW;
                    return (
                      <span key={app.id} className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${b.bg} ${b.text}`}>
                        <span className={`w-1 h-1 rounded-full ${b.dot}`} />
                        {t(b.labelKey)}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ATS Score — compact ring */}
            <div onClick={() => navigateTo(Screen.ATS_CHECKER)} className={CARD_CLICK}>
              <div className="px-5 py-4 flex items-center gap-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={R} fill="none" strokeWidth="7" className="stroke-gray-100 dark:stroke-white/[0.06]" />
                    <defs>
                      <linearGradient id="ats-g" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r={R} fill="none" strokeWidth="7" stroke="url(#ats-g)" strokeDasharray={C} strokeDashoffset={atsOff} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 4px rgba(16,185,129,0.3))', transition: 'stroke-dashoffset 1s ease-out' }} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-extrabold text-gray-900 dark:text-white">{stats.atsScore}</span>
                  </div>
                </div>
                <div>
                  <span className={LABEL}>{t('Dashboard.cv_ats_score')}</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('Dashboard.view_details')}</p>
                </div>
              </div>
            </div>

            {/* Profile Strength */}
            <div onClick={() => navigateTo(Screen.PROFILE)} className={CARD_CLICK}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={LABEL}>{t('Dashboard.profile_strength')}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                    {stats.profileCompletion}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${stats.profileCompletion}%`, background: 'linear-gradient(90deg,#6366f1,#a78bfa)', boxShadow: '0 0 8px rgba(99,102,241,0.35)', transition: 'width 0.8s ease-out' }} />
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">{t('Dashboard.update_profile')}</p>
              </div>
            </div>

            {/* Habits Today */}
            <div onClick={() => navigateTo(Screen.HABIT_TRACKER)} className={CARD_CLICK}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={LABEL}>{t('Dashboard.completed_habits')}</span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    {t('Dashboard.today')}
                  </span>
                </div>
                <span className="text-[36px] font-extrabold text-gray-900 dark:text-white leading-none tabular-nums tracking-tight">
                  {stats.habitsCompletedToday}
                </span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════
              ROW 2 — 3 columns: Apps / Profile Views / Quick Actions
          ═══════════════════════════════════ */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

            {/* ── Recent Applications (5/12) ── */}
            <div className={`lg:col-span-5 ${CARD} overflow-hidden`}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.04]">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">{t('Dashboard.recent_applications')}</h3>
                <button onClick={() => navigateTo(Screen.CAREER_TRACKER)} className="text-[10px] font-bold text-primary hover:text-primary/70 flex items-center gap-1 cursor-pointer transition-colors">
                  {t('Dashboard.view_all')} <ArrowRightIcon className="w-2.5 h-2.5" />
                </button>
              </div>
              <div>
                {recentApps.length > 0 ? (
                  recentApps.slice(0, 4).map((app: any, i: number) => {
                    const b = STATUS_CFG[app.status] || STATUS_CFG.NEW;
                    return (
                      <div key={app.id} className={`group flex items-center justify-between px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${i < Math.min(recentApps.length, 4) - 1 ? 'border-b border-gray-50 dark:border-white/[0.03]' : ''}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                            <BriefcaseIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">{app.job.title}</p>
                            <p className="text-[10px] text-gray-400 truncate">{app.job.company}{app.job.location ? ` · ${app.job.location}` : ''}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${b.bg} ${b.text}`}>
                          <span className={`w-1 h-1 rounded-full ${b.dot}`} />
                          {t(b.labelKey)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-5 py-10 text-center">
                    <BriefcaseIcon className="w-6 h-6 text-gray-200 dark:text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">{t('Dashboard.no_applications')}</p>
                    <button onClick={() => navigateTo(Screen.CAREER_TRACKER)} className="mt-1.5 text-xs font-bold text-primary hover:underline cursor-pointer">
                      {t('Dashboard.view_board')} →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ── Profile Views (4/12) — NEW WIDGET ── */}
            <div className={`lg:col-span-4 ${CARD} overflow-hidden`}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/[0.04]">
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-3.5 h-3.5 text-violet-500" />
                  <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">Profile Views</h3>
                </div>
                <button className="text-[10px] font-bold text-primary hover:text-primary/70 flex items-center gap-1 cursor-pointer transition-colors">
                  View all <ArrowRightIcon className="w-2.5 h-2.5" />
                </button>
              </div>

              {/* View counts */}
              <div className="flex border-b border-gray-50 dark:border-white/[0.03]">
                <div className="flex-1 px-5 py-3 border-r border-gray-50 dark:border-white/[0.03]">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">Today</span>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 tabular-nums">3</p>
                </div>
                <div className="flex-1 px-5 py-3">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-gray-400 dark:text-gray-500">This week</span>
                  <p className="text-xl font-extrabold text-gray-900 dark:text-white mt-0.5 tabular-nums">12</p>
                </div>
              </div>

              {/* Viewer list */}
              <div>
                {MOCK_VIEWERS.map((v, i) => (
                  <div key={i} className={`flex items-center gap-3 px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer ${i < MOCK_VIEWERS.length - 1 ? 'border-b border-gray-50 dark:border-white/[0.03]' : ''}`}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold" style={{ background: v.color }}>
                      {v.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{v.company}</p>
                      <p className="text-[10px] text-gray-400 truncate">{v.role}</p>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">{v.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Quick Actions (3/12) ── */}
            <div className={`lg:col-span-3 ${CARD} flex flex-col`}>
              <div className="px-5 py-3 border-b border-gray-100 dark:border-white/[0.04]">
                <h3 className="text-[13px] font-bold text-gray-900 dark:text-white">{t('Dashboard.quick_actions')}</h3>
              </div>
              <div className="flex flex-col gap-0.5 p-2 flex-1">
                {/* Scholarships */}
                <button onClick={() => navigateTo(Screen.SCHOLARSHIPS)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" /></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('Dashboard.find_scholarships')}</p>
                    <p className="text-[10px] text-gray-400">{t('Dashboard.browse_opportunities')}</p>
                  </div>
                </button>

                {/* CV */}
                <button onClick={() => navigateTo(Screen.ATS_CHECKER)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('Dashboard.improve_cv')}</p>
                    <p className="text-[10px] text-gray-400">{t('Dashboard.boost_ats_score')}</p>
                  </div>
                </button>

                {/* Career */}
                <button onClick={() => navigateTo(Screen.CAREER_TRACKER)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors text-left cursor-pointer group">
                  <div className="w-9 h-9 rounded-lg bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                    <BriefcaseIcon className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">{t('Dashboard.view_board')}</p>
                    <p className="text-[10px] text-gray-400">{t('Dashboard.pipeline_status')}</p>
                  </div>
                </button>

                {/* Telegram */}
                {dashboardData?.telegramConnected ? (
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-100 dark:border-emerald-500/10">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">{t('Dashboard.telegram_connected')}</p>
                      <p className="text-[10px] text-emerald-500/60">{t('Dashboard.receiving_notifications')}</p>
                    </div>
                  </div>
                ) : (
                  <a href={`https://t.me/Student_OS_bot?start=${dashboardData?.userId || ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#229ED9]/5 transition-colors text-left cursor-pointer group">
                    <div className="w-9 h-9 rounded-lg bg-[#229ED9]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <svg className="w-4 h-4 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#229ED9]">{t('Dashboard.connect_telegram')}</p>
                      <p className="text-[10px] text-[#229ED9]/50">{t('Dashboard.telegram_alerts')}</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════
              ROW 3 — Profile completion banner (compact)
          ═══════════════════════════════════ */}
          {stats.profileCompletion < 100 && (
            <div className="bg-gray-900 dark:bg-[#0d0f17] text-white rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-bold">{t('Dashboard.complete_profile_banner')}</p>
                  <p className="text-xs text-gray-400">{t('Dashboard.profile_x_complete', { percent: stats.profileCompletion })}</p>
                </div>
              </div>
              <button onClick={() => navigateTo(Screen.PROFILE)} className="px-5 py-2 bg-white text-gray-900 rounded-xl text-xs font-bold hover:bg-gray-100 active:scale-[0.97] transition-all cursor-pointer whitespace-nowrap">
                {t('Dashboard.update_profile')}
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
