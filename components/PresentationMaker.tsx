
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

export default function PresentationMaker({ navigateTo }: NavigationProps) {
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
      {/* Spacer */}
      <div className={`${isSidebarLocked ? 'w-64' : 'w-20'} hidden md:block flex-shrink-0 transition-all duration-300 ease-in-out`} />

      {/* Sidebar */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 absolute top-0 left-0 h-full z-50 shadow-xl`}
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
               { screen: Screen.SCHOLARSHIPS, icon: 'emoji_events', label: 'Scholarships' },
               { screen: null, icon: 'co_present', label: 'Presentation Maker', active: true },
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
        <header className="h-16 px-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark z-20">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">Presentation Maker</span>
                <span className="material-symbols-outlined text-gray-400 text-sm">chevron_right</span>
                <input className="bg-transparent border-none p-0 text-sm font-bold text-text-main dark:text-white focus:ring-0 w-64 hover:bg-gray-50 rounded px-1 transition-colors" type="text" defaultValue="Modern Marketing Strategy" />
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wide">Saved</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mr-2">
              <button className="px-3 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-card-dark shadow-sm text-text-main dark:text-white transition-all">Editor</button>
              <button className="px-3 py-1.5 rounded-md text-sm font-medium text-text-sub hover:text-text-main transition-all">Design</button>
              <button className="px-3 py-1.5 rounded-md text-sm font-medium text-text-sub hover:text-text-main transition-all">Prototype</button>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium transition-all shadow-md shadow-indigo-200 dark:shadow-none">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              AI Generate
            </button>
            <div className="relative group">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg text-sm font-medium text-text-main dark:text-white transition-all">
                <span className="material-symbols-outlined text-[18px]">download</span>
                Download PPTX/PDF
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ml-2 border border-gray-200" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
          </div>
        </header>
        <div className="flex-1 flex overflow-hidden">
          <div className="w-60 bg-gray-50 dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-card-dark">
              <span className="text-xs font-bold text-text-sub uppercase tracking-wider">Slides</span>
              <button className="size-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-text-sub transition-colors">
                <span className="material-symbols-outlined text-[18px]">add</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="group relative flex gap-3">
                <div className="w-6 flex flex-col items-center pt-1 gap-1">
                  <span className="text-xs font-semibold text-primary">1</span>
                </div>
                <div className="flex-1 cursor-pointer">
                  <div className="aspect-video bg-white dark:bg-gray-800 rounded border-2 border-primary shadow-sm p-2 flex flex-col gap-1 overflow-hidden">
                    <div className="h-2 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="flex-1 flex gap-1">
                      <div className="w-1/2 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group relative flex gap-3">
                <div className="w-6 flex flex-col items-center pt-1 gap-1">
                  <span className="text-xs font-semibold text-text-sub group-hover:text-text-main">2</span>
                </div>
                <div className="flex-1 cursor-pointer">
                  <div className="aspect-video bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm p-2 flex flex-col gap-1 overflow-hidden transition-colors">
                    <div className="h-2 w-1/2 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      <div className="h-8 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                      <div className="h-8 bg-gray-100 dark:bg-gray-700/50 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="group relative flex gap-3">
                <div className="w-6 flex flex-col items-center pt-1 gap-1">
                  <span className="text-xs font-semibold text-text-sub group-hover:text-text-main">3</span>
                </div>
                <div className="flex-1 cursor-pointer">
                  <div className="aspect-video bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm p-2 flex flex-col justify-center items-center overflow-hidden transition-colors">
                    <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-1"></div>
                    <div className="h-1.5 w-16 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col relative bg-gray-100 dark:bg-background-dark/50">
            <div className="h-12 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 mr-1">
                  <span className="text-xs font-medium text-text-sub uppercase mr-1">Language:</span>
                  <select className="bg-gray-50 dark:bg-gray-800 border-none text-sm font-medium rounded py-1 pl-2 pr-8 focus:ring-1 focus:ring-primary">
                    <option>English (US)</option>
                    <option>Uzbek</option>
                    <option>Russian</option>
                  </select>
                </div>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-text-sub hover:text-text-main transition-colors" title="Add Text">
                  <span className="material-symbols-outlined text-[20px]">title</span>
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-text-sub hover:text-text-main transition-colors" title="Add Image">
                  <span className="material-symbols-outlined text-[20px]">image</span>
                </button>
                <button className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-text-sub hover:text-text-main transition-colors" title="Add Shape">
                  <span className="material-symbols-outlined text-[20px]">category</span>
                </button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded p-0.5">
                  <button className="p-1 rounded hover:bg-white dark:hover:bg-card-dark shadow-sm text-text-main dark:text-white" title="Fit">
                    <span className="material-symbols-outlined text-[18px]">fit_screen</span>
                  </button>
                  <button className="p-1 rounded hover:bg-white dark:hover:bg-card-dark hover:shadow-sm text-text-sub hover:text-text-main" title="Zoom Out">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="text-xs font-medium px-2">85%</span>
                  <button className="p-1 rounded hover:bg-white dark:hover:bg-card-dark hover:shadow-sm text-text-sub hover:text-text-main" title="Zoom In">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-xs font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  Present
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:[background-image:none]">
              <div className="w-full max-w-5xl aspect-video bg-white dark:bg-card-dark shadow-2xl rounded-sm p-12 relative group selection:bg-primary/20">
                <div className="h-full flex flex-col justify-center max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-full text-xs font-semibold mb-6 w-fit">
                    <span className="material-symbols-outlined text-[16px]">school</span>
                    StudentOS Annual Report
                  </div>
                  <h1 className="text-6xl font-extrabold text-text-main dark:text-white leading-tight mb-6 tracking-tight">
                    The Future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">AI in Education</span>
                  </h1>
                  <p className="text-xl text-text-sub leading-relaxed max-w-lg mb-8">
                    Discover how artificial intelligence is transforming the learning landscape for students worldwide in 2024.
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      <div className="size-10 rounded-full border-2 border-white dark:border-card-dark bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
                      <div className="size-10 rounded-full border-2 border-white dark:border-card-dark bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">+3</div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text-main dark:text-white">Curated by the AI Research Team</span>
                      <span className="text-xs text-text-sub">Last updated 2 hours ago</span>
                    </div>
                  </div>
                </div>
                <div className="absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l from-blue-50/50 to-transparent dark:from-blue-900/10 pointer-events-none"></div>
                <div className="absolute -right-12 top-1/2 -translate-y-1/2 size-96 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-12 right-12 size-64 bg-purple-100 dark:bg-purple-900/20 rounded-2xl rotate-3 opacity-50"></div>
                <div className="absolute bottom-16 right-16 size-64 bg-white dark:bg-card-dark rounded-2xl shadow-lg border border-gray-100 dark:border-gray-800 p-6 flex flex-col justify-between transform transition-transform hover:-translate-y-2 duration-500">
                  <div className="flex justify-between items-start">
                    <div className="size-10 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <span className="material-symbols-outlined">analytics</span>
                    </div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">+24%</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-text-main dark:text-white mb-1">2.4M</div>
                    <div className="text-sm text-text-sub">Active Students</div>
                  </div>
                  <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-orange-500 rounded-full"></div>
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
