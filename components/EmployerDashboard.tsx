
import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';

export default function EmployerDashboard({ navigateTo }: NavigationProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'students' | 'company' | 'settings' | 'jobs'>('dashboard');

  return (
    <div className="flex h-screen w-full bg-[#fafafa] dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark transition-colors duration-200 flex-shrink-0">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigateTo(Screen.LANDING)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/30">
                <span className="material-symbols-outlined text-[20px]">school</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white tracking-tight">StudentOS</h1>
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Employer Console</p>
              </div>
            </div>
            
            <nav className="flex flex-col gap-1.5">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'dashboard' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === 'dashboard' ? 'fill-1' : ''}`}>dashboard</span>
                <span className={`text-sm ${activeTab === 'dashboard' ? 'font-semibold' : 'font-medium'}`}>Dashboard</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('jobs')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'jobs' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === 'jobs' ? 'fill-1' : ''}`}>work_history</span>
                <span className={`text-sm ${activeTab === 'jobs' ? 'font-semibold' : 'font-medium'}`}>My Jobs</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'students' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === 'students' ? 'fill-1' : ''}`}>person_search</span>
                <span className={`text-sm ${activeTab === 'students' ? 'font-semibold' : 'font-medium'}`}>Student Profiles</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('company')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'company' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === 'company' ? 'fill-1' : ''}`}>business</span>
                <span className={`text-sm ${activeTab === 'company' ? 'font-semibold' : 'font-medium'}`}>Company Profile</span>
              </button>
              
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${activeTab === 'settings' ? 'bg-primary/10 text-primary dark:text-white dark:bg-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-[20px] ${activeTab === 'settings' ? 'fill-1' : ''}`}>settings</span>
                <span className={`text-sm ${activeTab === 'settings' ? 'font-semibold' : 'font-medium'}`}>Settings</span>
              </button>
            </nav>
          </div>
          
          <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-9 w-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm border-2 border-white dark:border-slate-700 shadow-sm">
                HR
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">TechFlow HR</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Hiring Manager</p>
              </div>
            </div>
            <button onClick={() => navigateTo(Screen.SIGN_IN)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-50 dark:bg-white/5 p-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex flex-1 flex-col overflow-y-auto bg-[#fafafa] dark:bg-background-dark">
        <div className="mx-auto w-full max-w-[1600px] px-8 py-8">
          
          {activeTab === 'dashboard' && (
            <>
              {/* Header */}
              <header className="mb-10 flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Employer Dashboard</h2>
                  <p className="text-base text-slate-500 dark:text-slate-400 font-medium">Overview of your hiring activity</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setActiveTab('company')} className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-all shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">domain</span>
                    <span>View Profile</span>
                  </button>
                  <button className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-lg shadow-primary/30">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Post New Job</span>
                  </button>
                </div>
              </header>

              {/* Stats Cards */}
              <section className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {/* ... existing stats cards ... */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active Vacancies</p>
                    <div className="p-2 rounded-lg bg-blue-50 text-primary dark:bg-primary/20 dark:text-primary-light">
                      <span className="material-symbols-outlined text-[20px]">list_alt</span>
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">12</p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[16px] mr-0.5">trending_up</span>
                        2 New
                      </span>
                      <span className="text-slate-400 font-medium">this week</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Applicants</p>
                    <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-300">
                      <span className="material-symbols-outlined text-[20px]">group</span>
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">1,208</p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[16px] mr-0.5">trending_up</span>
                        +45
                      </span>
                      <span className="text-slate-400 font-medium">since last login</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-orange-100 dark:border-orange-900/30 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                  <div className="flex items-start justify-between relative z-10">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Shortlisted Candidates</p>
                    <div className="p-2 rounded-lg bg-orange-50 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400">
                      <span className="material-symbols-outlined text-[20px] icon-filled">star</span>
                    </div>
                  </div>
                  <div className="relative z-10">
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">36</p>
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      <span className="flex items-center font-bold text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined text-[16px] mr-0.5">trending_up</span>
                        +5
                      </span>
                      <span className="text-slate-400 font-medium">this week</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-between rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card-dark p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">New Applications</p>
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-300">
                      <span className="material-symbols-outlined text-[20px]">person_add</span>
                    </div>
                  </div>
                  <div>
                    <p className="mt-4 text-4xl font-black text-slate-900 dark:text-white tracking-tight">+45</p>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Requires review</span>
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                
                {/* Recent Applications List */}
                <section className="lg:col-span-2 flex flex-col h-full">
                  <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-5">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Applications</h3>
                      <button className="text-sm font-semibold text-primary hover:text-primary-dark transition-colors hover:underline">View All</button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {[
                          { name: 'Alice Johnson', role: 'Junior Frontend Developer', school: 'University of Toronto', match: 95, time: '2h ago', initials: 'AJ', color: 'bg-purple-100 text-purple-700', matchColor: 'bg-green-100 text-green-800' },
                          { name: 'Mark Smith', role: 'UX/UI Design Intern', school: 'NYU', match: 88, time: '5h ago', initials: 'MS', color: 'bg-blue-100 text-blue-700', matchColor: 'bg-blue-100 text-blue-800' },
                          { name: 'Sarah Lee', role: 'Product Manager', school: 'UCLA', match: 76, time: '1d ago', initials: 'SL', color: 'bg-pink-100 text-pink-700', matchColor: 'bg-orange-100 text-orange-800' },
                          { name: 'David Kim', role: 'Software Engineer', school: 'Stanford', match: 92, time: '1d ago', initials: 'DK', color: 'bg-teal-100 text-teal-700', matchColor: 'bg-green-100 text-green-800' },
                          { name: 'Emily Chen', role: 'Data Scientist', school: 'MIT', match: 84, time: '2d ago', initials: 'EC', color: 'bg-orange-100 text-orange-700', matchColor: 'bg-blue-100 text-blue-800' },
                        ].map((applicant, index) => (
                          <div key={index} className="group flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                            <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${applicant.color} border border-white dark:border-slate-700 shadow-sm`}>
                                {applicant.initials}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{applicant.name}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                                  {applicant.role} <span className="mx-1 text-slate-300">•</span> {applicant.school}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1.5">
                              <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ${applicant.matchColor}`}>
                                Match {applicant.match}%
                              </span>
                              <span className="text-xs font-medium text-slate-400">{applicant.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Trends Chart */}
                <section className="lg:col-span-1 flex flex-col h-full">
                  <div className="flex flex-col h-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark shadow-sm overflow-hidden p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="font-bold text-lg text-slate-900 dark:text-white">Application Trends</h3>
                      <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                      <div className="flex items-end justify-between gap-3 h-48 w-full px-2">
                        {[
                          { day: 'Mon', total: 65, new: 30 },
                          { day: 'Tue', total: 85, new: 45 },
                          { day: 'Wed', total: 55, new: 25 },
                          { day: 'Thu', total: 95, new: 60 },
                          { day: 'Fri', total: 75, new: 40 },
                        ].map((data, i) => (
                          <div key={i} className="flex flex-col items-center gap-3 group w-full">
                            <div className="w-full relative flex flex-col justify-end h-40 rounded-t-lg overflow-hidden cursor-pointer">
                              {/* Background Bar (Total) */}
                              <div 
                                className="w-full bg-indigo-100 dark:bg-indigo-900/30 absolute bottom-0 rounded-t-sm transition-all duration-500 group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50" 
                                style={{ height: `${data.total}%` }}
                              ></div>
                              {/* Foreground Bar (New) */}
                              <div 
                                className="w-full bg-primary absolute bottom-0 rounded-t-sm transition-all duration-500 group-hover:bg-primary-dark" 
                                style={{ height: `${data.new}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-semibold text-slate-400 group-hover:text-primary transition-colors">{data.day}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-6">
                      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Total this week</span>
                      <span className="text-xl font-black text-slate-900 dark:text-white">184 <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">Applicants</span></span>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {activeTab === 'jobs' && (
            <div className="flex flex-col gap-6">
              <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Job Vacancies</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your active listings and candidate applications</p>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setActiveTab('company')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    View Profile
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Post New Job
                  </button>
                </div>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Active Listings</h3>
                    <span className="material-symbols-outlined text-primary text-xl bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">list_alt</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">12</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                    <span className="text-emerald-500 font-medium">2 New</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">this week</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Applicants</h3>
                    <span className="material-symbols-outlined text-primary text-xl bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">groups</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">1,208</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="material-symbols-outlined text-emerald-500 text-sm">trending_up</span>
                    <span className="text-emerald-500 font-medium">+45</span>
                    <span className="text-slate-500 dark:text-slate-400 text-xs ml-1">since last login</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">In Review</h3>
                    <span className="material-symbols-outlined text-orange-500 text-xl bg-orange-50 dark:bg-orange-900/20 p-1 rounded-lg">pending_actions</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">3</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="material-symbols-outlined text-orange-500 text-sm">schedule</span>
                    <span className="text-orange-500 font-medium">Pending Approval</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-card-dark p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">Interviews</h3>
                    <span className="material-symbols-outlined text-primary text-xl bg-blue-50 dark:bg-blue-900/20 p-1 rounded-lg">videocam</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white">8</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm">
                    <span className="text-slate-500 dark:text-slate-400 text-xs">Scheduled this week</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
                <button className="pb-3 border-b-2 border-primary text-primary font-bold text-sm">Active Jobs (12)</button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">Pending Review (3)</button>
                <button className="pb-3 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm transition-colors">Closed (45)</button>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white transition-all shadow-sm" placeholder="Search job titles or locations..." type="text"/>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-white">
                    <span className="material-symbols-outlined text-[18px]">filter_list</span>
                    Filter
                  </button>
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm text-slate-700 dark:text-white">
                    <span className="material-symbols-outlined text-[18px]">sort</span>
                    Sort
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                        <th className="px-6 py-4">Job Title</th>
                        <th className="px-6 py-4">Department</th>
                        <th className="px-6 py-4">Posted Date</th>
                        <th className="px-6 py-4">Applicants</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                      {[
                        { title: 'Junior Frontend Developer', type: 'Remote • Full-time', dept: 'Engineering', date: 'Oct 24, 2023', total: 45, extra: 42, status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', statusDot: 'bg-emerald-500', icon: 'code', iconColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
                        { title: 'UX/UI Design Intern', type: 'New York, NY • Internship', dept: 'Product Design', date: 'Oct 20, 2023', total: 115, extra: 112, status: 'Active', statusColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', statusDot: 'bg-emerald-500', icon: 'palette', iconColor: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' },
                        { title: 'Marketing Specialist', type: 'London, UK • Contract', dept: 'Marketing', date: 'Oct 18, 2023', total: 21, extra: 18, status: 'Paused', statusColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', statusDot: 'bg-amber-500', icon: 'campaign', iconColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
                        { title: 'Data Analyst', type: 'Remote • Full-time', dept: 'Data Science', date: 'Sep 15, 2023', total: 92, extra: 88, status: 'Closed', statusColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400', statusDot: 'bg-slate-500', icon: 'analytics', iconColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400' },
                      ].map((job, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg ${job.iconColor} flex items-center justify-center shrink-0`}>
                                <span className="material-symbols-outlined text-[20px]">{job.icon}</span>
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{job.title}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">{job.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{job.dept}</td>
                          <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{job.date}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex -space-x-2">
                                <div className="w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-600 border-2 border-white dark:border-card-dark"></div>
                                <div className="w-7 h-7 rounded-full bg-slate-400 dark:bg-slate-500 border-2 border-white dark:border-card-dark"></div>
                                <div className="w-7 h-7 rounded-full bg-slate-500 dark:bg-slate-400 border-2 border-white dark:border-card-dark flex items-center justify-center text-[10px] text-white font-bold">+{job.extra}</div>
                              </div>
                              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{job.total} Total</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${job.statusColor}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${job.statusDot}`}></span>
                              {job.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2 text-slate-500 dark:text-slate-400">
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="View Applicants">
                                <span className="material-symbols-outlined text-[20px]">group</span>
                              </button>
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Edit">
                                <span className="material-symbols-outlined text-[20px]">edit</span>
                              </button>
                              <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="More">
                                <span className="material-symbols-outlined text-[20px]">more_vert</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-bold text-slate-900 dark:text-white">1-4</span> of <span className="font-bold text-slate-900 dark:text-white">12</span> active listings</p>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" disabled>Previous</button>
                    <button className="px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div className="flex flex-col gap-8">
              {/* ... (Student Profiles content remains unchanged) ... */}
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Applicants</h1>
                  <p className="text-slate-500 dark:text-slate-400">Manage your active candidate pipeline for Junior Frontend Developer.</p>
                </div>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark text-slate-700 dark:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm shadow-sm">
                    <span className="material-symbols-outlined text-[20px]">download</span>
                    Export List
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-bold text-sm shadow-sm shadow-primary/30">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    Add Candidate
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
                  <div className="w-full lg:w-64">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 material-symbols-outlined text-[20px]">work</span>
                      <select className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary cursor-pointer">
                        <option>Junior Frontend Developer</option>
                        <option>UX/UI Design Intern</option>
                        <option>Marketing Associate</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex overflow-x-auto pb-2 lg:pb-0 gap-1 no-scrollbar w-full lg:w-auto border-b lg:border-none border-slate-200 dark:border-slate-800">
                    <button className="whitespace-nowrap px-4 py-2 text-primary border-b-2 border-primary font-bold text-sm">All Applicants <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">45</span></button>
                    <button className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm">New <span className="ml-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">12</span></button>
                    <button className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm">Screening <span className="ml-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">8</span></button>
                    <button className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm">Interview <span className="ml-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">4</span></button>
                    <button className="whitespace-nowrap px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium text-sm">Offer <span className="ml-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs">1</span></button>
                  </div>
                  <div className="flex gap-2 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                      <input className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary placeholder-slate-500 dark:placeholder-slate-400 font-medium" placeholder="Search by name, university..." type="text"/>
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-500 dark:text-slate-400 text-[20px]">search</span>
                    </div>
                    <button className="px-3 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 transition-colors border border-transparent dark:border-slate-700">
                      <span className="material-symbols-outlined text-[20px]">filter_list</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {[
                  { 
                    name: "Sarah Chen", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVQuPqac2gDtLx9iVWV4rPJXRxfh_i2kwg99XHwGBI4hyUGepnLTPRVPNY7gm9PIX3Zx2RK5UB6HLcS8dPxjbS-Sl3o0HOVPxF2Ce0d46UPPMSDC9ew3cHNECzg-qhMr5HQjnQ2vRhQ-jYRZzwBV6uBRyfHDM551wkk2yX46MsHSSgf6tw5qcGqNa2hL2yQp6FtcwPZdOnLre0kKQ3-a_FoCNun7pc2ELLc_FMzoF4z6qUL6jfckauRp1TsWxAAkjYcat2j7Mlftw", 
                    time: "Applied 2h ago", 
                    match: "95% Match", 
                    matchColor: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    school: "Stanford University",
                    degree: "B.S. Computer Science",
                    location: "San Francisco, CA",
                    skills: ["React", "TypeScript", "Figma"],
                    primaryAction: "Review",
                    secondaryAction: "close",
                    tertiaryAction: "favorite_border"
                  },
                  { 
                    name: "Marcus Johnson", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCXC8GAX_KmKEteb-7sCgY7o6T4_J4Rno6US6PB4qOj5qIRa1ECeTuU9K9Xf18SI_zmvTAFKU1aObqBjff0Qx1XHkWxVHEt6CKTdVYWbnXfcJHABC_RRJeSDayTeP5i2m7YxE5SaiJqhllicvLhwK4DmPIQLE2OkXHkcRd5avjq62dRDxQE6Xe3vwUyePYHxlqq-dqXbnpu4YBwarCV_Pic-M2JZ3wr6Mml3NekGf0PmEWwAoUXgTrSwRAwtTlOexMp91ENPkGS9VQ", 
                    time: "Applied 1d ago", 
                    match: "88% Match", 
                    matchColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    school: "MIT",
                    degree: "M.S. Software Engineering",
                    location: "Boston, MA",
                    skills: ["Python", "Django", "AWS"],
                    primaryAction: "Invite to Interview",
                    secondaryAction: "visibility",
                    primaryStyle: "outline"
                  },
                  { 
                    name: "Emily Davis", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCbLa02ZXIxOmHQfEk7QQbx_wWQPs4G8HMyQO5s2E5elEuMzXTtvxvIZYmoGZXDXTvH53foEM5ofOa-ng3zHvx3xYb14NavyntOeMTJhTRVIqKI4usKpP8H-ZoG1KG4NlaftO-XGuoMYshfAigi3UJwxHsk2atojVMbDUqFuFRPdsRN4X7puTzd1Uy_Oh3wRoorFrdXGx00KSstaheutSbXk8M04H8M80KItgcsFHliVhozX85haYtAZTLdBoposvo7jJsTTczvqMQ", 
                    time: "Applied 2d ago", 
                    match: "Potential", 
                    matchColor: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                    school: "UC Berkeley",
                    degree: "B.A. Design",
                    location: "Remote",
                    skills: ["UI/UX", "Prototyping"],
                    primaryAction: "Move to Stage 1",
                    secondaryAction: "more_horiz",
                  },
                  { 
                    name: "David Kim", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBH38d6uSlROjTMUCrSabiQLg7JNlB1Qo1Fsb3kkfT4IbmC-hJiuIDyxa1iGElUxvQZpyAqzjQQ9jxZCvhIquEDjPxuaBCnA_jQO0iJcEOVY96sH87vi65JPOmkf4bieGO_NnkXzHdULRbOdzQGXX2-Zzqe1WQ7ElqcNv-i2eiDgJmr7pRp7GWzPV1apzNIaEj3W19Z2BRWgKFQ2p8r51bsVMdkQR46momyPzpDdYvGHeaARzZtnJ4xyEop2YtmO9-rxe8xe3plhn0", 
                    time: "Applied 3d ago", 
                    match: "New", 
                    matchColor: "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-400",
                    school: "University of Washington",
                    degree: "B.S. Informatics",
                    location: "Seattle, WA",
                    skills: ["Java", "SQL", "Data Analysis"],
                    primaryAction: "Review",
                    secondaryAction: "close",
                    tertiaryAction: "favorite_border"
                  },
                  { 
                    name: "Amanda Lowery", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvw8LaZ_ogadPkdN6dPUVCjSxVEzrY9guQ0Hfg5-5pt7ntHaZiOqm3F4JbnSZK0EGdDIY6Hw8MyGsN6V8py0xThB9TxwzYGc_uFKzJEz9k9DEe2LjL8WLptBYFRt7vW_dsrl06V7cbCPFdXJWZ5fZnDxofglIYwpaeiztOCvyXjclefdQYvtBc_Dgo5qd1W4DTMO1cXUV0L_Rvr8kj3Db4JJHO15uuybwyGoaaEsDTi_-S5DTK0080KYnyJ5AgDIFdjgu27H4V0Xw", 
                    time: "Applied 4d ago", 
                    match: "Rejected", 
                    matchColor: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                    school: "NYU",
                    degree: "B.A. Communications",
                    location: "New York, NY",
                    skills: ["Social Media", "SEO"],
                    primaryAction: "Reconsider",
                    secondaryAction: "visibility",
                    disabled: true,
                    opacity: true
                  },
                  { 
                    name: "James Wilson", 
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnDv7H-Go45Z12Kz_efFt16OxHRjGPxW9WgviKtcFDqksNJdYlpQsuoTcY_71Nr7AP-M5XCHKDFSDxDQiAB8zpxqUSAzyqcxE2zgjO9uamYBt_E6jNQW-WzmyV26GnuR-Q678XHlhBq8Z_v6M31aucR_5Dyb30mLnkc5GKuZJfsxnlSo1GMCge_hAjGl4kDk4ZuSqWXpoLn7XjiY_mGcaTyuUzusArHeOJUQrpdoz5QMVCzm7rOE3vnx1RnOSZLSOWp9ZAmvV4V4M", 
                    time: "Applied 5d ago", 
                    match: "Stage 2", 
                    matchColor: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
                    school: "Georgia Tech",
                    degree: "B.S. Computer Engineering",
                    location: "Atlanta, GA",
                    skills: ["C++", "Embedded", "Linux"],
                    primaryAction: "Schedule Interview",
                    secondaryAction: "chat_bubble_outline",
                  }
                ].map((candidate, idx) => (
                  <div key={idx} className={`bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow group ${candidate.opacity ? 'opacity-60' : ''}`}>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <img alt={candidate.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-700" src={candidate.img} />
                          <div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{candidate.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{candidate.time}</p>
                          </div>
                        </div>
                        <span className={`${candidate.matchColor} text-xs px-2 py-1 rounded-full font-medium`}>{candidate.match}</span>
                      </div>
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">school</span>
                          <span>{candidate.school}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">menu_book</span>
                          <span>{candidate.degree}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">location_on</span>
                          <span>{candidate.location}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {candidate.skills.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs rounded-md font-medium">{skill}</span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            candidate.disabled 
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                              : candidate.primaryStyle === 'outline'
                                ? 'bg-white dark:bg-card-dark border border-primary text-primary hover:bg-blue-50 dark:hover:bg-blue-900/20'
                                : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                          disabled={candidate.disabled}
                        >
                          {candidate.primaryAction}
                        </button>
                        <button className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="View Profile">
                          <span className="material-symbols-outlined text-[20px]">{candidate.secondaryAction}</span>
                        </button>
                        {candidate.tertiaryAction && (
                          <button className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" title="Action">
                            <span className="material-symbols-outlined text-[20px]">{candidate.tertiaryAction}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Showing <span className="font-bold text-slate-900 dark:text-white">1</span> to <span className="font-bold text-slate-900 dark:text-white">6</span> of <span className="font-bold text-slate-900 dark:text-white">45</span> applicants
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
                  <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-lg text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div className="max-w-5xl mx-auto">
              {/* ... (Company Profile content remains unchanged) ... */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Company Profile</h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your company information visible to candidates.</p>
                </div>
                <div className="flex space-x-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-card-dark border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    View Public Profile
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30">
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Save Changes
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">General Information</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">business</span>
                    </div>
                    <div className="p-6 space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="flex-shrink-0">
                          <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Company Logo</label>
                          <div className="group relative w-32 h-32 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary cursor-pointer bg-slate-50 dark:bg-slate-800/50 transition-colors flex flex-col items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center mb-2 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                              <span className="material-symbols-outlined text-[24px] text-slate-500 dark:text-slate-400 group-hover:text-primary">cloud_upload</span>
                            </div>
                            <span className="text-xs text-center text-slate-500 dark:text-slate-400 px-2 group-hover:text-primary">Click to upload</span>
                          </div>
                        </div>
                        <div className="flex-grow space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="companyName">Company Name</label>
                            <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="companyName" type="text" defaultValue="TechFlow Inc." />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="tagline">Tagline</label>
                            <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="tagline" placeholder="e.g. Innovating the future of tech" type="text" />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="industry">Industry</label>
                          <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5">
                            <option>Software Development</option>
                            <option>Fintech</option>
                            <option>Healthcare</option>
                            <option>Education</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="size">Company Size</label>
                          <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5">
                            <option>1-10 employees</option>
                            <option selected>11-50 employees</option>
                            <option>51-200 employees</option>
                            <option>201-500 employees</option>
                            <option>500+ employees</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">About Company</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">description</span>
                    </div>
                    <div className="p-6">
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Write a compelling description of your company culture, mission, and what makes it a great place to work. This helps attract the right candidates.
                      </p>
                      <div className="relative">
                        <textarea className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-3 min-h-[160px]" id="about" placeholder="Tell us about your company..."></textarea>
                        <div className="absolute bottom-3 right-3 text-xs text-slate-400">
                          0 / 2000
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">Headquarters</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">place</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="address">Address</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="address" placeholder="123 Innovation Dr" type="text" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="city">City</label>
                          <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="city" placeholder="San Francisco" type="text" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="state">State/Region</label>
                          <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="state" placeholder="CA" type="text" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="country">Country</label>
                        <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="country">
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Germany</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                      <h3 className="font-bold text-slate-900 dark:text-white">Online Presence</h3>
                      <span className="material-symbols-outlined text-slate-400 text-[20px]">public</span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="website">Website URL</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="material-symbols-outlined text-slate-400 text-[18px]">language</span>
                          </div>
                          <input className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="website" placeholder="https://www.company.com" type="text" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="linkedin">LinkedIn Profile</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-slate-400 fill-current" viewBox="0 0 24 24">
                              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                            </svg>
                          </div>
                          <input className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="linkedin" placeholder="https://linkedin.com/company/..." type="text" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="twitter">Twitter / X</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <svg className="h-4 w-4 text-slate-400 fill-current" viewBox="0 0 24 24">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                            </svg>
                          </div>
                          <input className="block w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 pl-10 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="twitter" placeholder="@companyhandle" type="text" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Employer Account Settings</h2>
                <p className="text-slate-500 dark:text-slate-400">Manage your personal information and security preferences.</p>
              </div>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Personal Info Card */}
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">Personal Information</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Update your photo and personal details here.</p>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Photo */}
                    <div className="flex items-center gap-6">
                      <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden border-2 border-white dark:border-slate-600 shadow-sm">
                          <img alt="Profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAgpCl8l0S9hceP4XWyZr3ckYiPPT0jnv-Jkh7E02HLQSd_o7ddFaftnc_8GBom4DK8xaBFaAkg3P5mMPJFm1SoGXF_aUlP6lGw9obItvgBPAsrl_DjUn_ETtYCf70TomtcCzDl14aBfsX0D7YWi4UqOa-WobZUvFae7748s-sI0Rja19Rau6rMsrL-E9s9g-aRHpKruXbuOD-UT3uCkAluvIo-GXeLsM0Paq_RQKxN60g9OXnV3NuEjiC16n1ayQAKwrnRL1BZhWw" />
                        </div>
                        <button type="button" className="absolute bottom-0 right-0 bg-primary hover:bg-primary-dark text-white p-1.5 rounded-full shadow-md transition-colors border-2 border-white dark:border-card-dark">
                          <span className="material-symbols-outlined text-[14px] block">edit</span>
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Profile Photo</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Accepts JPG, GIF or PNG. Max size of 800K</p>
                      </div>
                    </div>
                    {/* Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="firstName">First Name</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="firstName" type="text" defaultValue="Sarah" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="lastName">Last Name</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="lastName" type="text" defaultValue="Wilson" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="email">Email Address</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                          </div>
                          <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 shadow-sm text-sm p-2.5 pl-10 cursor-not-allowed" disabled readOnly type="email" defaultValue="sarah.wilson@techflow.com" />
                        </div>
                        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">Contact support to change your email address.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Card */}
                <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className="font-bold text-slate-900 dark:text-white">Security</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Ensure your account is secure by using a strong password.</p>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="currentPassword">Current Password</label>
                        <input className="w-full md:w-1/2 rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="currentPassword" type="password" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="newPassword">New Password</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="newPassword" type="password" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1" htmlFor="confirmPassword">Confirm New Password</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm p-2.5" id="confirmPassword" type="password" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <button className="flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold rounded-lg text-red-600 dark:text-red-400 bg-white dark:bg-card-dark hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" type="button" onClick={() => navigateTo(Screen.SIGN_IN)}>
                    <span className="material-symbols-outlined text-[18px] mr-2">logout</span>
                    Log out
                  </button>
                  <div className="flex items-center gap-3">
                    <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-bold rounded-lg text-slate-700 dark:text-white bg-white dark:bg-card-dark hover:bg-slate-50 dark:hover:bg-white/5 transition-colors" type="button">
                      Cancel
                    </button>
                    <button className="px-6 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors shadow-primary/30" type="submit">
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
              
              <div className="text-center pt-8 pb-4">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Protected by StudentOS Security. Changes will be reflected across your employer profile immediately.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
