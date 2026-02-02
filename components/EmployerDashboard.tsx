
import React from 'react';
import { Screen, NavigationProps } from '../types';

export default function EmployerDashboard({ navigateTo }: NavigationProps) {
  return (
    <div className="flex h-screen w-full bg-background-light dark:bg-background-dark text-text-main dark:text-white font-display overflow-hidden">
      <aside className="flex w-72 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2330] transition-colors duration-200">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3 px-2 cursor-pointer" onClick={() => navigateTo(Screen.LANDING)}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
                <span className="material-symbols-outlined text-2xl">school</span>
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">StudentOS</h1>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Employer Console</p>
              </div>
            </div>
            <nav className="flex flex-col gap-1">
              <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="#">
                <span className="material-symbols-outlined">dashboard</span>
                <span className="text-sm font-medium">Dashboard</span>
              </a>
              <a className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2.5 text-primary dark:text-white dark:bg-primary/20" href="#">
                <span className="material-symbols-outlined fill-1">work_history</span>
                <span className="text-sm font-semibold">My Jobs</span>
              </a>
              <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="#">
                <span className="material-symbols-outlined">person_search</span>
                <span className="text-sm font-medium">Student Profiles</span>
              </a>
              <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="#">
                <span className="material-symbols-outlined">business</span>
                <span className="text-sm font-medium">Company Profile</span>
              </a>
              <a className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors" href="#">
                <span className="material-symbols-outlined">settings</span>
                <span className="text-sm font-medium">Settings</span>
              </a>
            </nav>
          </div>
          <div className="flex flex-col gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
            <div className="flex items-center gap-3 px-2">
              <div className="h-10 w-10 rounded-full bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAgpCl8l0S9hceP4XWyZr3ckYiPPT0jnv-Jkh7E02HLQSd_o7ddFaftnc_8GBom4DK8xaBFaAkg3P5mMPJFm1SoGXF_aUlP6lGw9obItvgBPAsrl_DjUn_ETtYCf70TomtcCzDl14aBfsX0D7YWi4UqOa-WobZUvFae7748s-sI0Rja19Rau6rMsrL-E9s9g-aRHpKruXbuOD-UT3uCkAluvIo-GXeLsM0Paq_RQKxN60g9OXnV3NuEjiC16n1ayQAKwrnRL1BZhWw')" }}></div>
              <div className="flex flex-col">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">TechFlow HR</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Hiring Manager</p>
              </div>
            </div>
            <button onClick={() => navigateTo(Screen.SIGN_IN)} className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-100 dark:bg-white/5 p-2 text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-lg">logout</span>
              Logout
            </button>
          </div>
        </div>
      </aside>
      <main className="flex flex-1 flex-col overflow-y-auto bg-[#f6f6f8] dark:bg-[#111421]">
        <div className="mx-auto w-full max-w-7xl px-6 py-8">
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Job Vacancies</h2>
              <p className="text-base text-slate-500 dark:text-slate-400">Manage your active listings and candidate applications</p>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm shadow-primary/30">
                <span className="material-symbols-outlined text-lg">add</span>
                <span>Post New Job</span>
              </button>
            </div>
          </header>
          <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Listings</p>
                <span className="material-symbols-outlined text-primary/60 dark:text-primary-dark/60 text-xl">list_alt</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">12</p>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-base">trending_up</span>
                <span>2 New</span>
                <span className="font-normal text-slate-500 dark:text-slate-400 ml-1">this week</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Applicants</p>
                <span className="material-symbols-outlined text-primary/60 dark:text-primary-dark/60 text-xl">group</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">1,208</p>
              <div className="flex items-center gap-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                <span className="material-symbols-outlined text-base">trending_up</span>
                <span>+45</span>
                <span className="font-normal text-slate-500 dark:text-slate-400 ml-1">since last login</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 h-1 w-full bg-orange-500"></div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">In Review</p>
                <span className="material-symbols-outlined text-orange-500/80 text-xl">pending_actions</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">3</p>
              <div className="flex items-center gap-1 text-sm font-medium text-orange-600 dark:text-orange-400">
                <span className="material-symbols-outlined text-base">schedule</span>
                <span>Pending Approval</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Interviews</p>
                <span className="material-symbols-outlined text-primary/60 dark:text-primary-dark/60 text-xl">video_call</span>
              </div>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">8</p>
              <div className="flex items-center gap-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span>Scheduled this week</span>
              </div>
            </div>
          </section>
          <section className="flex flex-col gap-4">
            <div className="border-b border-slate-200 dark:border-slate-700">
              <div className="flex gap-8">
                <button className="relative pb-4 text-sm font-bold text-primary dark:text-primary-dark">
                  Active Jobs (12)
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-primary dark:bg-primary-dark"></span>
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Pending Review (3)
                </button>
                <button className="pb-4 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                  Closed (45)
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 py-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-3 py-2 shadow-sm max-w-md">
                <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">search</span>
                <input className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none" placeholder="Search job titles or locations..." type="text"/>
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
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Job Title</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Department</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Posted Date</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Applicants</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 font-bold">
                            <span className="material-symbols-outlined text-xl">code</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">Junior Frontend Developer</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Remote • Full-time</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900 dark:text-white">Engineering</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 24, 2023</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1e2330] bg-gray-300"></div>
                            <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1e2330] bg-gray-400"></div>
                            <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1e2330] bg-gray-500 flex items-center justify-center text-[10px] text-white font-medium">+42</div>
                          </div>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">45 Total</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" title="View Applicants">
                            <span className="material-symbols-outlined">group</span>
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" title="Edit Job">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" title="More Options">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300 font-bold">
                            <span className="material-symbols-outlined text-xl">palette</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">UX/UI Design Intern</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">New York, NY • Internship</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-slate-900 dark:text-white">Product Design</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">Oct 20, 2023</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1e2330] bg-gray-300"></div>
                            <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1e2330] bg-gray-400"></div>
                            <div className="h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#1e2330] bg-gray-500 flex items-center justify-center text-[10px] text-white font-medium">+112</div>
                          </div>
                          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">115 Total</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" title="View Applicants">
                            <span className="material-symbols-outlined">group</span>
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" title="Edit Job">
                            <span className="material-symbols-outlined">edit</span>
                          </button>
                          <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10 transition-colors" title="More Options">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1e2330] px-6 py-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">Showing 1-4 of 12 active listings</p>
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