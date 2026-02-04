
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';

interface LearningPlanData {
  title: string;
  timeframe: string;
  phases: Array<{
    title: string;
    duration: string;
    topics: string[];
    resources: string[];
  }>;
}

export default function LearningPlan({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [goal, setGoal] = useState('');
  const [timeframe, setTimeframe] = useState('4 weeks');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPlan, setGeneratedPlan] = useState<LearningPlanData | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const handleGeneratePlan = async () => {
    if (!goal.trim()) {
      setError('Please enter a learning goal');
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await aiApi.generateLearningPlan({ goal: goal.trim(), timeframe });
      const data = response.data as LearningPlanData;
      setGeneratedPlan(data);
    } catch (err: any) {
      console.error('Failed to generate learning plan:', err);
      setError(err.response?.data?.error || 'Failed to generate learning plan. Please try again.');
    } finally {
      setIsGenerating(false);
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
               { screen: null, icon: 'book_2', label: 'Learning Plan', active: true },
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
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0" data-alt="User profile picture placeholder" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">Alex Morgan</span>
                <span className="text-xs text-text-sub truncate">alex@student.edu</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-24 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-text-sub mb-1 cursor-pointer" onClick={() => navigateTo(Screen.DASHBOARD)}>
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              <span className="text-sm font-medium">Back to Dashboard</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main dark:text-white flex items-center gap-3">
              Junior Product Designer Roadmap
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold">In Progress</span>
            </h2>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <span className="text-sm text-text-sub font-medium">Overall Progress</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[35%] rounded-full"></div>
                </div>
                <span className="text-sm font-bold text-primary">35%</span>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
            <div className="relative flex flex-col gap-2">
              <label className="block text-xs text-text-sub font-medium">What do you want to learn?</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Become a Junior Product Designer"
                  className="flex-1 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <select 
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  aria-label="Select timeframe"
                  className="px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                >
                  <option value="2 weeks">2 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="8 weeks">8 weeks</option>
                  <option value="12 weeks">12 weeks</option>
                </select>
                <button 
                  onClick={handleGeneratePlan}
                  disabled={isGenerating || !goal.trim()}
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-[#0f111a]">
          <div className="max-w-6xl mx-auto p-8">
            <div className="flex gap-8">
              <div className="flex-1 space-y-8 relative pb-20">
                <div className="absolute left-[27px] top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 -z-10"></div>
                <div className="relative pl-16 group">
                  <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-background-dark bg-green-500 flex items-center justify-center shadow-sm z-10">
                    <span className="material-symbols-outlined text-white text-[28px]">check</span>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800/60 opacity-60">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-text-main dark:text-white line-through text-gray-400 dark:text-gray-500">Phase 1: Foundations</h3>
                        <p className="text-sm text-gray-400">Completed on Oct 12, 2023</p>
                      </div>
                      <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold dark:bg-green-900/20 dark:text-green-400">Done</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-transparent">
                        <div className="size-8 rounded bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                        </div>
                        <span className="text-sm font-medium line-through text-gray-400">Intro to UI/UX Theory</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative pl-16 group">
                  <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-background-dark bg-primary flex items-center justify-center shadow-lg shadow-primary/30 z-10">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-lg border border-primary/20 ring-1 ring-primary/5">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-text-main dark:text-white">Phase 2: Design Fundamentals</h3>
                        <p className="text-sm text-text-sub mt-1">Mastering color, typography, and layout.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">Current Step</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="group/item flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer">
                        <div className="size-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                          <span className="material-symbols-outlined">smart_display</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-base font-semibold text-text-main dark:text-white group-hover/item:text-primary transition-colors">Typography Masterclass</h4>
                            <div className="size-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover/item:border-primary flex items-center justify-center"></div>
                          </div>
                          <p className="text-xs text-text-sub mt-1 mb-2">YouTube • 45 mins</p>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-red-500 h-full w-[60%] rounded-full"></div>
                          </div>
                        </div>
                      </div>
                      <div className="group/item flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer">
                        <div className="size-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                          <span className="material-symbols-outlined">article</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-base font-semibold text-text-main dark:text-white group-hover/item:text-primary transition-colors">Case Study: Airbnb Redesign</h4>
                            <div className="size-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover/item:border-primary flex items-center justify-center"></div>
                          </div>
                          <p className="text-xs text-text-sub mt-1">Article • Medium • 12 min read</p>
                        </div>
                      </div>
                      <div className="group/item flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-gray-100 dark:border-gray-800 transition-all cursor-pointer bg-primary/5 border-primary/20">
                        <div className="size-10 rounded-lg bg-teal-100 dark:bg-teal-900/20 text-teal-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                          <span className="material-symbols-outlined">assignment</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="text-base font-semibold text-text-main dark:text-white group-hover/item:text-primary transition-colors">Quiz: Color Theory</h4>
                            <button className="text-xs bg-primary text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">Start</button>
                          </div>
                          <p className="text-xs text-text-sub mt-1">Assessment • 10 Questions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative pl-16 group opacity-50">
                  <div className="absolute left-0 top-0 size-14 rounded-full border-4 border-white dark:border-background-dark bg-gray-200 dark:bg-gray-700 flex items-center justify-center shadow-sm z-10">
                    <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 text-[24px]">lock</span>
                  </div>
                  <div className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 border-dashed">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-bold text-text-main dark:text-white">Phase 3: Prototyping</h3>
                      <span className="text-xs text-text-sub font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">Locked</span>
                    </div>
                    <p className="text-sm text-text-sub mt-2">Unlock by completing Phase 2.</p>
                  </div>
                </div>
              </div>
              <div className="w-80 flex-shrink-0 space-y-6">
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-text-sub uppercase mb-4 tracking-wide">Weekly Goals</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative size-12">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3"></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">75%</div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-main dark:text-white">Watch 3 Videos</p>
                        <p className="text-xs text-text-sub">2/3 completed</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative size-12">
                        <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-100 dark:text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3"></path>
                          <path className="text-green-500" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="100, 100" strokeLinecap="round" strokeWidth="3"></path>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="material-symbols-outlined text-green-500 text-[18px]">check</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-main dark:text-white">Read 1 Article</p>
                        <p className="text-xs text-text-sub">Completed</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#1e2130] to-[#111421] text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-[80px]">school</span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-300 uppercase mb-4 tracking-wide relative z-10">Mentor Support</h3>
                  <div className="flex items-center gap-4 mb-4 relative z-10">
                    <div className="size-12 rounded-full border-2 border-primary p-0.5">
                      <div className="size-full rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
                    </div>
                    <div>
                      <p className="font-bold text-white">Sarah Jenkins</p>
                      <p className="text-xs text-gray-400">Senior Product Designer @ Meta</p>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 mb-4 backdrop-blur-sm border border-white/10 relative z-10">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-semibold text-blue-200">Weekly Check-in</p>
                      <span className="text-[10px] bg-blue-500/20 text-blue-200 px-1.5 py-0.5 rounded">Upcoming</span>
                    </div>
                    <p className="text-sm font-medium">Thursday, 4:00 PM</p>
                  </div>
                  <button className="w-full py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition-colors relative z-10 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">chat</span>
                    Message Mentor
                  </button>
                </div>
                <div className="bg-card-light dark:bg-card-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
                  <h3 className="text-sm font-bold text-text-sub uppercase mb-4 tracking-wide">Recommended Tools</h3>
                  <div className="space-y-3">
                    <a className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors" href="#">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-purple-100 dark:bg-purple-900/20 text-purple-600 rounded-md flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">flutter</span>
                        </div>
                        <span className="text-sm font-medium text-text-main dark:text-white">Figma Course</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 text-[18px] group-hover:text-primary">arrow_forward</span>
                    </a>
                    <a className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg group transition-colors" href="#">
                      <div className="flex items-center gap-3">
                        <div className="size-8 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-md flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">palette</span>
                        </div>
                        <span className="text-sm font-medium text-text-main dark:text-white">Coolors.co</span>
                      </div>
                      <span className="material-symbols-outlined text-gray-300 text-[18px] group-hover:text-primary">arrow_forward</span>
                    </a>
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
