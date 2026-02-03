
import React, { useState, useRef, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { scholarshipApi, authApi } from '../src/services/api';
import { ThemeToggle } from './ThemeToggle';
import { NotificationDropdown } from './NotificationDropdown';

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);

  // Data State
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [scholarships, setScholarships] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [authRes, scholarshipsRes] = await Promise.all([
        authApi.me(),
        scholarshipApi.list()
      ]);

      if (authRes.data) setUserData(authRes.data);
      const list = (scholarshipsRes.data as any)?.scholarships || (Array.isArray(scholarshipsRes.data) ? scholarshipsRes.data : []);
      setScholarships(list);
      
    } catch (error) {
      console.error('Failed to load scholarships', error);
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

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBA';
    return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
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
               { screen: Screen.JOBS, icon: 'work', label: 'Job Finder' },
               { screen: Screen.LEARNING_PLAN, icon: 'book_2', label: 'Learning Plan' },
               { screen: Screen.HABIT_TRACKER, icon: 'track_changes', label: 'Habit Tracker' },
               { screen: null, icon: 'emoji_events', label: 'Scholarships', active: true },
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-background-dark">
        <header className="h-16 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>school</span>
            </div>
            <span className="font-bold text-lg">StudentOS</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden bg-[#fafafa] dark:bg-background-dark">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-8">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Scholarship Finder</h1>
                    <p className="text-lg text-text-sub">Unlock funding opportunities curated for your academic journey.</p>
                  </div>
                  <div className="flex w-full md:w-auto">
                    <div className="flex shadow-sm rounded-lg overflow-hidden w-full md:w-[480px]">
                      <div className="relative flex-1 bg-white dark:bg-card-dark border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-lg hover:z-10 focus-within:z-10">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">filter_list</span>
                        <input className="w-full h-11 pl-10 pr-4 text-sm border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-white placeholder-gray-500" placeholder="Filter by keyword..." type="text" />
                      </div>
                      <button className="bg-primary hover:bg-primary/90 text-white font-medium px-8 py-2.5 rounded-r-lg transition-colors flex items-center justify-center">
                        Search
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-8">
                <aside className="w-64 flex-shrink-0 hidden lg:block space-y-6">
                  {/* Static Filters for now */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                    <button className="text-sm text-primary hover:text-primary/80">Reset all</button>
                  </div>
                  <div className="text-sm text-gray-500">Filters available in next update.</div>
                </aside>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-text-sub text-sm">Showing <span className="font-bold text-gray-900 dark:text-white">{scholarships.length}</span> scholarships</p>
                  </div>
                  
                  {isLoading ? (
                    <div className="text-center py-20">Loading scholarships...</div>
                  ) : scholarships.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No scholarships found.</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                      {scholarships.map((s: any) => (
                        <div key={s.id} className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
                          <button className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[24px]">bookmark_border</span>
                          </button>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-bold flex-shrink-0">
                              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>school</span>
                            </div>
                            <div className="overflow-hidden">
                              <h3 className="text-sm font-semibold text-primary truncate" title={s.institution}>{s.institution}</h3>
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>{s.country}</span>
                              </div>
                            </div>
                          </div>
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors truncate" title={s.title}>{s.title}</h2>
                          <div className="mb-4">
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30 truncate max-w-full">
                              <span className="material-symbols-outlined text-[14px] font-bold">monetization_on</span>
                              {s.awardAmount}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-8 content-start h-16">
                            <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">{s.studyLevel}</span>
                            <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">{s.awardType}</span>
                          </div>
                          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5 font-bold text-gray-500">
                              <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                              <span>Deadline: {formatDate(s.deadline)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
