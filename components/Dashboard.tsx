import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';

export default function Dashboard({ navigateTo }: NavigationProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      <aside className={`${isSidebarExpanded ? 'w-64' : 'w-20'} bg-card-light dark:bg-card-dark border-r border-gray-200 dark:border-gray-800 flex-shrink-0 flex flex-col justify-between transition-all duration-300 ease-in-out hidden md:flex items-center py-6 relative z-20`}>
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-10 bg-card-light dark:bg-card-dark border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6"
        >
          <span className="material-symbols-outlined text-[14px]">{isSidebarExpanded ? 'chevron_left' : 'chevron_right'}</span>
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
               { screen: Screen.DASHBOARD, icon: 'dashboard', label: 'Dashboard', active: true },
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
                  className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg transition-colors group relative ${item.active ? 'bg-primary/10 text-primary' : 'text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white'}`}
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
          <button className={`flex items-center ${isSidebarExpanded ? 'gap-3 px-3 py-2.5 w-full' : 'justify-center p-3 size-10'} rounded-lg text-text-sub hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-text-main dark:hover:text-white transition-colors group relative`} title="Settings">
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
      
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] dark:bg-background-dark">
        <header className="h-20 px-8 flex items-center justify-between flex-shrink-0 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-800 z-10">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-text-main dark:text-white">Welcome back, Alex!</h2>
            <p className="text-sm text-text-sub">Here is your daily briefing.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
              <input className="pl-10 pr-4 py-2 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary w-64 transition-all shadow-sm dark:text-white" placeholder="Search tools, jobs..." type="text" />
            </div>
            <button className="relative p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-text-sub hover:text-primary transition-colors shadow-sm">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2.5 size-2 bg-red-500 rounded-full border border-white dark:border-card-dark"></span>
            </button>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
              <img className="w-8 h-8 rounded-full object-cover border border-gray-100 dark:border-gray-600" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAhG4np0VVE22WojP2CGz7Ch6oi2UbBGvY215GNeJl-qbqiIkvVO0e4VJCR48HYD7zcjJ60KfnEAbHOCeMGlVJwochpZSwqE5sh6rBSYgIsX8LQz5UE6yBSk2CJMQ8HXNzUxgZG2yHaebJYk7QmIl7Z2KUZH1fL8p4S0iaspKV4wNVdgBRvRv1lXYD-NeEM5GHeF11YqbTWAvllHQzT4AqVhoA_CKzfcl5nPMHa4BOHNacdhm-S2FFPGfH8ZhQF4TdbUdOb1vS8lg0" alt="User profile" />
              <span className="material-symbols-outlined text-gray-400">expand_more</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Column: Stats & Activity */}
              <div className="xl:col-span-2 space-y-6">
                
                {/* Active Job Applications & ATS Score */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Job Apps */}
                  <div className="md:col-span-2 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Job Applications</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your current pipeline status</p>
                      </div>
                      <button className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1" onClick={() => navigateTo(Screen.JOBS)}>
                        View Board <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800/30 flex flex-col justify-between h-32 relative overflow-hidden group">
                        <div className="z-10 relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Applied</span>
                          </div>
                          <span className="text-3xl font-bold text-blue-700 dark:text-blue-300">12</span>
                        </div>
                        <p className="text-xs text-blue-600 dark:text-blue-400 z-10">+2 this week</p>
                        <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-blue-200 dark:text-blue-800/20 text-[80px] group-hover:scale-110 transition-transform">send</span>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-100 dark:border-green-800/30 flex flex-col justify-between h-32 relative overflow-hidden group">
                        <div className="z-10 relative">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-sm font-medium text-green-900 dark:text-green-200">Offers</span>
                          </div>
                          <span className="text-3xl font-bold text-green-700 dark:text-green-300">1</span>
                        </div>
                        <p className="text-xs text-green-600 dark:text-green-400 z-10">Review by Friday</p>
                        <span className="material-symbols-outlined absolute -bottom-2 -right-2 text-green-200 dark:text-green-800/20 text-[80px] group-hover:scale-110 transition-transform">verified</span>
                      </div>
                    </div>
                  </div>

                  {/* ATS Score Widget */}
                  <div className="md:col-span-1 bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4 z-10">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Last ATS<br/>Evaluation</h3>
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <span className="material-symbols-outlined text-[20px]">fact_check</span>
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center z-10 my-2">
                      <div className="relative w-28 h-28">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path className="text-gray-100 dark:text-gray-700" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5"></path>
                          <path className="text-primary" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeDasharray="87, 100" strokeLinecap="round" strokeWidth="2.5"></path>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">87%</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => navigateTo(Screen.CV_ATS)} className="mt-4 w-full py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors z-10">
                      View Details
                    </button>
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 dark:bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
                    <button className="text-sm font-medium text-gray-500 hover:text-primary transition-colors">View All</button>
                  </div>
                  <div className="flex flex-col gap-1">
                    {[
                      { icon: 'co_present', bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', title: 'Presentation Maker', sub: 'Recently used', time: '2h ago' },
                      { icon: 'work', bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', title: 'Product Designer Role', sub: 'Applied at Google', time: '1d ago' },
                      { icon: 'fact_check', bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-300', title: 'CV ATS Score', sub: 'Updated', time: '2d ago' },
                      { icon: 'school', bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', title: 'Learning Plan', sub: 'Completed Week 2', time: '3d ago' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${item.bg} flex items-center justify-center ${item.text} flex-shrink-0`}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{item.sub}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Habit Tracker & Focus */}
              <div className="space-y-6">
                <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 h-full flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Habit Tracker</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Daily goals & consistency</p>
                    </div>
                    <button onClick={() => navigateTo(Screen.HABIT_TRACKER)} className="text-primary bg-primary/10 p-2 rounded-lg hover:bg-primary/20 transition-colors">
                      <span className="material-symbols-outlined text-[20px]">add</span>
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-primary/25 mb-6 relative overflow-hidden group">
                    <div className="relative z-10 flex justify-between items-center">
                      <div>
                        <span className="text-blue-100 text-xs font-semibold uppercase tracking-wider">Current Streak</span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-bold">24</span>
                          <span className="text-sm font-medium text-blue-100">days</span>
                        </div>
                      </div>
                      <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <span className="material-symbols-outlined text-white">local_fire_department</span>
                      </div>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">October 2023</h4>
                      <div className="flex gap-2">
                        <span className="w-2 h-2 rounded-sm bg-gray-100 dark:bg-gray-700"></span>
                        <span className="w-2 h-2 rounded-sm bg-primary/40"></span>
                        <span className="w-2 h-2 rounded-sm bg-primary"></span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 mb-2">
                      {['M','T','W','T','F','S','S'].map((d, i) => (
                        <div key={i} className="text-center text-[10px] text-gray-500 font-medium">{d}</div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 31 }).map((_, i) => {
                        const active = Math.random() > 0.4;
                        const intensity = Math.random() > 0.5 ? 'bg-primary' : 'bg-primary/40';
                        const isToday = i === 24;
                        return (
                          <div 
                            key={i} 
                            className={`aspect-square rounded-md ${
                              active ? intensity : 'bg-gray-100 dark:bg-gray-700'
                            } ${isToday ? 'border border-primary border-dashed' : ''}`}
                            title={`Oct ${i + 1}`}
                          ></div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">Today's Focus</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Morning Meditations', done: true },
                        { label: 'Read 30 mins', done: false },
                        { label: 'Code for 1 hour', done: false },
                      ].map((habit, i) => (
                        <label key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group">
                          <div className={`w-5 h-5 rounded flex items-center justify-center border ${habit.done ? 'bg-primary border-primary text-white' : 'border-gray-300 dark:border-gray-600'}`}>
                            {habit.done && <span className="material-symbols-outlined text-[14px]">check</span>}
                          </div>
                          <span className={`text-sm ${habit.done ? 'text-gray-400 line-through' : 'text-gray-900 dark:text-white font-medium group-hover:text-primary transition-colors'}`}>
                            {habit.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Completion Banner */}
            <div className="bg-gray-900 dark:bg-black text-white rounded-xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
              <div className="relative z-10 max-w-lg">
                <h3 className="text-xl font-bold mb-2">Complete your Resume</h3>
                <p className="text-gray-400 text-sm leading-relaxed">Your profile is 80% complete. Add your latest project to increase visibility to recruiters.</p>
              </div>
              <button className="relative z-10 px-6 py-2.5 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap" onClick={() => navigateTo(Screen.CV_ATS)}>
                Update Profile
              </button>
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}