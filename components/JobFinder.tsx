import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { jobApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';
import DashboardLayout from './DashboardLayout';

export default function JobFinder({ navigateTo }: NavigationProps) {
  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const jobsRes = await jobApi.list();
      const jobsList =
        (jobsRes.data as any)?.jobs || (Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setJobs(jobsList);
    } catch (error) {
      console.error('Failed to load jobs', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive';
    if (min && !max) return `$${(min / 1000).toFixed(0)}k+`;
    if (!min && max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return `$${(min! / 1000).toFixed(0)}k - $${(max! / 1000).toFixed(0)}k`;
  };

  // Helper for time ago (simplified)
  const timeAgo = (dateStr: string) => {
    const days = Math.floor(
      (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24)
    );
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  const headerContent = (
    <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800 w-full">
      <div className="flex flex-col justify-center">
        <h2 className="text-2xl font-bold text-text-main dark:text-white">Job Finder</h2>
        <p className="text-sm text-text-sub">Explore opportunities and track your applications</p>
      </div>
      <div className="flex items-center gap-6">
        <div className="bg-gray-100 dark:bg-card-dark p-1 rounded-lg flex items-center border border-gray-200 dark:border-gray-700">
          <button className="px-3 py-1.5 rounded-md bg-white dark:bg-gray-700 text-text-main dark:text-white shadow-sm text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">grid_view</span>
            <span className="hidden sm:inline">Board</span>
          </button>
          <button className="px-3 py-1.5 rounded-md text-text-sub hover:text-text-main dark:hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">view_list</span>
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>
        <ThemeToggle />
        <NotificationDropdown />
      </div>
    </header>
  );

  return (
    <DashboardLayout
      currentScreen={Screen.JOBS}
      navigateTo={navigateTo}
      headerContent={headerContent}
    >
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Filters Sidebar - Could be made dynamic later */}
        <aside className="w-72 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex-col overflow-y-auto hidden lg:flex">
          <div className="p-6 text-center text-gray-500 text-sm">Filters coming soon...</div>
        </aside>

        <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
          <div className="p-8 h-full">
            <div className="w-full h-full flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-text-main dark:text-white">Latest Jobs</h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {jobs.length} New
                  </span>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-20">Loading jobs...</div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                  No jobs found. Be the first to apply!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  {jobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-300`}
                        >
                          {job.company?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <button className="text-gray-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">bookmark_border</span>
                        </button>
                      </div>
                      <div className="mb-4">
                        <h4
                          className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors truncate"
                          title={job.title}
                        >
                          {job.title}
                        </h4>
                        <p className="text-sm text-text-sub truncate" title={job.company}>
                          {job.company}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6 h-16 overflow-hidden content-start">
                        <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700 max-w-[100px] truncate">
                          {job.location || 'Remote'}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">
                          {job.locationType}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">
                          {formatSalary(job.salaryMin, job.salaryMax)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                          Apply Now
                        </button>
                        <span className="text-xs text-gray-400">
                          {timeAgo(job.postedAt || new Date().toISOString())}
                        </span>
                      </div>
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
