import React, { useState, useEffect } from 'react';
import { Screen, NavigationProps } from '../types';
import { teamApi } from '../src/services/api';
import MinimalHeader from './MinimalHeader';

interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialWebsite: string | null;
  displayOrder: number;
}

export default function AboutUs({ navigateTo }: NavigationProps) {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isTeamLoading, setIsTeamLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await teamApi.list();
        if (data) setTeamMembers(data as TeamMember[]);
      } catch {
        /* silent fallback */
      }
      setIsTeamLoading(false);
    };
    fetchTeam();
  }, []);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-white overflow-x-hidden antialiased selection:bg-primary/30 selection:text-primary pt-28">
      <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root">
        {/* Global Header */}
        <MinimalHeader />
        <main className="flex flex-col items-center w-full">
          <div className="w-full max-w-[1200px] px-4 md:px-10 py-12 md:py-20">
            <div className="@container">
              <div className="flex flex-col-reverse gap-8 md:gap-16 lg:flex-row items-center">
                <div className="flex flex-col gap-6 flex-1 text-center lg:text-left items-center lg:items-start">
                  <div className="space-y-4">
                    <span className="inline-block px-3 py-1 text-xs font-bold tracking-wide text-primary uppercase bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      Our Vision
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
                      Empowering the next generation of leaders
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl">
                      We are building the operating system for your future career. Connecting
                      ambition with opportunity through technology.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const mission = document.getElementById('mission');
                      if (mission) mission.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="mt-2 flex items-center gap-2 h-12 px-6 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold transition-colors"
                  >
                    <span>See our story</span>
                    <span className="material-symbols-outlined text-sm">arrow_downward</span>
                  </button>
                </div>
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                  <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent z-10 mix-blend-overlay"></div>
                    <div
                      className="w-full h-full bg-cover bg-center transform hover:scale-105 transition-transform duration-700"
                      style={{
                        backgroundImage:
                          "url('https://lh3.googleusercontent.com/aida-public/AB6AXuD9W6rWzgSr7oymDSIL_c-R-mOjGoawmEqekCe7H8CBbPbAOPDkpTsAdFfClS8gKqK7Vui7xSUpVaQ9MUNs4bmCbok4W4p9SeOuE6rL-_Dd5rXaDb5fCncXlnPr2GQwaBSjVQANq8cBXKO5xoJFQ9lhOaCJ3Rh2yiDy8fKsi94wJM7sthAqIYBK8ptQ5icu-_RNlbScrawtcL5G2nds1XWP6DtPZeW3mRIUBF5QDANowZAPSidTtP84EAdt8krI3MZGUNl7j18iY-4')",
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            id="mission"
            className="w-full bg-white dark:bg-slate-900 py-20 border-y border-slate-100 dark:border-slate-800"
          >
            <div className="max-w-[800px] mx-auto px-4 md:px-10 text-center">
              <h2 className="text-primary text-sm font-bold tracking-widest uppercase mb-4">
                Our Mission
              </h2>
              <h3 className="text-2xl md:text-3xl font-bold leading-tight mb-6 text-slate-900 dark:text-white">
                Bridging the gap between education and execution.
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                We believe education shouldn't stop at the classroom door. StudentOS bridges the gap
                between academic achievement and professional success, providing the tools needed to
                navigate the modern career landscape with confidence and clarity.
              </p>
            </div>
          </div>
          <div className="w-full max-w-[1200px] px-4 md:px-10 py-20">
            <div className="flex flex-col gap-12">
              <div className="text-center md:text-left max-w-[720px]">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                  Core Values
                </h2>
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                  The principles that guide every feature we build and every decision we make.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">lightbulb</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                    Innovation
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    We are constantly pushing boundaries to find new solutions for age-old problems
                    in education tech.
                  </p>
                </div>
                <div className="group p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">accessibility_new</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">
                    Accessibility
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Tools designed for everyone, everywhere. We ensure our platform works for
                    students from all backgrounds.
                  </p>
                </div>
                <div className="group p-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-2xl">shield_person</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Trust</h3>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                    Your future is private. Data privacy, security, and transparency are our top
                    priorities.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full bg-slate-50 dark:bg-slate-900/50 py-20 border-y border-slate-100 dark:border-slate-800">
            <div className="max-w-[1200px] mx-auto px-4 md:px-10">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-slate-900 dark:text-white">
                  Meet the Team
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                  A diverse group of educators, engineers, and dreamers working together to reshape
                  the future of student success.
                </p>
              </div>

              {isTeamLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-md overflow-hidden animate-pulse"
                    >
                      <div className="aspect-[3/4] bg-slate-200 dark:bg-slate-700" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : teamMembers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                  <span className="material-symbols-outlined text-4xl mb-2 block">groups</span>
                  <p>Team info coming soon.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl overflow-hidden transition-shadow duration-300 h-full flex flex-col"
                    >
                      {/* Image area with hover social overlay */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {member.avatarUrl ? (
                          <img
                            src={member.avatarUrl}
                            alt={member.fullName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-4xl font-bold">
                            {member.fullName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        {/* Social overlay — fades in on hover */}
                        {(member.socialLinkedin ||
                          member.socialTwitter ||
                          member.socialWebsite) && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {member.socialLinkedin && (
                              <a
                                href={member.socialLinkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-white hover:bg-primary hover:text-white shadow-lg transition-all duration-200 hover:scale-110"
                                title="LinkedIn"
                              >
                                <span className="material-symbols-outlined text-[20px]">link</span>
                              </a>
                            )}
                            {member.socialTwitter && (
                              <a
                                href={member.socialTwitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-white hover:bg-primary hover:text-white shadow-lg transition-all duration-200 hover:scale-110"
                                title="Twitter"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  public
                                </span>
                              </a>
                            )}
                            {member.socialWebsite && (
                              <a
                                href={member.socialWebsite}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-white hover:bg-primary hover:text-white shadow-lg transition-all duration-200 hover:scale-110"
                                title="Website"
                              >
                                <span className="material-symbols-outlined text-[20px]">
                                  language
                                </span>
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                      {/* Text block */}
                      <div className="p-4 text-center flex flex-col items-center gap-1">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                          {member.fullName}
                        </h3>
                        <p className="text-sm font-medium text-primary">{member.role}</p>
                        {/* Mobile: always show social links below */}
                        <div className="flex gap-2 mt-1 sm:hidden">
                          {member.socialLinkedin && (
                            <a
                              href={member.socialLinkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">link</span>
                            </a>
                          )}
                          {member.socialTwitter && (
                            <a
                              href={member.socialTwitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">public</span>
                            </a>
                          )}
                          {member.socialWebsite && (
                            <a
                              href={member.socialWebsite}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-primary transition-colors"
                            >
                              <span className="material-symbols-outlined text-[20px]">
                                language
                              </span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="w-full px-4 md:px-10 py-16">
            <div className="max-w-[1200px] mx-auto rounded-3xl bg-primary text-white overflow-hidden relative shadow-2xl shadow-blue-500/20">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 50%, white 0%, transparent 40%), radial-gradient(circle at 80% 20%, white 0%, transparent 30%)',
                }}
              ></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-10 md:p-16 gap-8">
                <div className="flex flex-col gap-4 max-w-xl text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Ready to launch your career?
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Join thousands of students who are already building their future with StudentOS.
                  </p>
                </div>
                <div className="flex flex-shrink-0">
                  <button
                    onClick={() => navigateTo(Screen.SIGNUP_STEP_1)}
                    className="bg-white text-primary hover:bg-blue-50 transition-colors px-8 py-4 rounded-xl font-bold text-lg shadow-lg flex items-center gap-2 group"
                  >
                    <span>Join the community</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-[1200px] mx-auto px-4 md:px-10 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-4">
                  <span className="material-symbols-outlined text-primary">school</span>
                  <span className="font-bold text-lg">StudentOS</span>
                </div>
                <p className="text-slate-500 text-sm">
                  Building the operating system for your future career.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Product</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>
                    <button className="hover:text-primary transition-colors">Features</button>
                  </li>
                  <li>
                    <button className="hover:text-primary transition-colors">Pricing</button>
                  </li>
                  <li>
                    <button className="hover:text-primary transition-colors">Integrations</button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Company</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>
                    <button
                      onClick={() => navigateTo(Screen.ABOUT)}
                      className="hover:text-primary transition-colors"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button className="hover:text-primary transition-colors">Careers</button>
                  </li>
                  <li>
                    <button
                      onClick={() => navigateTo(Screen.BLOG)}
                      className="hover:text-primary transition-colors"
                    >
                      Blog
                    </button>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-4">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
                  <li>
                    <a href="/privacy" className="hover:text-primary transition-colors">
                      Privacy
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-primary transition-colors">
                      Terms
                    </a>
                  </li>
                  <li>
                    <button className="hover:text-primary transition-colors">Security</button>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-sm text-slate-400">© 2024 StudentOS Inc. All rights reserved.</p>
              <div className="flex gap-4 text-slate-400">
                <a className="hover:text-primary transition-colors" href="#">
                  <span className="sr-only">Twitter</span>
                  <span className="material-symbols-outlined text-xl">public</span>
                </a>
                <a className="hover:text-primary transition-colors" href="#">
                  <span className="sr-only">LinkedIn</span>
                  <span className="material-symbols-outlined text-xl">share</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
