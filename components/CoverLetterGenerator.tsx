
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

export default function CoverLetterGenerator({ navigateTo }: NavigationProps) {
  const [isSidebarLocked, setIsSidebarLocked] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState("");
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

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate API call
    setTimeout(() => {
      setGeneratedLetter(`Dear Hiring Manager,

I am writing to express my enthusiastic interest in the Product Designer position at TechFlow Inc., as advertised. With a strong foundation in user-centric design principles and a proven track record of creating intuitive digital experiences, I am eager to contribute to your team's innovative projects.

During my time at University of Tech, I led several design initiatives that resulted in measurable improvements in user engagement. My proficiency in Figma, combined with my ability to translate complex requirements into elegant solutions, aligns perfectly with TechFlow's mission to simplify technology for everyone.

I am particularly drawn to TechFlow's recent work on accessibility, a passion I share and have actively pursued through my coursework and personal projects. I am confident that my creative problem-solving skills and dedication to design excellence would make me a valuable asset to your team.

Thank you for considering my application. I look forward to the possibility of discussing how my background, skills, and enthusiasm can contribute to the continued success of TechFlow Inc.

Sincerely,
Alex Morgan`);
      setIsGenerating(false);
    }, 2000);
  };

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
               { screen: Screen.COVER_LETTER, icon: 'edit_document', label: 'Cover Letter', active: true },
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
        <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-background-light dark:bg-background-dark z-10 border-b border-gray-200 dark:border-gray-800">
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-text-main dark:text-white">AI Cover Letter Generator</h2>
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">BETA</span>
            </div>
            <p className="text-sm text-text-sub">Create personalized, professional cover letters in seconds.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-[18px]">history</span> History
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Input Section */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">1</span>
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-sub uppercase">Company Name</label>
                    <input className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20" type="text" placeholder="e.g. TechFlow Inc." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-text-sub uppercase">Job Title</label>
                    <input className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20" type="text" placeholder="e.g. Product Designer" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sub uppercase">Job Description</label>
                  <textarea className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20 resize-none h-32" placeholder="Paste the job description here..."></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                    <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">2</span>
                    Your Profile
                  </h3>
                  <button className="text-primary text-sm font-medium hover:underline">Load from CV</button>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-text-sub uppercase">Key Skills & Experience</label>
                  <textarea className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:border-primary focus:ring-primary/20 resize-none h-24" placeholder="Highlight your relevant skills, past roles, or achievements..."></textarea>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
                  <span className="flex items-center justify-center size-6 rounded-full bg-primary text-white text-xs">3</span>
                  Tone & Style
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Professional', 'Enthusiastic', 'Creative'].map((tone) => (
                    <label key={tone} className="cursor-pointer">
                      <input type="radio" name="tone" className="peer sr-only" defaultChecked={tone === 'Professional'} />
                      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 text-center hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                        <span className="text-sm font-medium">{tone}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-dark hover:to-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
              >
                {isGenerating ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                    Generate Cover Letter
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="flex-1 bg-gray-50 dark:bg-background-dark p-6 md:p-8 flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-text-sub uppercase tracking-wider text-xs">Preview</h3>
              <div className="flex gap-2">
                <button className="p-2 text-text-sub hover:text-primary hover:bg-white dark:hover:bg-card-dark rounded-lg transition-colors" title="Copy">
                  <span className="material-symbols-outlined text-[18px]">content_copy</span>
                </button>
                <button className="p-2 text-text-sub hover:text-primary hover:bg-white dark:hover:bg-card-dark rounded-lg transition-colors" title="Download PDF">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 overflow-y-auto">
              {generatedLetter ? (
                <div className="whitespace-pre-wrap font-serif text-gray-800 dark:text-gray-200 leading-relaxed text-sm">
                  {generatedLetter}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                  <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">description</span>
                  <p className="text-sm">Your generated cover letter will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
