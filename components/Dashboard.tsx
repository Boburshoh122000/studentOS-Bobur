import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { userApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardLayout from './DashboardLayout';

export default function Dashboard({ navigateTo }: NavigationProps) {
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [firstName, setFirstName] = useState('Student');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      const dashboardRes = await userApi.getDashboard();
      if (dashboardRes.data) {
        setDashboardData(dashboardRes.data);
        // Get first name from dashboard data if available
        const name =
          dashboardRes.data.user?.profile?.fullName ||
          dashboardRes.data.user?.email?.split('@')[0] ||
          'Student';
        setFirstName(name.split(' ')[0]);
      }
    } catch (error) {
      console.error('Failed to load dashboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helpers
  const stats = dashboardData?.stats || {
    activeApplications: 0,
    atsScore: 0,
    habitsCompletedToday: 0,
    profileCompletion: 0,
  };
  const recentApps = dashboardData?.recentApplications || [];

  const headerContent = (
    <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">
          Welcome back, {firstName}!
        </h2>
        <p className="text-sm text-text-sub">Here is your daily briefing.</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
            search
          </span>
          <input
            className="pl-10 pr-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all shadow-sm dark:text-white"
            placeholder="Search tools, jobs..."
            type="text"
          />
        </div>
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  if (isLoading) {
    return (
      <DashboardLayout currentScreen={Screen.DASHBOARD} navigateTo={navigateTo}>
        <div className="flex h-full items-center justify-center">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      currentScreen={Screen.DASHBOARD}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column: Stats & Activity */}
            <div className="xl:col-span-2 space-y-6">
              {/* Active Job Applications & ATS Score */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Job Apps */}
                <div className="md:col-span-2 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        Active Job Applications
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Your current pipeline status
                      </p>
                    </div>
                    <button
                      className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
                      onClick={() => navigateTo(Screen.JOBS)}
                    >
                      View Board{' '}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30 flex flex-col justify-between h-32 relative overflow-hidden group">
                      <div className="z-10 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                            Applied
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                          {stats.activeApplications}
                        </span>
                      </div>
                      <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-blue-200 dark:text-blue-800/20 text-[80px] group-hover:scale-110 transition-transform">
                        send
                      </span>
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/30 flex flex-col justify-between h-32 relative overflow-hidden group">
                      <div className="z-10 relative">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium text-green-900 dark:text-green-200">
                            Completed Habits
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-green-700 dark:text-green-300">
                          {stats.habitsCompletedToday}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 dark:text-green-400 z-10">Today</p>
                      <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-green-200 dark:text-green-800/20 text-[80px] group-hover:scale-110 transition-transform">
                        check_circle
                      </span>
                    </div>
                  </div>
                </div>

                {/* ATS Score Widget */}
                <div className="md:col-span-1 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4 z-10">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                      Last ATS
                      <br />
                      Evaluation
                    </h3>
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                      <span className="material-symbols-outlined text-[20px]">fact_check</span>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center z-10 my-2">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-100 dark:text-gray-700"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        ></path>
                        <path
                          className="text-primary"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray={`${stats.atsScore}, 100`}
                          strokeLinecap="round"
                          strokeWidth="2.5"
                        ></path>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stats.atsScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateTo(Screen.CV_ATS)}
                    className="mt-4 w-full py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10"
                  >
                    View Details
                  </button>
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Recent Applications
                  </h3>
                  <button
                    onClick={() => navigateTo(Screen.JOBS)}
                    className="text-sm font-medium text-gray-500 hover:text-primary transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  {recentApps.length > 0 ? (
                    recentApps.map((app: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-300 flex-shrink-0`}
                          >
                            <span className="material-symbols-outlined">work</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                              {app.job.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {app.job.company} • {app.job.location}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                          Applied
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      No applications yet. Go apply!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Career Progress & Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Career Progress
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Your journey to success
                    </p>
                  </div>
                  <button
                    onClick={() => navigateTo(Screen.PROFILE)}
                    className="text-primary bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </button>
                </div>

                {/* Progress Items */}
                <div className="flex-1 space-y-4">
                  {/* Profile Completion */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-100 dark:border-purple-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-200">
                        Profile Strength
                      </span>
                      <span className="text-sm font-bold text-purple-600 dark:text-purple-300">
                        {stats.profileCompletion}%
                      </span>
                    </div>
                    <div className="w-full bg-purple-200 dark:bg-purple-800/40 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.profileCompletion}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* ATS Score Progress */}
                  <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-900 dark:text-green-200">
                        CV ATS Score
                      </span>
                      <span className="text-sm font-bold text-green-600 dark:text-green-300">
                        {stats.atsScore}%
                      </span>
                    </div>
                    <div className="w-full bg-green-200 dark:bg-green-800/40 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${stats.atsScore}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
                      Quick Actions
                    </p>
                    <button
                      onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-amber-500 text-xl">
                        emoji_events
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Find Scholarships
                        </p>
                        <p className="text-xs text-gray-500">Browse opportunities</p>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateTo(Screen.CV_ATS)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <span className="material-symbols-outlined text-blue-500 text-xl">
                        description
                      </span>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Improve Your CV
                        </p>
                        <p className="text-xs text-gray-500">Boost ATS score</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Completion Banner */}
          <div className="bg-gray-900 dark:bg-black text-white rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="relative z-10 max-w-lg">
              <h3 className="text-xl font-bold mb-2">Complete your Profile</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Your profile is {stats.profileCompletion}% complete. Add more details to increase
                visibility.
              </p>
            </div>
            <button
              className="relative z-10 px-6 py-2.5 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
              onClick={() => navigateTo(Screen.PROFILE)}
            >
              Update Profile
            </button>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
