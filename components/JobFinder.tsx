
import React, { useState, useRef, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { jobApi, authApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';

export default function JobFinder({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [authRes, jobsRes] = await Promise.all([
        authApi.me(),
        jobApi.list()
      ]);

      if (authRes.data) setUserData(authRes.data);
      // jobsRes.data might be { jobs: [], meta: {} } or just [] depending on API. 
      // Checking api.ts, it returns whatever api.get returns. 
      // Usually list returns array or object with data. 
      // Based on schema, let's assume it returns { jobs: [...] } or just [...].
      // For now, I'll log it if I could, but safe access:
      const jobsList = (jobsRes.data as any)?.jobs || (Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setJobs(jobsList);
      
    } catch (error) {
      console.error('Failed to load jobs', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(true);
    }, 120);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false);
    }, 320);
  };

  const isSidebarExpanded = isSidebarLocked || isSidebarHovered;
  const fullName = userData?.profile?.fullName || userData?.email?.split('@')[0] || 'Student';
  const email = userData?.email || '';

  // Helper to format salary
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Competitive';
    if (min && !max) return `$${(min/1000).toFixed(0)}k+`;
    if (!min && max) return `Up to $${(max/1000).toFixed(0)}k`;
    return `$${(min!/1000).toFixed(0)}k - $${(max!/1000).toFixed(0)}k`;
  };

  // Helper for time ago (simplified)
  const timeAgo = (dateStr: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 3600 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  };

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden relative">
      
      {/* Sidebar */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 z-20 relative`}
      >
        <button 
          onClick={() => setIsSidebarLocked(!isSidebarLocked)}
          className={`absolute -right-3 top-10 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6 ${isSidebarLocked ? 'text-primary border-primary' : ''}`}
        >
          <span className="material-symbols-outlined text-[14px]">{isSidebarLocked ? 'chevron_left' : 'chevron_right'}</span>
        </button>

        <div className={`flex flex-col ${isSidebarExpanded ? 'items-start px-4' : 'items-center'} gap-8 w-full transition-all duration-300`}>
          <div className={`flex items-center gap-3 w-full ${isSidebarExpanded ? 'justify-start' : 'justify-center'}`} onClick={() => navigateTo(Screen.LANDING)}>
            <div className="size-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer group hover:scale-105 transition-transform flex-shrink-0">
              <span className="material-symbols-outlined text-white" style={{ fontSize: '24px' }}>school</span>
            </div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
              <h1 className="text-lg font-bold leading-none tracking-tight whitespace-nowrap">StudentOS</h1>
              <p className="text-xs text-text-sub font-medium mt-1 whitespace-nowrap">Pro Plan</p>
            </div>
          </div>
          
          <nav className={`flex flex-col ${isSidebarExpanded ? 'items-stretch' : 'items-center'} space-y-2 w-full`}>
             {[
               { screen: Screen.DASHBOARD, icon: 'dashboard', label: 'Dashboard' },
               { screen: Screen.CV_ATS, icon: 'description', label: 'CV and ATS' },
               { screen: Screen.COVER_LETTER, icon: 'edit_document', label: 'Cover Letter' },
               { screen: Screen.JOBS, icon: 'work', label: 'Job Finder', active: true },
               { screen: Screen.LEARNING_PLAN, icon: 'book_2', label: 'Learning Plan' },
               { screen: Screen.HABIT_TRACKER, icon: 'track_changes', label: 'Habit Tracker' },
               { screen: Screen.SCHOLARSHIPS, icon: 'emoji_events', label: 'Scholarships' },
               { screen: Screen.PRESENTATION, icon: 'co_present', label: 'Presentation Maker' },
               { screen: Screen.PLAGIARISM, icon: 'plagiarism', label: 'Plagiarism Checker' },
             ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => item.screen && navigateTo(item.screen)}
                  className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${item.active ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main'}`}
                  title={!isSidebarExpanded ? item.label : ''}
                >
                  <span className={`material-symbols-outlined ${item.active ? 'icon-filled' : 'group-hover:text-primary'} ${!isSidebarExpanded ? 'text-2xl' : 'text-[20px]'}`}>
                    {item.icon}
                  </span>
                  {isSidebarExpanded && (
                    <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                  )}
                  {!isSidebarExpanded && (
                    <span className="absolute left-14 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.label}
                    </span>
                  )}
                </button>
             ))}
          </nav>
        </div>

        <div className={`flex flex-col ${isSidebarExpanded ? 'items-stretch px-4' : 'items-center px-2'} space-y-2 w-full mt-auto`}>
          <div 
            onClick={() => navigateTo(Screen.PROFILE)}
            className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2 w-full' : 'justify-center size-10'} rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer`}
          >
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0" style={{ backgroundImage: "url('https://ui-avatars.com/api/?name=" + fullName + "&background=random')" }}></div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">{fullName}</span>
                <span className="text-xs text-text-sub truncate">{email}</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
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
        <div className="flex flex-1 overflow-hidden">
          {/* Filters Sidebar - Could be made dynamic later */}
          <aside className="w-72 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex-col overflow-y-auto hidden lg:flex">
             <div className="p-6 text-center text-gray-500 text-sm">
               Filters coming soon...
             </div>
          </aside>

          <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            <div className="p-8 h-full">
              <div className="w-full h-full flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text-main dark:text-white">Latest Jobs</h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{jobs.length} New</span>
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
                      <div key={job.id} className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`size-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-700 dark:text-gray-300`}>
                            {job.company?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <button className="text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">bookmark_border</span>
                          </button>
                        </div>
                        <div className="mb-4">
                          <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors truncate" title={job.title}>{job.title}</h4>
                          <p className="text-sm text-text-sub truncate" title={job.company}>{job.company}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6 h-16 overflow-hidden content-start">
                          <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700 max-w-[100px] truncate">{job.location || 'Remote'}</span>
                          <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">{job.locationType}</span>
                          <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">{formatSalary(job.salaryMin, job.salaryMax)}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                          <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Apply Now</button>
                          <span className="text-xs text-gray-400">{timeAgo(job.postedAt || new Date().toISOString())}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
