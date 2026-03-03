import { useState, useEffect, useCallback } from 'react';
import { Screen, NavigationProps } from '../types';
import DashboardLayout from './DashboardLayout';
import { aiApi } from '../src/services/api';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  DocumentCheckIcon,
  ArrowRightIcon,
  ClockIcon,
  LightBulbIcon,
  UserCircleIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

/* ─── Types ─────────────────────────────────────────────────────────────── */

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  score: number | null;
  status: string | null;
  timestamp: string;
  scanId: string;
}

/* ─── Static data ────────────────────────────────────────────────────────── */

const tools = [
  {
    label: 'CV Builder',
    description: 'Create ATS-optimized resumes with AI assistance',
    icon: DocumentTextIcon,
    screen: Screen.CV_BUILDER,
    iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    hoverBorder: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  {
    label: 'ATS Checker',
    description: 'Analyze and score your CV against job descriptions',
    icon: DocumentCheckIcon,
    screen: Screen.ATS_CHECKER,
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    hoverBorder: 'hover:border-indigo-300 dark:hover:border-indigo-700',
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getScoreBadge(score: number) {
  if (score >= 70)
    return {
      text: `ATS Score: ${score}%`,
      cls: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    };
  if (score >= 50)
    return {
      text: `ATS Score: ${score}%`,
      cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
  return {
    text: `ATS Score: ${score}%`,
    cls: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  };
}

function ActivityIcon({ type }: { type: string }) {
  if (type === 'ats_scan')
    return (
      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
        <MagnifyingGlassIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  return (
    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
      <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    </div>
  );
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */

function ActivitySkeleton() {
  return (
    <div className="p-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-2xl animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
            <div>
              <div className="h-3.5 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
              <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          </div>
          <div className="h-6 w-28 bg-gray-200 dark:bg-gray-700 rounded-full hidden sm:block" />
        </div>
      ))}
    </div>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export default function CareerToolsHub({ navigateTo }: NavigationProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      const { data, error } = await aiApi.getCareerActivity();
      if (error || !data) {
        setHasError(true);
        return;
      }
      setActivities(data.activities ?? []);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const handleActivityClick = (item: ActivityItem) => {
    if (item.type === 'ats_scan' && item.scanId) {
      sessionStorage.setItem('pendingScanId', item.scanId);
    }
    navigateTo(Screen.ATS_CHECKER);
  };

  /* ─── Render ─────────────────────────────────────────────────────────── */

  return (
    <DashboardLayout currentScreen={Screen.CAREER_TOOLS} navigateTo={navigateTo}>
      <div className="p-6 md:p-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* ── Left Column ── */}
          <div className="lg:col-span-2">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary/10 rounded-xl">
                  <BriefcaseIcon className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Career Tools</h1>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-lg ml-[52px]">
                Build your professional profile and land your dream job.
              </p>
            </div>

            {/* Tool Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {tools.map((tool) => (
                <button
                  key={tool.label}
                  type="button"
                  onClick={() => navigateTo(tool.screen)}
                  className={`group relative p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 ${tool.hoverBorder} rounded-[2rem] cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col justify-between min-h-[220px] text-left`}
                >
                  <div className="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-indigo-100/40 to-purple-50/40 dark:from-indigo-900/20 dark:to-purple-900/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  <div
                    className={`w-14 h-14 ${tool.iconBg} rounded-2xl flex items-center justify-center ${tool.iconColor} mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm relative z-10`}
                  >
                    <tool.icon className="w-7 h-7" />
                  </div>
                  <div className="flex items-end justify-between relative z-10">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {tool.label}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-[85%] leading-relaxed">
                        {tool.description}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gray-100 dark:border-gray-700 flex items-center justify-center bg-gray-50 dark:bg-gray-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:border-indigo-200 dark:group-hover:border-indigo-700 transition-colors shrink-0">
                      <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transform group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ClockIcon className="w-5 h-5 text-gray-400" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-3xl border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                {isLoading ? (
                  <ActivitySkeleton />
                ) : hasError ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <ExclamationCircleIcon className="w-8 h-8 text-red-300" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Could not load recent activity
                    </p>
                    <button
                      type="button"
                      onClick={fetchActivity}
                      className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <ArrowPathIcon className="w-3.5 h-3.5" />
                      Retry
                    </button>
                  </div>
                ) : activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <ClockIcon className="w-7 h-7 text-gray-300 dark:text-gray-600" />
                    </div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      No activity yet
                    </p>
                    <p className="text-xs text-gray-400 max-w-xs">
                      Create your first CV or scan an existing one to get started!
                    </p>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => navigateTo(Screen.CV_BUILDER)}
                        className="text-xs font-medium px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition"
                      >
                        Build a CV
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo(Screen.ATS_CHECKER)}
                        className="text-xs font-medium px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition"
                      >
                        Scan a CV
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    {activities.map((item) => {
                      const badge = item.score !== null ? getScoreBadge(item.score) : null;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleActivityClick(item)}
                          className="group w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl transition-all cursor-pointer text-left"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <ActivityIcon type={item.type} />
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs"
                                title={item.title}
                              >
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.description} · {timeAgo(item.timestamp)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-3">
                            {badge && (
                              <span
                                className={`text-xs font-semibold px-3 py-1 rounded-full hidden sm:block ${badge.cls}`}
                              >
                                {badge.text}
                              </span>
                            )}
                            <ArrowRightIcon className="w-4 h-4 text-gray-300 dark:text-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-1 space-y-6">
            {/* Widget A: Profile Readiness */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <UserCircleIcon className="w-6 h-6 text-indigo-500" />
                Profile Readiness
              </h3>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 mb-2">
                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500 w-[65%]" />
              </div>
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-3">
                65% Complete
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5 leading-relaxed">
                Add your latest education and work experience to increase your visibility to
                employers.
              </p>
              <button
                type="button"
                onClick={() => navigateTo(Screen.PROFILE)}
                className="w-full py-2.5 rounded-xl font-medium text-sm border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-900 dark:text-white transition"
              >
                Complete Profile
              </button>
            </div>

            {/* Widget B: Quick Tip */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-100 dark:border-indigo-800/40 rounded-3xl p-6">
              <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-200 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5 text-yellow-500" />
                Quick Tip
              </h4>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 leading-relaxed mb-4">
                Did you know? Tailoring your CV to specific job descriptions using our ATS Checker
                increases your interview chances by 3x.
              </p>
              <button
                type="button"
                onClick={() => navigateTo(Screen.ATS_CHECKER)}
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Try ATS Checker &rarr;
              </button>
            </div>

            {/* Widget C: Quick Actions */}
            <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.CV_BUILDER)}
                  className="w-full flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-left"
                >
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Create New CV
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo(Screen.ATS_CHECKER)}
                  className="w-full flex items-center gap-3 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition text-left"
                >
                  <DocumentCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Scan Existing CV
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
