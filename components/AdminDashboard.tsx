import { useState, useEffect, useCallback } from 'react';
import { NavigationProps } from '../types';
import { adminApi } from '../src/services/api';
import { downloadCSV } from '../src/utils/csv';
import toast from 'react-hot-toast';
import {
  ArrowDownTrayIcon,
  ArrowTrendingUpIcon,
  BriefcaseIcon,
  CalendarIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ReceiptPercentIcon,
  StopIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import UserDemographics from './UserDemographics';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalScholarships: number;
  totalJobs: number;
  totalApplications: number;
  recentTransactions: number;
  newUsersThisWeek: number;
}

interface DayGrowth {
  date: string;
  day: string;
  count: number;
}

interface AnalyticsData {
  userGrowth: DayGrowth[];
}

// ── SVG line chart from real data ───────────────────────────────────────────
function GrowthChart({ data }: { data: DayGrowth[] }) {
  const PAD = { left: 48, right: 16, top: 20, bottom: 36 };
  const W = 800;
  const H = 280;
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  // Round max up to a clean number for y-axis
  const yMax = maxCount <= 5 ? 5 : maxCount <= 10 ? 10 : Math.ceil(maxCount / 5) * 5;
  const yTicks = [0, Math.round(yMax * 0.5), yMax];

  const toX = (i: number) =>
    PAD.left + (data.length > 1 ? (i / (data.length - 1)) * chartW : chartW / 2);
  const toY = (count: number) => PAD.top + chartH - (count / yMax) * chartH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.count), ...d }));

  // Build SVG path
  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x},${PAD.top + chartH} L ${points[0].x},${PAD.top + chartH} Z`;

  const allZero = data.every((d) => d.count === 0);

  return (
    <svg className="h-full w-full" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id="growthGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2d4ee1" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#2d4ee1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y-axis grid lines + labels */}
      {yTicks.map((tick) => {
        const y = toY(tick);
        return (
          <g key={tick}>
            <line
              x1={PAD.left}
              x2={W - PAD.right}
              y1={y}
              y2={y}
              stroke="#e2e8f0"
              strokeWidth="1"
              strokeDasharray="4 4"
              className="dark:stroke-gray-700"
            />
            <text
              x={PAD.left - 6}
              y={y + 4}
              textAnchor="end"
              fontSize="11"
              fill="#94a3b8"
              className="dark:fill-slate-500"
            >
              {tick}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      {!allZero && <path d={areaPath} fill="url(#growthGradient)" />}

      {/* Line */}
      {!allZero && (
        <path d={linePath} stroke="#2d4ee1" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      )}

      {/* Data points + X labels */}
      {points.map((p, i) => (
        <g key={i}>
          {/* X-axis label */}
          <text
            x={p.x}
            y={H - 8}
            textAnchor="middle"
            fontSize="11"
            fill="#94a3b8"
            className="dark:fill-slate-500"
          >
            {p.day}
          </text>

          {/* Dot */}
          {!allZero && p.count > 0 && (
            <g>
              <circle cx={p.x} cy={p.y} r="5" fill="#2d4ee1" />
              <circle cx={p.x} cy={p.y} r="3" fill="white" />
              {/* Count label above dot */}
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                fontSize="11"
                fontWeight="600"
                fill="#2d4ee1"
              >
                {p.count}
              </text>
            </g>
          )}
        </g>
      ))}

      {/* Empty state */}
      {allZero && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fontSize="13" fill="#94a3b8">
          No signups in the last 7 days
        </text>
      )}
    </svg>
  );
}

export default function AdminDashboard({ navigateTo }: NavigationProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: apiError } = await adminApi.getStats();
      if (apiError) {
        setError(apiError);
      } else if (data) {
        setStats(data as AdminStats);
      }
    } catch {
      setError('Failed to load admin stats');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoadingChart(true);
      const { data } = await adminApi.getAnalytics();
      if (data) setAnalytics(data as AnalyticsData);
    } catch {
      // silent — chart just stays empty
    } finally {
      setIsLoadingChart(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchAnalytics();
  }, [fetchStats, fetchAnalytics]);

  const handleExport = async () => {
    toast.loading('Generating report...', { id: 'export' });
    try {
      const { data } = await adminApi.getUsers({ limit: 1000 });
      if (data && (data as any).users) {
        const csvData = (data as any).users.map((u: any) => ({
          ID: u.id,
          Email: u.email,
          Role: u.role,
          Name: u.studentProfile?.fullName || u.employerProfile?.companyName || 'N/A',
          Status: u.isActive ? 'Active' : 'Inactive',
          Joined: new Date(u.createdAt).toLocaleDateString(),
        }));
        downloadCSV(csvData, `users_report_${new Date().toISOString().split('T')[0]}.csv`);
        toast.success('Report downloaded!', { id: 'export' });
      } else {
        toast.error('No data to export', { id: 'export' });
      }
    } catch {
      toast.error('Failed to export report', { id: 'export' });
    }
  };

  return (
    <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h2>
            <p className="text-base text-slate-500 dark:text-slate-400">
              Real-time overview of platform analytics and user activity
            </p>
          </div>
          <button
            onClick={handleExport}
            type="button"
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
          >
            <ArrowDownTrayIcon className="w-[18px] h-[18px]" />
            <span>Export Report</span>
          </button>
        </header>

        {/* ── Stat Cards ── */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm animate-pulse"
                >
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-4 flex flex-col items-center justify-center py-8 text-center">
              <ExclamationCircleIcon className="w-9 h-9 text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
                type="button"
                onClick={fetchStats}
                className="mt-2 text-primary hover:underline text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Users
                  </p>
                  <UsersIcon className="w-5 h-5 text-primary/60 dark:text-primary-dark/60" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalUsers?.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <ArrowTrendingUpIcon className="w-5 h-5" />
                  <span>+{stats?.newUsersThisWeek || 0}</span>
                  <span className="font-normal text-slate-500 dark:text-slate-400 ml-1">
                    this week
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Active Now
                  </p>
                  <StopIcon className="w-5 h-5 text-emerald-500/80" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.activeUsers?.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <ClockIcon className="w-5 h-5" />
                  <span>in last 24 hours</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Active Subscriptions
                  </p>
                  <ReceiptPercentIcon className="w-5 h-5 text-orange-500/80" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.recentTransactions || 0}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                  <CheckBadgeIcon className="w-5 h-5" />
                  <span>Active</span>
                </div>
              </div>
              <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Jobs
                  </p>
                  <BriefcaseIcon className="w-5 h-5 text-primary/60 dark:text-primary-dark/60" />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                  {stats?.totalJobs?.toLocaleString() || 0}
                </p>
                <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <span>{stats?.totalApplications || 0} applications</span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* ── Chart + Demographics ── */}
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  User Growth & Active Trends
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  New signups per day — last 7 days
                </p>
              </div>
              {analytics && (
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-block w-3 h-3 rounded-full bg-[#2d4ee1]" />
                  New signups
                </div>
              )}
            </div>

            <div className="h-[280px] w-full">
              {isLoadingChart ? (
                <div className="flex h-full items-center justify-center">
                  <div className="animate-pulse flex flex-col items-center gap-3 w-full">
                    <div className="h-[200px] w-full bg-slate-100 dark:bg-slate-800 rounded-lg" />
                    <div className="flex justify-between w-full px-4">
                      {[...Array(7)].map((_, i) => (
                        <div key={i} className="h-3 w-8 bg-slate-100 dark:bg-slate-800 rounded" />
                      ))}
                    </div>
                  </div>
                </div>
              ) : analytics?.userGrowth ? (
                <GrowthChart data={analytics.userGrowth} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400 dark:text-slate-500">
                  <div className="text-center">
                    <CalendarIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>Could not load chart data</p>
                    <button
                      type="button"
                      onClick={fetchAnalytics}
                      className="mt-2 text-primary hover:underline text-xs font-medium"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <UserDemographics />
        </section>
      </div>
    </main>
  );
}
