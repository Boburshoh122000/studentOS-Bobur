
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';
import { aiApi } from '../src/services/api';

interface CVAnalysisResult {
  atsScore: number;
  feedback: string;
  hardSkillsFound: number;
  softSkillsFound: number;
  missingKeywords: string[];
  presentKeywords: string[];
  suggestions: string[];
}

export default function CVChecker({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [activeMode, setActiveMode] = useState<'builder' | 'ats'>('ats');
  const [activeTab, setActiveTab] = useState('Personal Info');
  const [inputMode, setInputMode] = useState<'upload' | 'text'>('upload');
  const [cvText, setCvText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<CVAnalysisResult | null>(null);
  const hoverTimeoutRef = useRef<any>(null);

  const handleAnalyzeCV = async () => {
    if (!cvText.trim()) {
      setError('Please enter your CV text');
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await aiApi.analyzeCV(cvText, jobDescription || undefined);
      const data = response.data as CVAnalysisResult;
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Failed to analyze CV:', err);
      setError(err.response?.data?.error || 'Failed to analyze CV. Please try again.');
    } finally {
      setIsAnalyzing(false);
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
               { screen: Screen.CV_ATS, icon: 'description', label: 'CV and ATS', active: true },
               { screen: Screen.COVER_LETTER, icon: 'edit_document', label: 'Cover Letter' },
               { screen: Screen.JOBS, icon: 'work', label: 'Job Finder' },
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
            <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white dark:ring-gray-700 flex-shrink-0" data-alt="User profile picture placeholder" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                <span className="text-sm font-bold text-text-main dark:text-white truncate">Alex Morgan</span>
                <span className="text-xs text-text-sub truncate">alex@student.edu</span>
            </div>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] backdrop-blur-sm px-6 flex items-center justify-between shrink-0 z-10">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">StudentOS</h1>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
              <span className="text-sm font-medium text-slate-500">{activeMode === 'ats' ? 'ATS Checker' : 'CV Builder'}</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button 
                onClick={() => setActiveMode('builder')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeMode === 'builder' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                CV Builder
              </button>
              <button 
                onClick={() => setActiveMode('ats')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeMode === 'ats' ? 'bg-white dark:bg-slate-700 text-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
              >
                ATS Checker
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-400 font-medium mr-2">Last saved: 1 min ago</div>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
          </div>
        </header>

        {activeMode === 'ats' ? (
          <div className="flex-1 overflow-hidden bg-background-light dark:bg-background-dark p-6">
            <div className="h-full grid grid-cols-12 gap-6 max-w-7xl mx-auto">
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 h-full overflow-y-auto hide-scrollbar pb-10">
                {/* Mode Switcher */}
                <div className="flex mb-4 gap-2">
                  <button 
                    onClick={() => setInputMode('upload')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${inputMode === 'upload' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1 align-middle">cloud_upload</span>
                    Upload
                  </button>
                  <button 
                    onClick={() => setInputMode('text')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${inputMode === 'text' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                  >
                    <span className="material-symbols-outlined text-[16px] mr-1 align-middle">edit_note</span>
                    Paste Text
                  </button>
                </div>

                {inputMode === 'upload' ? (
                  <div className="bg-white dark:bg-card-dark rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 flex flex-col items-center justify-center text-center gap-4 transition-all hover:bg-primary/10 group cursor-pointer relative overflow-hidden shadow-sm">
                    <div className="absolute top-4 right-4">
                      <button className="p-2 text-primary hover:bg-primary/10 rounded-full transition-colors" title="Re-upload">
                        <span className="material-symbols-outlined text-[20px]">refresh</span>
                      </button>
                    </div>
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white">Upload your CV</h3>
                      <p className="text-sm text-slate-500 mt-1">Drag & drop or <span className="text-primary font-medium hover:underline">browse</span></p>
                    </div>
                    <p className="text-xs text-slate-400">PDF, DOCX up to 10MB</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-4 shadow-sm">
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Your CV / Resume Text</label>
                      <textarea
                        value={cvText}
                        onChange={(e) => setCvText(e.target.value)}
                        placeholder="Paste your CV or resume text here..."
                        className="w-full h-32 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Job Description (Optional)</label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description for targeted analysis..."
                        className="w-full h-24 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm resize-none focus:ring-2 focus:ring-primary focus:border-primary"
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button
                      onClick={handleAnalyzeCV}
                      disabled={isAnalyzing || !cvText.trim()}
                      className="w-full py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[18px]">sync</span>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[18px]">search_check</span>
                          Analyze CV
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex-1 min-h-[300px]">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">Recently Scanned</h3>
                    <button className="text-xs text-primary font-medium hover:underline">View All</button>
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    <div className="p-4 bg-primary/5 flex items-center gap-3 cursor-pointer border-l-4 border-primary">
                      <div className="size-10 rounded-lg bg-white dark:bg-slate-700 text-red-500 shadow-sm flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">Alex_Smith_Frontend.pdf</h4>
                        <p className="text-xs text-primary font-medium">Just now</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full border border-green-200">85%</span>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 cursor-pointer border-l-4 border-transparent">
                      <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-blue-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">description</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">Alex_Smith_Generic.docx</h4>
                        <p className="text-xs text-slate-400">2 days ago</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2.5 py-1 rounded-full border border-yellow-200">64%</span>
                      </div>
                    </div>
                    <div className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-3 cursor-pointer border-l-4 border-transparent">
                      <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-red-500 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined">picture_as_pdf</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">Alex_Smith_v1.pdf</h4>
                        <p className="text-xs text-slate-400">1 week ago</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full border border-orange-200">42%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-6 h-full overflow-y-auto hide-scrollbar pb-10">
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col md:flex-row items-center gap-10">
                  <div className="relative size-40 shrink-0">
                    <div className="size-full rounded-full shadow-inner" style={{ background: 'conic-gradient(#2e2ee0 85%, #e2e8f0 0)' }}></div>
                    <div className="absolute inset-3 bg-white dark:bg-card-dark rounded-full flex flex-col items-center justify-center shadow-md">
                      <span className="text-4xl font-extrabold text-slate-900 dark:text-white">85<span className="text-xl text-slate-400">%</span></span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">ATS Score</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4 text-center md:text-left">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Excellent! Your CV is optimized.</h2>
                      <p className="text-sm text-slate-500 leading-relaxed max-w-lg">Your resume parses correctly and matches <strong className="text-slate-700 dark:text-slate-300">85%</strong> of the keywords for <span className="text-primary font-bold bg-primary/5 px-1 rounded">Junior Frontend Developer</span>. A few tweaks to your skills section could push this to 95%.</p>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
                      <div className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Hard Skills</span>
                          <span className="block text-lg font-bold text-slate-900 dark:text-white">12<span className="text-slate-400 text-sm">/15</span></span>
                        </div>
                      </div>
                      <div className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center gap-3">
                        <div className="size-2 rounded-full bg-yellow-500"></div>
                        <div>
                          <span className="block text-[10px] text-slate-400 uppercase font-bold tracking-wider">Soft Skills</span>
                          <span className="block text-lg font-bold text-slate-900 dark:text-white">6<span className="text-slate-400 text-sm">/8</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                        <span className="material-symbols-outlined">key</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Keyword Match</h3>
                    </div>
                    <div className="space-y-5 flex-1">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-slate-700 dark:text-slate-300">Required Keywords</span>
                          <span className="text-indigo-600 dark:text-indigo-400">85%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className="text-slate-700 dark:text-slate-300">Recommended Keywords</span>
                          <span className="text-indigo-400 dark:text-indigo-300">60%</span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-300 dark:bg-indigo-600 w-[60%] rounded-full"></div>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-wrap gap-2">
                          <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded uppercase">React</span>
                          <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 text-[10px] font-bold rounded uppercase">Javascript</span>
                          <span className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 text-[10px] font-bold rounded uppercase line-through decoration-red-600">TypeScript</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] font-bold rounded uppercase">+5 more</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                        <span className="material-symbols-outlined">work</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white">Role Relevance</h3>
                    </div>
                    <div className="flex flex-col gap-4 flex-1">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                        <div className="text-[10px] text-slate-400 uppercase font-bold mb-1 tracking-wider">Target Role</div>
                        <div className="font-bold text-slate-800 dark:text-white text-sm">Junior Frontend Developer</div>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">AI Compatibility:</span>
                        <span className="flex items-center gap-1 text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                          <span className="material-symbols-outlined text-[16px]">verified</span> High Match
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-snug mt-auto">Your experience duration and project complexity align well with market standards for this role based on 500+ similar job descriptions.</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg">
                      <span className="material-symbols-outlined">format_shapes</span>
                    </div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Formatting Check</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-green-500 shrink-0">check_circle</span>
                      Standard Fonts (Inter, Arial)
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-green-500 shrink-0">check_circle</span>
                      File Size (&lt; 2MB)
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <span className="material-symbols-outlined text-green-500 shrink-0">check_circle</span>
                      No Tables Detected
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 p-2 rounded bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 transition-colors">
                      <span className="material-symbols-outlined text-red-500 shrink-0">cancel</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">Header/Footer Graphics Detected</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] rounded-2xl p-6 text-white relative overflow-hidden shadow-xl border border-slate-700">
                  <div className="absolute top-0 right-0 p-20 bg-blue-500/10 blur-[60px] rounded-full pointer-events-none"></div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-yellow-400/20 rounded-lg border border-yellow-400/20">
                        <span className="material-symbols-outlined text-yellow-400">lightbulb</span>
                      </div>
                      <h3 className="font-bold text-lg tracking-tight">Optimization Tips</h3>
                    </div>
                    <span className="px-3 py-1 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full uppercase tracking-wider shadow-lg shadow-yellow-400/20 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">star</span> Premium
                    </span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                        <span className="material-symbols-outlined text-green-400 text-xs">add</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Increase use of action verbs</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">Replace passive phrases like "Responsible for" with strong verbs like "Spearheaded", "Developed", or "Optimized".</p>
                      </div>
                    </div>
                    <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                      <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 border border-green-500/30">
                        <span className="material-symbols-outlined text-green-400 text-xs">add</span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Add 'TypeScript' to skills section</p>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">It appears in your work experience description but is missing from your core skills list which bots scan first.</p>
                      </div>
                    </div>
                    <div aria-hidden="true" className="space-y-3 relative select-none">
                      <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 blur-[4px] opacity-40">
                        <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-green-400 text-xs">add</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Quantify your achievements</p>
                          <p className="text-xs text-slate-400 mt-1">Add metrics to 3 more bullet points to show impact.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 blur-[4px] opacity-40">
                        <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-green-400 text-xs">add</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Reduce document length</p>
                          <p className="text-xs text-slate-400 mt-1">Your CV exceeds 2 pages. Condense older roles.</p>
                        </div>
                      </div>
                      <div className="flex gap-4 items-start p-4 rounded-xl bg-white/5 border border-white/10 blur-[4px] opacity-40">
                        <div className="mt-0.5 size-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-green-400 text-xs">add</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">Fix date formatting inconsistencies</p>
                          <p className="text-xs text-slate-400 mt-1">Use MM/YYYY format consistently.</p>
                        </div>
                      </div>
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent rounded-b-2xl">
                        <button className="bg-white text-slate-900 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold text-sm shadow-xl shadow-black/50 transition-all hover:scale-105 flex items-center gap-2 group">
                          <span className="material-symbols-outlined text-lg group-hover:text-primary transition-colors">lock_open</span>
                          Unlock Full Analysis
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-[450px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark overflow-y-auto no-scrollbar flex flex-col">
              <div className="p-6 pb-20 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white">Editor</h2>
                  <span className="text-xs text-slate-400">All changes saved automatically</span>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50">
                  <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-sm">person</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Personal Details</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_less</span>
                  </div>
                  <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="col-span-1 space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase">First Name</label>
                      <input className="w-full text-sm rounded-md border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-primary/20" type="text" defaultValue="Alex"/>
                    </div>
                    <div className="col-span-1 space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase">Last Name</label>
                      <input className="w-full text-sm rounded-md border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-primary/20" type="text" defaultValue="Smith"/>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase">Job Title</label>
                      <input className="w-full text-sm rounded-md border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-primary/20" type="text" defaultValue="Junior Frontend Developer"/>
                    </div>
                    <div className="col-span-1 space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase">Email</label>
                      <input className="w-full text-sm rounded-md border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-primary/20" type="email" defaultValue="alex.smith@student.edu"/>
                    </div>
                    <div className="col-span-1 space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase">Phone</label>
                      <input className="w-full text-sm rounded-md border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-primary/20" type="tel" defaultValue="+1 (555) 000-1234"/>
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-[11px] font-medium text-slate-500 uppercase">Location</label>
                      <input className="w-full text-sm rounded-md border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 focus:border-primary focus:ring-primary/20" type="text" defaultValue="San Francisco, CA"/>
                    </div>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">assignment</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Professional Summary</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">work</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Experience</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">school</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Education</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">psychology</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Skills & Tools</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-800/50 group">
                  <div className="bg-white dark:bg-slate-800 px-4 py-3 flex justify-between items-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-primary transition-colors text-sm">translate</span>
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Languages</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-sm">expand_more</span>
                  </div>
                </div>
                <button className="w-full py-3 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-sm font-medium hover:text-primary hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  Add Custom Section
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-[#0B0D15] relative overflow-hidden flex flex-col">
              <div className="absolute bottom-6 right-6 z-30 flex flex-col gap-2">
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-1 flex flex-col items-center">
                  <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                  <div className="h-px w-4 bg-slate-200 dark:bg-slate-700"></div>
                  <button className="p-2 text-slate-500 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[20px]">remove</span>
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-8 lg:p-12 flex justify-center items-start">
                <div className="resume-paper bg-white text-black shadow-xl shrink-0 origin-top transform scale-90 lg:scale-100 transition-transform duration-300">
                  <div className="p-8 flex flex-col gap-6">
                    <div className="border-b-2 border-slate-900 pb-5">
                      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight uppercase mb-1">Alex Smith</h1>
                      <p className="text-xl text-primary font-bold">Junior Frontend Developer</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-slate-600 font-medium">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">email</span>
                          alex.smith@student.edu
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">call</span>
                          +1 (555) 000-1234
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">location_on</span>
                          San Francisco, CA
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">link</span>
                          linkedin.com/in/alexsmith
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Professional Profile</h2>
                      <p className="text-xs text-slate-700 leading-relaxed text-justify">
                        Passionate computer science student with a focus on building accessible, user-friendly web applications. Experienced in React and Tailwind CSS, with a strong foundation in modern JavaScript. Eager to launch a career in frontend development and contribute to innovative tech solutions. Proven ability to work in agile environments and deliver high-quality code.
                      </p>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-1">Experience</h2>
                      <div className="flex flex-col gap-5">
                        <div className="relative pl-4 border-l-2 border-slate-100">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-sm font-bold text-slate-800">Web Development Intern</h3>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Jun 2023 - Aug 2023</span>
                          </div>
                          <p className="text-xs font-bold text-primary mb-2">TechStart Inc. — San Francisco</p>
                          <ul className="list-disc list-outside ml-3 text-xs text-slate-700 space-y-1.5">
                            <li>Assisted in refactoring legacy codebase to React 18, improving maintainability by 40%.</li>
                            <li>Collaborated closely with UX designers to implement pixel-perfect UI components from Figma.</li>
                            <li>Optimized image assets and scripts, improving page load times by 20% across the platform.</li>
                            <li>Participated in daily stand-ups and code reviews, ensuring code quality standards.</li>
                          </ul>
                        </div>
                        <div className="relative pl-4 border-l-2 border-slate-100">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="text-sm font-bold text-slate-800">Freelance Web Developer</h3>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">Jan 2022 - Present</span>
                          </div>
                          <p className="text-xs font-bold text-primary mb-2">Remote</p>
                          <ul className="list-disc list-outside ml-3 text-xs text-slate-700 space-y-1.5">
                            <li>Developed responsive websites for local businesses using HTML5, CSS3, and JavaScript.</li>
                            <li>Implemented SEO best practices, resulting in a 15% increase in organic traffic for clients.</li>
                            <li>Managed client communications and project timelines effectively.</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 border-b border-slate-200 pb-1">Education</h2>
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800">BS Computer Science</h3>
                            <p className="text-xs font-medium text-slate-600 italic">University of Tech</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-semibold text-slate-500">Expected 2024</span>
                            <p className="text-[10px] text-slate-400 mt-0.5">GPA: 3.8/4.0</p>
                          </div>
                        </div>
                        <div className="text-xs text-slate-700">
                          <span className="font-semibold">Relevant Coursework:</span> Data Structures, Algorithms, Web Development, Database Systems, UI/UX Design.
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Technical Skills</h2>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">JavaScript (ES6+)</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">React.js</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">TypeScript</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">HTML5 & CSS3</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">Tailwind CSS</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">Git & GitHub</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">Figma</span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-[10px] font-semibold rounded">Node.js</span>
                        </div>
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1">Languages</h2>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-700 font-medium">English</span>
                            <span className="text-slate-500">Native</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          <div className="flex justify-between text-[11px] mt-2">
                            <span className="text-slate-700 font-medium">Spanish</span>
                            <span className="text-slate-500">Intermediate</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
