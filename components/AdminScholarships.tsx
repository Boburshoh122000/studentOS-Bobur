
import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';

export default function AdminScholarships({ navigateTo }: NavigationProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      <aside className={`${isSidebarExpanded ? 'w-72' : 'w-20'} flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-all duration-300 relative z-20`}>
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="absolute -right-3 top-9 bg-white dark:bg-[#1e2330] border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-full p-1 shadow-md transition-colors z-50 flex items-center justify-center size-6"
        >
          <span className="material-symbols-outlined text-[14px]">{isSidebarExpanded ? 'chevron_left' : 'chevron_right'}</span>
        </button>

        <div className="flex h-full flex-col justify-between p-4 overflow-hidden">
          <div className="flex flex-col gap-6">
            <div className={`flex items-center gap-3 px-2 cursor-pointer ${!isSidebarExpanded && 'justify-center px-0'}`} onClick={() => navigateTo(Screen.LANDING)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white whitespace-nowrap">StudentOS</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Admin Console</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => navigateTo(Screen.ADMIN_DASHBOARD)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Dashboard" : ""}
              >
                <span className="material-symbols-outlined">dashboard</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Dashboard</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_EMPLOYERS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Employers" : ""}
              >
                <span className="material-symbols-outlined">work</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Employers</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_PRICING)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Pricing" : ""}
              >
                <span className="material-symbols-outlined">payments</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Pricing</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_USERS)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Users" : ""}
              >
                <span className="material-symbols-outlined">group</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Users</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Scholarships" : ""}
              >
                <span className="material-symbols-outlined fill-1">school</span>
                {isSidebarExpanded && <span className="text-sm font-semibold whitespace-nowrap">Scholarships</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_ROLES)} 
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Roles & Permissions" : ""}
              >
                <span className="material-symbols-outlined">admin_panel_settings</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Roles & Permissions</span>}
              </button>
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className={`flex items-center gap-3 px-2 ${!isSidebarExpanded && 'justify-center px-0'}`}>
              <div className="h-10 w-10 shrink-0 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuz7qhWBsQWRjQG1k4CGzFYXhvsFourXvcGFagkS8Ygc6l63kf_qKcXMNXo-XVoFmsea9D7RojO2v9OQMLgttwk1_1u0Sefnl9iGveWDk1yjDa_QNz60aKEgmugT98Txyt38TOYyQMofKNHNsNclFGBFIyOx-Pp3k9dCugBZvO2F-jiAog2elvqhTUfgxkZ76fxUGvaAwgKP6ELOG_Pjri33lWH4w8m1KEmJ6TIWTLY4NQXPNvKCff1WFCaRn_73oR3o1z2hQVLt4')" }}></div>
              <div className={`flex flex-col transition-opacity duration-200 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>
                <p className="text-sm font-semibold text-slate-900 dark:text-white whitespace-nowrap">Jane Doe</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Super Admin</p>
              </div>
            </div>
            <button 
              onClick={() => navigateTo(Screen.SIGN_IN)} 
              className={`flex w-full items-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors ${!isSidebarExpanded ? 'justify-center' : 'justify-center'}`}
              title={!isSidebarExpanded ? "Logout" : ""}
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              {isSidebarExpanded && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Scholarship Management</h2>
              <p className="text-base text-slate-500 dark:text-slate-400">Create, edit, and manage scholarship opportunities</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30 group">
                <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-300">add</span>
                <span>Add Scholarship</span>
              </button>
            </div>
          </header>
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Scholarships</p>
                <span className="material-symbols-outlined text-primary/60 dark:text-primary-dark/60 text-xl">check_circle</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">42</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Review</p>
                <span className="material-symbols-outlined text-orange-500/80 text-xl">pending_actions</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">8</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Funding</p>
                <span className="material-symbols-outlined text-emerald-600/80 text-xl">monetization_on</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">$1.2M</p>
            </div>
          </section>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3 flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4 py-2">
                <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
                  <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">search</span>
                  <input className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none" placeholder="Search scholarship, university..." type="text"/>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-lg">filter_list</span>
                    Filter
                  </button>
                  <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <span className="material-symbols-outlined text-lg">sort</span>
                    Sort
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-white/5">
                      <tr>
                        <th className="w-12 px-6 py-4">
                          <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                        </th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Scholarship Name / University</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Deadline</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Country</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Amount</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer">
                        <td className="px-6 py-4">
                          <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-bold">
                              <span className="material-symbols-outlined text-xl">school</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">Global Leaders Fellowship</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">Oxford University</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-white">Dec 15, 2024</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇬🇧</span> UK
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">$25,000</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Published
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                      <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer bg-primary/5 dark:bg-primary/10 border-l-4 border-primary">
                        <td className="px-6 py-4">
                          <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold">
                              <span className="material-symbols-outlined text-xl">science</span>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 dark:text-white">STEM Innovation Grant</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">MIT</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-slate-900 dark:text-white">Jan 30, 2025</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🇺🇸</span> USA
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">Full Tuition</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            <span className="h-1.5 w-1.5 rounded-full bg-gray-500"></span>
                            Draft
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                            <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                              <span className="material-symbols-outlined text-lg">more_vert</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Showing 1-2 of 50 scholarships</p>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50" disabled={true}>Previous</button>
                    <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">Next</button>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Quick Edit: STEM Innovation Grant</h3>
                  <div className="flex gap-2">
                    <button className="text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">Cancel</button>
                    <button className="text-sm font-bold text-primary hover:text-primary-dark">Save Changes</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Scholarship Title</label>
                      <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" defaultValue="STEM Innovation Grant"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">University</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" defaultValue="MIT"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Country</label>
                        <select className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all">
                          <option>USA</option>
                          <option>UK</option>
                          <option>Canada</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Eligibility Criteria</label>
                      <textarea className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" rows={3} defaultValue="Undergraduate students in Computer Science or Engineering with a GPA > 3.5."></textarea>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Funding Amount</label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                          <input className="w-full pl-7 rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" defaultValue="Full Tuition"/>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Deadline</label>
                        <input className="w-full rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="date" defaultValue="2025-01-30"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-1">Official Link</label>
                      <div className="flex gap-2">
                        <input className="flex-1 rounded-lg border-slate-200 dark:border-slate-700 bg-[#f6f6f8] dark:bg-white/5 p-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all" type="text" defaultValue="https://mit.edu/admissions/financial-aid"/>
                        <button className="px-3 py-2 bg-[#f6f6f8] dark:bg-white/5 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
                          <span className="material-symbols-outlined text-lg">open_in_new</span>
                        </button>
                      </div>
                    </div>
                    <div className="pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input className="w-4 h-4 text-primary rounded border-slate-200 dark:border-slate-700 focus:ring-primary" type="checkbox"/>
                        <span className="text-sm text-slate-900 dark:text-white">Highlight as Featured Scholarship</span>
                      </label>
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