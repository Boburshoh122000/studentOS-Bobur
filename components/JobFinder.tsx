
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

export default function JobFinder({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const hoverTimeoutRef = useRef<any>(null);

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
          <button className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main transition-colors group relative`} title="Settings">
            <span className="material-symbols-outlined group-hover:text-gray-600 dark:group-hover:text-gray-300 text-[20px]">settings</span>
            {isSidebarExpanded && <span className="text-sm font-medium">Settings</span>}
          </button>
          
          <div className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2 w-full' : 'justify-center size-10'} rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer`}>
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0" data-alt="User profile picture placeholder" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">Alex Morgan</span>
                <span className="text-xs text-text-sub truncate">alex@student.edu</span>
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
            <button className="relative p-2 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-card-dark"></span>
            </button>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
              <span className="material-symbols-outlined text-gray-400">expand_more</span>
            </button>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-72 bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex-col overflow-y-auto hidden lg:flex">
            <div className="p-6 space-y-8">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-text-main dark:text-white">Filters</h3>
                  <button className="text-xs font-medium text-primary hover:text-primary/80">Reset All</button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                  <input className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="Search keywords..." type="text" />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-main dark:text-white mb-3">Job Role</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input defaultChecked className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/25 size-4 bg-transparent" type="checkbox" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">Product Designer</span>
                    <span className="ml-auto text-xs text-gray-400">12</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/25 size-4 bg-transparent" type="checkbox" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">Frontend Developer</span>
                    <span className="ml-auto text-xs text-gray-400">8</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/25 size-4 bg-transparent" type="checkbox" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">UX Researcher</span>
                    <span className="ml-auto text-xs text-gray-400">5</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/25 size-4 bg-transparent" type="checkbox" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">Data Scientist</span>
                    <span className="ml-auto text-xs text-gray-400">14</span>
                  </label>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-main dark:text-white mb-3">Salary Range</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-text-sub">
                    <span>$30k</span>
                    <span>$200k+</span>
                  </div>
                  <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="absolute left-1/4 right-1/4 h-full bg-primary rounded-full"></div>
                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-primary rounded-full shadow cursor-pointer hover:scale-110 transition-transform"></div>
                    <div className="absolute right-1/4 top-1/2 -translate-y-1/2 size-4 bg-white border-2 border-primary rounded-full shadow cursor-pointer hover:scale-110 transition-transform"></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-text-main dark:text-white w-full text-center">$60k</div>
                    <span className="text-gray-400">-</span>
                    <div className="px-3 py-1.5 rounded bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-medium text-text-main dark:text-white w-full text-center">$140k</div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-main dark:text-white mb-3">Location</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input defaultChecked className="text-primary focus:ring-primary/25 size-4 border-gray-300 dark:border-gray-600 bg-transparent" name="location" type="radio" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">Anywhere</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="text-primary focus:ring-primary/25 size-4 border-gray-300 dark:border-gray-600 bg-transparent" name="location" type="radio" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">Remote Only</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input className="text-primary focus:ring-primary/25 size-4 border-gray-300 dark:border-gray-600 bg-transparent" name="location" type="radio" />
                    <span className="text-sm text-text-sub group-hover:text-text-main dark:group-hover:text-white transition-colors">Hybrid</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>
          <div className="flex-1 overflow-y-auto bg-background-light dark:bg-background-dark">
            <div className="p-8 h-full">
              <div className="w-full h-full flex flex-col">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-text-main dark:text-white">Suggested for you</h3>
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">12 New</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-text-sub">Sort by:</span>
                    <select className="form-select text-sm border-none bg-transparent py-0 pl-0 pr-8 font-semibold text-text-main dark:text-white focus:ring-0 cursor-pointer">
                      <option>Recommended</option>
                      <option>Newest</option>
                      <option>Salary (High to Low)</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-gray-900 flex items-center justify-center text-white text-xl font-bold">
                        <span className="material-symbols-outlined">all_inclusive</span>
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined icon-filled text-primary">bookmark</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">Senior Product Designer</h4>
                      <p className="text-sm text-text-sub">Meta Platforms Inc.</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Remote</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Full-time</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">$140k - $180k</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-green-500 text-[18px]">check_circle</span>
                        <span className="text-xs font-medium text-green-600 dark:text-green-400">Applied 2d ago</span>
                      </div>
                      <span className="text-xs text-gray-400">Posted 5d ago</span>
                    </div>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
                        S
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">bookmark</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">UX Engineer</h4>
                      <p className="text-sm text-text-sub">Stripe</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Hybrid</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Junior</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">$90k - $120k</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Apply Now</button>
                      <span className="text-xs text-gray-400">Posted 1d ago</span>
                    </div>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-xl font-bold">
                        <span className="material-symbols-outlined text-red-500">play_arrow</span>
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">bookmark</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">Frontend Developer</h4>
                      <p className="text-sm text-text-sub">Netflix</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Remote</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Contract</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Apply Now</button>
                      <span className="text-xs text-gray-400">Posted 3h ago</span>
                    </div>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                        D
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">bookmark</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">Design System Lead</h4>
                      <p className="text-sm text-text-sub">Discord</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">San Francisco</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">$180k+</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Apply Now</button>
                      <span className="text-xs text-gray-400">Posted 1w ago</span>
                    </div>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-green-500 flex items-center justify-center text-white text-xl font-bold">
                        S
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined icon-filled text-primary">bookmark</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">Product Manager</h4>
                      <p className="text-sm text-text-sub">Spotify</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Stockholm</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Mid-Level</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                        <span className="material-symbols-outlined text-gray-500 text-[16px] icon-filled">bookmark</span>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Saved</span>
                      </div>
                      <span className="text-xs text-gray-400">Posted 2d ago</span>
                    </div>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group relative">
                    <div className="flex justify-between items-start mb-4">
                      <div className="size-12 rounded-lg bg-orange-500 flex items-center justify-center text-white text-xl font-bold">
                        <span className="material-symbols-outlined">hub</span>
                      </div>
                      <button className="text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">bookmark</span>
                      </button>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-bold text-lg text-text-main dark:text-white group-hover:text-primary transition-colors">Marketing Intern</h4>
                      <p className="text-sm text-text-sub">HubSpot</p>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Remote</span>
                      <span className="px-2.5 py-1 rounded-md bg-gray-50 dark:bg-gray-800 text-xs font-medium text-text-sub border border-gray-100 dark:border-gray-700">Internship</span>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
                      <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">Apply Now</button>
                      <span className="text-xs text-gray-400">Posted 4h ago</span>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex justify-center pb-8">
                  <button className="px-6 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-card-dark text-text-sub hover:text-text-main dark:hover:text-white transition-colors text-sm font-medium shadow-sm hover:shadow">
                    Load more jobs
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
