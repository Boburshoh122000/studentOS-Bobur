import { useState, useEffect } from 'react';
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

export default function AdminDashboard({ navigateTo }: NavigationProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: apiError } = await adminApi.getStats();
      if (apiError) {
        setError(apiError);
      } else if (data) {
        setStats(data as AdminStats);
      }
    } catch (err) {
      setError('Failed to load admin stats');
    } finally {
      setIsLoading(false);
    }
  };

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
    } catch (err) {
      toast.error('Failed to export report', { id: 'export' });
    }
  };

  const handleDateFilter = () => {
    toast('Date filtering coming soon!', { icon: '📅' });
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
          <div className="flex gap-3">
            <button
              onClick={handleDateFilter}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-4 py-2 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <CalendarIcon className="w-[18px] h-[18px]" />
              <span>Oct 24 - Nov 24</span>
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30"
            >
              <ArrowDownTrayIcon className="w-[18px] h-[18px]" />
              <span>Export Report</span>
            </button>
          </div>
        </header>
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm animate-pulse"
                >
                  <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
                  <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mt-2"></div>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-span-4 flex flex-col items-center justify-center py-8 text-center">
              <ExclamationCircleIcon className="w-9 h-9 text-red-400" />
              <p className="text-red-600 dark:text-red-400">{error}</p>
              <button
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
                <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <ClockIcon className="w-5 h-5" />
                  <span className="font-normal text-slate-500 dark:text-slate-400">
                    in last 24 hours
                  </span>
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
        <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  User Growth & Active Trends
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Comparing new signups vs daily active users
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-1">
                <button className="rounded-md bg-white dark:bg-white/10 px-3 py-1 text-xs font-bold shadow-sm text-slate-900 dark:text-white">
                  Weekly
                </button>
                <button className="rounded-md px-3 py-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5">
                  Monthly
                </button>
              </div>
            </div>
            <div className="h-[300px] w-full relative">
              <svg className="h-full w-full" preserveAspectRatio="none" viewBox="0 0 800 300">
                <defs>
                  <linearGradient id="growthGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#2d4ee1" stopOpacity="0.15"></stop>
                    <stop offset="100%" stopColor="#2d4ee1" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <line
                  className="dark:stroke-gray-700"
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="800"
                  y1="250"
                  y2="250"
                ></line>
                <line
                  className="dark:stroke-gray-700"
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="800"
                  y1="150"
                  y2="150"
                ></line>
                <line
                  className="dark:stroke-gray-700"
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  x1="0"
                  x2="800"
                  y1="50"
                  y2="50"
                ></line>
                <path
                  d="M0,250 C100,240 150,200 200,180 C250,160 300,190 350,150 C400,110 450,130 500,100 C550,70 600,90 650,60 C700,30 750,50 800,40 V300 H0 Z"
                  fill="url(#growthGradient)"
                ></path>
                <path
                  d="M0,250 C100,240 150,200 200,180 C250,160 300,190 350,150 C400,110 450,130 500,100 C550,70 600,90 650,60 C700,30 750,50 800,40"
                  stroke="#2d4ee1"
                  strokeWidth="3"
                  fill="none"
                ></path>
              </svg>
            </div>
          </div>
          <UserDemographics />
        </section>
      </div>
    </main>
  );
}
