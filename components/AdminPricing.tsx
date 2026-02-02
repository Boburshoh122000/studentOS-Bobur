
import React, { useState } from 'react';
import { Screen, NavigationProps } from '../types';

export default function AdminPricing({ navigateTo }: NavigationProps) {
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
                className={`flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20 transition-colors w-full ${!isSidebarExpanded ? 'justify-center' : 'text-left'}`}
                title={!isSidebarExpanded ? "Pricing" : ""}
              >
                <span className="material-symbols-outlined fill-1">payments</span>
                {isSidebarExpanded && <span className="text-sm font-semibold whitespace-nowrap">Pricing</span>}
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
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Tool Pricing Management</h2>
              <p className="text-base text-slate-500 dark:text-slate-400">Configure prices, plans, and discounts for platform tools</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-4 py-2 text-sm font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-lg">history</span>
                <span>View Audit Log</span>
              </button>
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Add New Tool</span>
              </button>
            </div>
          </header>
          <section className="mb-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Global Configuration</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Manage default currency and promotional discount settings</p>
              </div>
              <button className="text-sm font-semibold text-primary dark:text-primary-dark hover:underline">Manage Currencies</button>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Default Currency</label>
                <select className="form-select rounded-lg border-slate-200 bg-[#f6f6f8] py-2 text-sm font-medium text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-white/5 dark:text-white w-full">
                  <option value="USD">USD - US Dollar ($)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                  <option value="GBP">GBP - British Pound (£)</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Global Student Discount</label>
                <div className="relative">
                  <input className="w-full rounded-lg border-slate-200 bg-[#f6f6f8] py-2 pl-3 pr-8 text-sm font-medium text-slate-900 focus:border-primary focus:ring-primary dark:border-slate-700 dark:bg-white/5 dark:text-white" type="number" defaultValue="50"/>
                  <span className="absolute right-3 top-2 text-sm text-slate-500 dark:text-slate-400">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Early Bird Access</label>
                <div className="flex items-center gap-3 py-2">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input defaultChecked={true} className="peer sr-only" type="checkbox"/>
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                    <span className="ml-3 text-sm font-medium text-slate-900 dark:text-white">Active</span>
                  </label>
                </div>
              </div>
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-8">
                <button className="relative pb-4 text-sm font-bold text-primary dark:text-primary-dark">
                  Pricing Plans
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Discount Coupons
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Bundles
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">search</span>
                <input className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none" placeholder="Search tools..." type="text"/>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined text-lg">filter_list</span>
                  Filter: All Plans
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
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tool Name</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Category</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan Type</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Current Price</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Last Updated</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold">
                            <span className="material-symbols-outlined">description</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">CV Maker Pro</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Resume Builder</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">Career Tools</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                          Paid Subscription
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">$12.00 <span className="text-xs text-slate-500 font-normal">/mo</span></td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 24, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-1.5 text-primary hover:bg-indigo-50 dark:text-primary dark:hover:bg-indigo-900/20 transition-colors" title="Edit Price">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <div className="flex items-center">
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input defaultChecked={true} className="peer sr-only" type="checkbox"/>
                              <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <input className="h-4 w-4 rounded border-slate-200 text-primary focus:ring-primary dark:border-slate-700 dark:bg-white/10" type="checkbox"/>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 font-bold">
                            <span className="material-symbols-outlined">work_outline</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Job Finder Basic</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Standard Job Board Access</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">Recruitment</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          Free Tier
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">$0.00</td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Sep 15, 2023</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-1.5 text-primary hover:bg-indigo-50 dark:text-primary dark:hover:bg-indigo-900/20 transition-colors" title="Edit Price">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <div className="flex items-center">
                            <label className="relative inline-flex cursor-pointer items-center">
                              <input defaultChecked={true} className="peer sr-only" type="checkbox"/>
                              <div className="peer h-5 w-9 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-500 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none dark:bg-gray-700"></div>
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">Showing 1-2 of 12 tools</p>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white disabled:opacity-50" disabled={true}>Previous</button>
                  <button className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-slate-900 dark:text-white">Next</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
