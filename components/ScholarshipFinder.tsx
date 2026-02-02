
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

export default function ScholarshipFinder({ navigateTo }: NavigationProps) {
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
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-white dark:bg-background-dark">
        <header className="h-16 px-6 flex items-center justify-between flex-shrink-0 bg-white dark:bg-background-dark border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>school</span>
            </div>
            <span className="font-bold text-lg">StudentOS</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
              <input className="pl-10 pr-4 py-1.5 rounded bg-gray-50 dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary w-full transition-all" placeholder="Search..." type="text" />
            </div>
            <button className="relative p-1.5 rounded-full text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>notifications</span>
              <span className="absolute top-1.5 right-1.5 size-2 bg-black rounded-full border border-white dark:border-card-dark"></span>
            </button>
            <button className="relative p-1.5 rounded-full text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>help</span>
            </button>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <div className="size-8 rounded-full bg-orange-200 bg-cover bg-center border border-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
            </button>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden bg-[#fafafa] dark:bg-background-dark">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1400px] mx-auto p-8">
              <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Scholarship Finder</h1>
                    <p className="text-lg text-text-sub">Unlock over <span className="font-bold text-primary">$50M</span> in funding opportunities curated for your academic journey.</p>
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
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filters</h3>
                    <button className="text-sm text-primary hover:text-primary/80">Reset all</button>
                  </div>
                  <div className="space-y-6">
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
                      <button className="flex items-center justify-between w-full mb-3 group">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Destination Country</h4>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-sm transform rotate-180">expand_more</span>
                      </button>
                      <div className="space-y-2.5">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input defaultChecked className="rounded border-gray-300 text-primary focus:ring-primary/25 size-4.5" type="checkbox" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">United States</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input className="rounded border-gray-300 text-primary focus:ring-primary/25 size-4.5" type="checkbox" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">United Kingdom</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input className="rounded border-gray-300 text-primary focus:ring-primary/25 size-4.5" type="checkbox" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Canada</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input className="rounded border-gray-300 text-primary focus:ring-primary/25 size-4.5" type="checkbox" />
                          <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Germany</span>
                        </label>
                      </div>
                    </div>
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
                      <button className="flex items-center justify-between w-full group">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Study Level</h4>
                        <span className="material-symbols-outlined text-gray-400 group-hover:text-primary text-sm">expand_more</span>
                      </button>
                    </div>
                    <div className="border-b border-gray-100 dark:border-gray-800 pb-5">
                      <button className="flex items-center justify-between w-full mb-4 group">
                        <h4 className="font-semibold text-gray-900 dark:text-white">Award Amount</h4>
                      </button>
                      <div className="px-1">
                        <div className="relative h-1 bg-gray-200 dark:bg-gray-700 rounded-full mb-6">
                          <div className="absolute top-0 h-1 bg-primary rounded-full" style={{ left: '10%', right: '30%' }}></div>
                          <div className="absolute top-1/2 -mt-2.5 size-5 bg-white border-2 border-primary rounded-full shadow cursor-pointer transform -translate-y-px" style={{ left: '10%' }}></div>
                          <div className="absolute top-1/2 -mt-2.5 size-5 bg-white border-2 border-primary rounded-full shadow cursor-pointer transform -translate-y-px" style={{ right: '30%' }}></div>
                          <div className="absolute -top-8 left-[10%] -translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity">$5k</div>
                          <div className="absolute -top-8 right-[30%] translate-x-1/2 bg-gray-900 text-white text-[10px] py-0.5 px-1.5 rounded font-medium opacity-0 group-hover:opacity-100 transition-opacity">$25k</div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                          <span>$1,000</span>
                          <span>$50,000+</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-primary rounded-xl p-5 text-white relative overflow-hidden mt-8 shadow-lg shadow-primary/30">
                    <div className="relative z-10">
                      <p className="text-sm text-blue-100 mb-1 font-medium">Need essay help?</p>
                      <h4 className="text-lg font-bold mb-4 leading-tight">Review your application with AI</h4>
                      <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/40 text-white py-2 rounded-lg text-sm font-semibold transition-colors">
                        Try Essay Review
                      </button>
                    </div>
                    <div className="absolute -top-10 -right-10 size-32 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-10 -left-10 size-24 bg-blue-500/20 rounded-full blur-xl"></div>
                  </div>
                </aside>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-text-sub text-sm">Showing <span className="font-bold text-gray-900 dark:text-white">142</span> scholarships</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-text-sub">Sort by:</span>
                      <div className="relative group cursor-pointer">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-900 dark:text-white">
                          Deadline: Soonest
                          <span className="material-symbols-outlined text-gray-400 text-lg">expand_more</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
                    <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
                      <button className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">bookmark</span>
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-[#1e3c2f] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>school</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-primary">Stanford University</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                            <span>USA</span>
                          </div>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">Knight-Hennessy Scholar</h2>
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30">
                          <span className="material-symbols-outlined text-[14px] font-bold">monetization_on</span>
                          Full Tuition + Stipend
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Postgraduate</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Global Leadership</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Any Field</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-red-600 font-bold">
                          <span className="material-symbols-outlined text-[16px]">timer</span>
                          <span>Ends in 3 days</span>
                        </div>
                        <span className="text-gray-400">Oct 12, 2023</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
                      <button className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">bookmark</span>
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          <span className="font-display font-bold">G</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-primary">Google</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                            <span>International</span>
                          </div>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">Women Techmakers</h2>
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30">
                          <span className="material-symbols-outlined text-[14px] font-bold">payments</span>
                          $10,000 Award
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Undergraduate</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Computer Science</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Women in Tech</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                          <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
                          <span>1 week left</span>
                        </div>
                        <span className="text-gray-400">Oct 18, 2023</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
                      <button className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">bookmark</span>
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-[#002147] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_balance</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-primary">Rhodes Trust</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                            <span>UK</span>
                          </div>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">Rhodes Scholarship</h2>
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-900/30">
                          <span className="material-symbols-outlined text-[14px] font-bold">monetization_on</span>
                          Full Funding
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Postgraduate</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Oxford</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Merit Based</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-green-600 font-bold">
                          <span className="material-symbols-outlined text-[16px]">event_upcoming</span>
                          <span>Opens in Nov</span>
                        </div>
                        <span className="text-primary font-medium">TBA</span>
                      </div>
                    </div>
                    <div className="bg-white dark:bg-card-dark rounded-xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col h-full group relative">
                      <button className="absolute top-5 right-5 text-gray-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[24px]">bookmark</span>
                      </button>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="size-10 rounded-full bg-black flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                          <span className="font-display">A</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-primary">Adobe</h3>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <span className="material-symbols-outlined text-green-500 text-[14px]">check_circle</span>
                            <span>Remote</span>
                          </div>
                        </div>
                      </div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary transition-colors">Adobe Research Fellowship</h2>
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full border border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30">
                          <span className="material-symbols-outlined text-[14px] font-bold">payments</span>
                          $10,000 + Mentorship
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-8">
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Postgraduate</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Computer Science</span>
                        <span className="bg-gray-100 text-gray-600 text-[11px] font-medium px-2 py-1 rounded dark:bg-gray-800 dark:text-gray-400">Creative Tech</span>
                      </div>
                      <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-orange-600 font-bold">
                          <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
                          <span>2 weeks left</span>
                        </div>
                        <span className="text-gray-400">Oct 25, 2023</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
