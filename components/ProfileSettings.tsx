
import React, { useState, useRef } from 'react';
import { Screen, NavigationProps } from '../types';

export default function ProfileSettings({ navigateTo }: NavigationProps) {
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
               { screen: Screen.PRESENTATION, icon: 'co_present', label: 'Presentation Maker' },
               { screen: Screen.PLAGIARISM, icon: 'plagiarism', label: 'Plagiarism Checker' },
             ].map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => item.screen && navigateTo(item.screen)}
                  className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${item.screen === Screen.PROFILE ? 'text-text-sub' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main'}`}
                  title={!isSidebarExpanded ? item.label : ''}
                >
                  <span className={`material-symbols-outlined ${item.screen === Screen.PROFILE ? '' : 'group-hover:text-primary'} ${!isSidebarExpanded ? 'text-2xl' : 'text-[20px]'}`}>
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
          <button 
            onClick={() => navigateTo(Screen.PROFILE)}
            className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${true ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main'}`} 
            title="Settings"
          >
            <span className={`material-symbols-outlined ${!isSidebarExpanded ? 'text-2xl' : 'text-[20px]'} icon-filled`}>settings</span>
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
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative bg-[#fafafa] dark:bg-background-dark">
        <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-text-main dark:text-white">Profile Settings</h2>
            <p className="text-sm text-text-sub">Manage your personal information and account preferences.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input className="pl-10 pr-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all shadow-sm" placeholder="Search settings..." type="text" />
            </div>
            <button className="relative p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary transition-colors shadow-sm">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
            </button>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <div className="size-8 rounded-full bg-gray-200 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
              <span className="material-symbols-outlined text-gray-400">expand_more</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-12 pt-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column */}
              <div className="space-y-8 lg:col-span-1">
                {/* Account Basics */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Account Basics</h3>
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative group cursor-pointer">
                      <div className="size-28 rounded-full bg-gray-200 bg-cover bg-center border-4 border-white dark:border-gray-800 shadow-md transition-transform group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0')" }}></div>
                      <button className="absolute bottom-0 right-1 p-2 bg-primary rounded-full text-white hover:bg-primary-dark shadow-lg border-2 border-white dark:border-gray-800 transition-all">
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                      </button>
                    </div>
                    <button className="mt-4 text-sm font-medium text-primary hover:text-primary-dark transition-colors">Change Profile Picture</button>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Full Name</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">person</span>
                        <input className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="Alex Morgan" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Gmail Address</label>
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">mail</span>
                        <input className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="email" defaultValue="alex.morgan@studentos.com" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Security</h3>
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Current Password</label>
                      <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" placeholder="••••••••" type="password" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">New Password</label>
                      <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" placeholder="New password" type="password" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Confirm Password</label>
                      <input className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" placeholder="Confirm new password" type="password" />
                    </div>
                    <button className="w-full mt-2 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-[20px]">lock_reset</span>
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (Wider) */}
              <div className="space-y-8 lg:col-span-2">
                
                {/* Education */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-main dark:text-white">Education</h3>
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">School / University</label>
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="Stanford University" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Degree</label>
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="B.S. Computer Science" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Graduation Year</label>
                      <input className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="2025" />
                    </div>
                  </div>
                </div>

                {/* Work Experience */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-text-main dark:text-white">Work Experience</h3>
                    <button className="text-primary hover:bg-primary/10 p-1.5 rounded-lg transition-colors">
                      <span className="material-symbols-outlined">add</span>
                    </button>
                  </div>
                  <div className="relative pl-8 border-l-2 border-gray-100 dark:border-gray-700 ml-2 space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1.5 size-5 bg-primary rounded-full border-4 border-white dark:border-card-dark"></div>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Company</label>
                          <input className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="TechStart Inc." />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Job Title</label>
                            <input className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="Product Intern" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-text-sub uppercase mb-1.5 tracking-wider">Duration</label>
                            <input className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-text-main dark:text-white transition-all outline-none" type="text" defaultValue="Jun 2023 - Sep 2023" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interests & Skills */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Interests & Skills</h3>
                  <div className="mb-8">
                    <label className="block text-xs font-bold text-text-sub uppercase mb-3 tracking-wider">Professional Skills</label>
                    <div className="flex flex-wrap gap-2">
                      {['Python', 'UI/UX Design', 'Product Management'].map((skill) => (
                        <div key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-100 dark:border-blue-800/30 group cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors">
                          {skill}
                          <button className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-300">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-text-sub border border-gray-200 dark:border-gray-700 hover:border-primary hover:text-primary hover:bg-primary/5 border-dashed transition-all">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Skill
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-sub uppercase mb-3 tracking-wider">Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {['Fintech', 'Sustainability'].map((interest) => (
                        <div key={interest} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 border border-purple-100 dark:border-purple-800/30 group cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors">
                          {interest}
                          <button className="text-purple-400 hover:text-purple-600 dark:text-purple-500 dark:hover:text-purple-300">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </div>
                      ))}
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 text-text-sub border border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:text-purple-500 hover:bg-purple-50 border-dashed transition-all">
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        Add Interest
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button className="px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 flex items-center gap-2 hover:scale-105 active:scale-95">
                    <span className="material-symbols-outlined text-[20px]">save</span>
                    Save Changes
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
