
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

export default function PlagiarismChecker({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeTab, setActiveTab] = useState('text'); // text, file, url
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

  // Sidebar is expanded if locked OR hovered
  const isSidebarExpanded = isSidebarLocked || isSidebarHovered;

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden relative">
      
      {/* Actual Sidebar (Floating/Fixed position to expand over content on hover) */}
      <aside 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 z-20 flex-shrink-0 relative`}
      >
        {/* Toggle Button (Lock/Unlock) */}
        <button 
          onClick={() => setIsSidebarLocked(!isSidebarLocked)}
          className={`absolute -right-3 top-10 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6 ${isSidebarLocked ? 'text-primary border-primary' : ''}`}
          title={isSidebarLocked ? "Unlock Sidebar" : "Lock Sidebar Open"}
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
               { screen: Screen.PRESENTATION, icon: 'co_present', label: 'Presentation Maker' },
               { screen: Screen.PLAGIARISM, icon: 'plagiarism', label: 'Plagiarism Checker', active: true },
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
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-background-light dark:bg-background-dark">
        {/* Header */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-card-light/80 dark:bg-card-dark/80 backdrop-blur-sm px-8 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-text-main dark:text-white tracking-tight">Plagiarism & AI Checker</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">Pro Plan</span>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex items-center">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-white dark:bg-gray-700 text-primary shadow-sm transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">find_in_page</span>
              Scanner
            </button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-text-sub dark:text-gray-400 hover:text-text-main dark:hover:text-gray-200 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">history</span>
              Previous Scans
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-text-sub hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg">
              <span className="material-symbols-outlined text-[18px]">folder_open</span>
              My Reports
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="max-w-5xl mx-auto flex flex-col gap-8 pb-10">
            {/* Input Section */}
            <section className="bg-card-light dark:bg-card-dark rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col overflow-hidden">
              <div className="flex border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <button 
                  onClick={() => setActiveTab('text')}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'text' ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800/50' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
                >
                  Text Input
                </button>
                <button 
                  onClick={() => setActiveTab('file')}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'file' ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800/50' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
                >
                  File Upload
                </button>
                <button 
                  onClick={() => setActiveTab('url')}
                  className={`px-6 py-3 text-sm font-medium ${activeTab === 'url' ? 'text-primary border-b-2 border-primary bg-white dark:bg-gray-800/50' : 'text-text-sub hover:text-text-main dark:hover:text-white'}`}
                >
                  URL Check
                </button>
              </div>
              <div className="p-6">
                <textarea 
                  className="w-full h-40 bg-transparent border-0 focus:ring-0 resize-none text-text-main dark:text-gray-300 placeholder:text-gray-400 text-sm leading-relaxed p-0 focus:outline-none" 
                  placeholder="Paste your essay, article, or research paper here to check for plagiarism and AI-generated content..."
                ></textarea>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-xs text-text-sub">
                    <span className="material-symbols-outlined text-sm">text_fields</span>
                    <span>1,240 words</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="text-sm font-medium text-text-sub hover:text-primary transition-colors flex items-center gap-1">
                      <span className="material-symbols-outlined text-lg">upload_file</span>
                      Upload File
                    </button>
                    <button className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg font-medium shadow-lg shadow-primary/20 flex items-center gap-2 transition-all">
                      <span className="material-symbols-outlined">search_check</span>
                      Check Content
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Originality Score */}
              <div className="bg-card-light dark:bg-card-dark rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col items-center justify-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                  <span className="material-symbols-outlined text-9xl">verified_user</span>
                </div>
                <h3 className="text-lg font-semibold text-text-main dark:text-white z-10">Originality Score</h3>
                <div className="relative size-48 z-10">
                  <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                    <circle className="text-gray-100 dark:text-gray-800 stroke-current" cx="50" cy="50" fill="none" r="40" strokeWidth="8"></circle>
                    <circle className="text-green-500 stroke-current transition-all duration-1000 ease-out" cx="50" cy="50" fill="none" r="40" strokeDasharray="251.2" strokeDashoffset="30" strokeLinecap="round" strokeWidth="8"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-text-main dark:text-white">88%</span>
                    <span className="text-sm font-medium text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/30 px-2 py-0.5 rounded mt-1">Passed</span>
                  </div>
                </div>
                <p className="text-sm text-center text-text-sub max-w-[200px] z-10">High originality detected. Minor similarities found in 2 sources.</p>
              </div>

              {/* Detail Cards */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                      <span className="material-symbols-outlined">smart_toy</span>
                    </div>
                    <span className="text-2xl font-bold text-text-main dark:text-white">12%</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">Likely AI Content</h4>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-orange-500 h-full rounded-full" style={{ width: '12%' }}></div>
                    </div>
                    <p className="text-xs text-text-sub mt-2">Low probability of AI generation.</p>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      <span className="material-symbols-outlined">format_quote</span>
                    </div>
                    <span className="text-2xl font-bold text-text-main dark:text-white">Good</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">Citation Quality</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <span className="material-symbols-outlined text-yellow-400 text-sm icon-filled">star</span>
                      <span className="material-symbols-outlined text-yellow-400 text-sm icon-filled">star</span>
                      <span className="material-symbols-outlined text-yellow-400 text-sm icon-filled">star</span>
                      <span className="material-symbols-outlined text-yellow-400 text-sm icon-filled">star</span>
                      <span className="material-symbols-outlined text-gray-300 text-sm">star</span>
                    </div>
                    <p className="text-xs text-text-sub mt-1">14 Citations found.</p>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                      <span className="material-symbols-outlined">menu_book</span>
                    </div>
                    <span className="text-2xl font-bold text-text-main dark:text-white">College</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">Readability Level</h4>
                    <p className="text-xs text-text-sub">Appropriate for academic submission.</p>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-2xl p-5 border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col justify-between">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400">
                      <span className="material-symbols-outlined">link</span>
                    </div>
                    <span className="text-2xl font-bold text-text-main dark:text-white">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-text-main dark:text-gray-200 mb-1">Matches Found</h4>
                    <p className="text-xs text-text-sub">Wikipedia, Scribd</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analysis Highlights & Premium */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 flex flex-col gap-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">tips_and_updates</span>
                  Analysis Highlights
                </h3>
                <div className="bg-card-light dark:bg-card-dark border-l-4 border-green-500 rounded-r-xl p-4 shadow-sm border border-y-gray-200 dark:border-y-gray-800 border-r-gray-200 dark:border-r-gray-800 flex gap-4">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full h-fit shrink-0">
                    <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">check</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-main dark:text-white text-sm">Sentence Complexity</h4>
                    <p className="text-xs text-text-sub mt-1">Varied sentence structure indicates human writing style.</p>
                  </div>
                </div>
                <div className="bg-card-light dark:bg-card-dark border-l-4 border-yellow-500 rounded-r-xl p-4 shadow-sm border border-y-gray-200 dark:border-y-gray-800 border-r-gray-200 dark:border-r-gray-800 flex gap-4">
                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full h-fit shrink-0">
                    <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">priority_high</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-text-main dark:text-white text-sm">Possible AI Patterns</h4>
                    <p className="text-xs text-text-sub mt-1">Paragraph 3 uses repetitive transition words common in LLM outputs.</p>
                  </div>
                </div>
                <div className="relative mt-2">
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 dark:bg-background-dark/60 backdrop-blur-[2px] rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <button className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-full shadow-xl hover:scale-105 transition-transform group">
                      <span className="material-symbols-outlined text-sm">lock</span>
                      <span className="text-xs font-bold">Unlock 4 Deep Insights</span>
                    </button>
                  </div>
                  <div className="opacity-50 blur-[2px] flex flex-col gap-4 pointer-events-none select-none">
                    <div className="bg-card-light dark:bg-card-dark border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm flex gap-4">
                      <div className="bg-red-100 p-2 rounded-full h-fit shrink-0">
                        <span className="material-symbols-outlined text-red-600 text-sm">warning</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-main text-sm">Matched Source: Wikipedia</h4>
                        <p className="text-xs text-text-sub mt-1">Direct copy detected in Section 2.</p>
                      </div>
                    </div>
                    <div className="bg-card-light dark:bg-card-dark border-l-4 border-red-500 rounded-r-xl p-4 shadow-sm flex gap-4">
                      <div className="bg-red-100 p-2 rounded-full h-fit shrink-0">
                        <span className="material-symbols-outlined text-red-600 text-sm">warning</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-text-main text-sm">Paraphrasing Detected</h4>
                        <p className="text-xs text-text-sub mt-1">High similarity to online essay database.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-primary/20 dark:to-card-dark rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 rounded-full blur-3xl"></div>
                <div className="relative z-10">
                  <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center mb-4 backdrop-blur-sm border border-white/10">
                    <span className="material-symbols-outlined text-yellow-400">workspace_premium</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Unlock Full Report</h3>
                  <p className="text-gray-300 text-sm mb-6">Ensure your academic integrity with deep analysis tools.</p>
                  <ul className="space-y-3 mb-8">
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                      <span>Deep Web & Database Scan</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                      <span>Detailed AI Probability Map</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                      <span>Auto-Citation Generator</span>
                    </li>
                    <li className="flex items-center gap-3 text-sm text-gray-200">
                      <span className="material-symbols-outlined text-green-400 text-base">check_circle</span>
                      <span>Download PDF Proof</span>
                    </li>
                  </ul>
                </div>
                <button className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-colors shadow-lg shadow-primary/30 flex items-center justify-center gap-2 relative z-10 border border-primary/20">
                  Upgrade to Pro
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
