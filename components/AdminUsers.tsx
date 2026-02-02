
import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';

export default function AdminUsers({ navigateTo }: NavigationProps) {
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
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Users" : ""}
              >
                <span className="material-symbols-outlined fill-1">group</span>
                {isSidebarExpanded && <span className="text-sm font-semibold whitespace-nowrap">Users</span>}
              </button>
              <button 
                onClick={() => navigateTo(Screen.ADMIN_SCHOLARSHIPS)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Scholarships" : ""}
              >
                <span className="material-symbols-outlined">school</span>
                {isSidebarExpanded && <span className="text-sm font-medium whitespace-nowrap">Scholarships</span>}
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
        <div className="mx-auto w-full max-w-7xl px-8 py-8">
          <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">User Management</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Manage all registered accounts, roles, and access status.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[300px]">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-xl">search</span>
                <input className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-slate-900 dark:text-white" placeholder="Search users by name, email..." type="text"/>
              </div>
              <div className="flex gap-2">
                <select className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
                  <option>All Roles</option>
                  <option>Student</option>
                  <option>Educator</option>
                  <option>Employer</option>
                </select>
                <select className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary">
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Banned</option>
                </select>
              </div>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark transition-colors shadow-sm">
                <span className="material-symbols-outlined text-lg">download</span>
                Export Users
              </button>
            </div>
          </header>
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Users</p>
                <span className="material-symbols-outlined text-primary/80 text-xl bg-primary/10 p-1.5 rounded-lg">groups</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">24,512</p>
                <span className="mb-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                  <span className="material-symbols-outlined text-xs">trending_up</span> 12%
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Students</p>
                <span className="material-symbols-outlined text-emerald-500/80 text-xl bg-emerald-500/10 p-1.5 rounded-lg">person</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">18,290</p>
                <span className="mb-1 text-xs text-slate-500 dark:text-slate-400">75% total</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Educators</p>
                <span className="material-symbols-outlined text-orange-500/80 text-xl bg-orange-500/10 p-1.5 rounded-lg">history_edu</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">3,420</p>
                <span className="mb-1 text-xs text-slate-500 dark:text-slate-400">+48 this week</span>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Org. Admins</p>
                <span className="material-symbols-outlined text-purple-500/80 text-xl bg-purple-500/10 p-1.5 rounded-lg">corporate_fare</span>
              </div>
              <div className="flex items-end gap-3">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">2,802</p>
                <span className="mb-1 text-xs text-slate-500 dark:text-slate-400">85 Active</span>
              </div>
            </div>
          </section>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-200 dark:border-slate-700 bg-gray-50 dark:bg-white/5">
                  <tr>
                    <th className="w-12 px-6 py-4">
                      <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                    </th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Avatar & Name</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Email Address</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Role</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Registration</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBtQmuzvQbO1EpbWRcvkQV1CD9TUoWEhO_Tz7-W8oiC-PCTsna13FXiWynhXhuP916PZwhDi-TEVxfWv6PtlF4x_Qy_wn95BzAqy7tCES1OVg2foqNHAUU07KnIIoZGg8-43qWcU0rQBkdqGsB4qDkDkXDy7O1UhevYKnmhZEUl7XQI5WyoXUPc5sgXoByjzX-i_rPcqpBny7L4SxaVHcBG0iS5M8lpYZrsh5lRG9MXyP3QHvExR6kUV51KqhZ7xTnjNod4jEygk48')" }}></div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Alex Rivera</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">a.rivera@university.edu</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Student
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 24, 2023</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">SM</div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Sarah Mitchell</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">s.mitchell@academy.org</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                        Educator
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 22, 2023</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAgpCl8l0S9hceP4XWyZr3ckYiPPT0jnv-Jkh7E02HLQSd_o7ddFaftnc_8GBom4DK8xaBFaAkg3P5mMPJFm1SoGXF_aUlP6lGw9obItvgBPAsrl_DjUn_ETtYCf70TomtcCzDl14aBfsX0D7YWi4UqOa-WobZUvFae7748s-sI0Rja19Rau6rMsrL-E9s9g-aRHpKruXbuOD-UT3uCkAluvIo-GXeLsM0Paq_RQKxN60g9OXnV3NuEjiC16n1ayQAKwrnRL1BZhWw')" }}></div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">David Chen</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">d.chen@globaltech.com</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                        Employer
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 19, 2023</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                        Inactive
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">MK</div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Marcus King</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">marcus.k@provider.net</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Student
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 15, 2023</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>
                        Banned
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 flex-shrink-0 rounded-full bg-cover bg-center border border-slate-200 dark:border-slate-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuz7qhWBsQWRjQG1k4CGzFYXhvsFourXvcGFagkS8Ygc6l63kf_qKcXMNXo-XVoFmsea9D7RojO2v9OQMLgttwk1_1u0Sefnl9iGveWDk1yjDa_QNz60aKEgmugT98Txyt38TOYyQMofKNHNsNclFGBFIyOx-Pp3k9dCugBZvO2F-jiAog2elvqhTUfgxkZ76fxUGvaAwgKP6ELOG_Pjri33lWH4w8m1KEmJ6TIWTLY4NQXPNvKCff1WFCaRn_73oR3o1z2hQVLt4')" }}></div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">Elena Gilbert</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-500 dark:text-slate-400">e.gilbert@uni.edu</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        Student
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 12, 2023</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">Showing <span className="font-semibold">1-5</span> of <span className="font-semibold">24,512</span> users</p>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50" disabled={true}>Previous</button>
                <div className="flex items-center gap-1">
                  <button className="h-8 w-8 rounded-lg bg-primary text-white text-xs font-bold">1</button>
                  <button className="h-8 w-8 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold dark:text-slate-400">2</button>
                  <button className="h-8 w-8 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold dark:text-slate-400">3</button>
                  <span className="px-1 text-slate-500 dark:text-slate-400">...</span>
                  <button className="h-8 w-8 rounded-lg text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 text-xs font-bold dark:text-slate-400">48</button>
                </div>
                <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">Next</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
