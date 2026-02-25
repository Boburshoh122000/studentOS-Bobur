import React from 'react';
import { Screen, NavigationProps } from '../types';

export default function ContactSupport({ navigateTo }: NavigationProps) {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-text-main dark:text-white transition-colors duration-200 pt-20">
      {/* Top Navigation */}
      <header className="fixed top-0 z-50 w-full bg-card-light/80 dark:bg-surface-dark/80 backdrop-blur-md border-b border-border-light dark:border-border-dark h-20 transition-all duration-200">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <div
            className="flex items-center gap-2 cursor-pointer select-none"
            onClick={() => navigateTo(Screen.LANDING)}
          >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <h2 className="text-xl font-bold leading-tight tracking-tight text-text-main dark:text-white">
              StudentOS
            </h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => navigateTo(Screen.LANDING)}
              className="text-sm font-medium text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => navigateTo(Screen.LANDING)}
              className="text-sm font-medium text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              About
            </button>
            <div className="group relative h-full flex items-center">
              <button className="flex items-center gap-1 text-sm font-medium text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors focus:outline-none py-6">
                Tools
                <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:-rotate-180">
                  keyboard_arrow_down
                </span>
              </button>
              <div className="mega-menu absolute left-1/2 top-[80%] z-50 w-[640px] -translate-x-1/2 translate-y-2 rounded-2xl border border-white/50 bg-white/90 backdrop-blur-xl p-5 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 dark:bg-[#1e2130]/95 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <button
                      onClick={() => navigateTo(Screen.CV_ATS)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        fact_check
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          CV & ATS Checker
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Optimize for recruitment algorithms
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateTo(Screen.CAREER_TRACKER)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        work_outline
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Job Finder
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Internships & graduate roles
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateTo(Screen.PLAGIARISM)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        gavel
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Plagiarism & AI Checker
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Ensure academic integrity
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateTo(Screen.PRESENTATION)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        co_present
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Presentation Maker
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Create slides in minutes
                        </div>
                      </div>
                    </button>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigateTo(Screen.SCHOLARSHIPS)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        school
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Scholarship Finder
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Find funding opportunities
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateTo(Screen.HABIT_TRACKER)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        check_circle
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Habit Tracker
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Build study routines
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => navigateTo(Screen.LEARNING_PLAN)}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-primary mt-1 group-hover/item:scale-110 transition-transform">
                        route
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          Learning Plan Builder
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          Customized curriculum paths
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigateTo(Screen.COMMUNITY)}
              className="text-sm font-medium text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Community
            </button>
            <button
              onClick={() => navigateTo(Screen.BLOG)}
              className="text-sm font-medium text-text-sub hover:text-primary dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Blog
            </button>
            <button
              onClick={() => navigateTo(Screen.CONTACT)}
              className="text-sm font-bold text-primary dark:text-primary underline decoration-2 underline-offset-8"
            >
              Contact
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo(Screen.SIGN_IN)}
              className="hidden sm:flex text-sm font-medium text-text-main hover:text-primary dark:text-white dark:hover:text-primary transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigateTo(Screen.SIGNUP_STEP_1)}
              className="flex items-center justify-center overflow-hidden rounded-xl h-10 px-5 bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <span className="truncate">Get Started</span>
            </button>
          </div>
          <div className="md:hidden">
            <button className="text-text-main dark:text-white">
              <span className="material-symbols-outlined">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow px-4 py-12 md:px-12 lg:px-20 lg:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Page Heading */}
          <div className="mb-12 text-center md:text-left">
            <div className="flex flex-col gap-4 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-text-main dark:text-white">
                Get in touch
              </h1>
              <p className="text-lg text-text-sub dark:text-gray-400 leading-relaxed">
                Have a question or feedback? We’re here to help you succeed with StudentOS. Fill out
                the form or reach out directly.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* Left Column: Contact Info & Socials */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              {/* Info Card */}
              <div className="bg-card-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark flex flex-col gap-6">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">
                  Contact Information
                </h3>
                {/* Email Item */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined">mail</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-sub dark:text-gray-500 mb-1">
                      Email us
                    </span>
                    <a
                      href="mailto:support@studentos.com"
                      className="text-base font-medium text-text-main dark:text-white hover:text-primary transition-colors"
                    >
                      support@studentos.com
                    </a>
                  </div>
                </div>
                {/* Location Item */}
                <div className="flex items-start gap-4 group">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <span className="material-symbols-outlined">location_on</span>
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-text-sub dark:text-gray-500 mb-1">
                      Visit us
                    </span>
                    <p className="text-base font-medium text-text-main dark:text-white">
                      123 University Ave
                      <br />
                      Palo Alto, CA 94301
                    </p>
                  </div>
                </div>
              </div>

              {/* Socials */}
              <div className="bg-card-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark">
                <h3 className="text-lg font-bold text-text-main dark:text-white mb-6">Follow Us</h3>
                <div className="flex gap-6">
                  {/* Twitter */}
                  <a href="#" className="flex flex-col items-center gap-2 group w-20">
                    <div className="h-12 w-12 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center text-text-main dark:text-white group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-text-sub dark:text-gray-400 group-hover:text-primary transition-colors">
                      Twitter
                    </span>
                  </a>
                  {/* LinkedIn */}
                  <a href="#" className="flex flex-col items-center gap-2 group w-20">
                    <div className="h-12 w-12 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center text-text-main dark:text-white group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-text-sub dark:text-gray-400 group-hover:text-primary transition-colors">
                      LinkedIn
                    </span>
                  </a>
                  {/* Instagram */}
                  <a href="#" className="flex flex-col items-center gap-2 group w-20">
                    <div className="h-12 w-12 rounded-full bg-background-light dark:bg-background-dark flex items-center justify-center text-text-main dark:text-white group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden="true">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-medium text-text-sub dark:text-gray-400 group-hover:text-primary transition-colors">
                      Instagram
                    </span>
                  </a>
                </div>
              </div>

              {/* Illustration */}
              <div
                className="hidden lg:flex flex-1 rounded-2xl bg-cover bg-center h-48 relative overflow-hidden group shadow-sm"
                style={{
                  backgroundImage:
                    "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB7sxzK49L_smm9H3SQrEl_Mmu89kh0LW_o7hh_7kKh-SLd_GFLTr3r8KjlG_rXfxeNUtmq2upqps8WbnnVT4hM3oo7Xty9WAsTgxrQzRBsyFwVKMEWQWw-Gd35c6m5Ibp2H8dWb-g24GYMUDVWm61rtfoIPuIJXIxdP91zU7p3CDiwEcjumJPJTrN5okUt1fwD3YEi4BN1LjrD3qLSK_3DLkIzqoqdVLR3r7qdRN56N8lunz9ILR4EfXAT0ZWvpYpC5ukihnVYqJs')",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-primary/40 group-hover:from-primary/80 transition-all"></div>
                <div className="relative z-10 flex items-end p-6 w-full">
                  <p className="text-white font-bold text-xl leading-tight">
                    Join 10,000+ students organizing their life.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="bg-card-light dark:bg-surface-dark rounded-2xl shadow-lg border border-border-light dark:border-border-dark p-8 md:p-10">
                <h2 className="text-2xl font-bold text-text-main dark:text-white mb-6">
                  Send us a message
                </h2>
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-semibold text-text-main dark:text-gray-200"
                        htmlFor="name"
                      >
                        Full Name
                      </label>
                      <input
                        className="block w-full rounded-lg border-border-light bg-background-light px-4 py-3 text-text-main placeholder-text-sub focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-gray-500 sm:text-sm shadow-sm transition-all focus:ring-2 outline-none"
                        id="name"
                        placeholder="John Doe"
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        className="block text-sm font-semibold text-text-main dark:text-gray-200"
                        htmlFor="email"
                      >
                        Email Address
                      </label>
                      <input
                        className="block w-full rounded-lg border-border-light bg-background-light px-4 py-3 text-text-main placeholder-text-sub focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-gray-500 sm:text-sm shadow-sm transition-all focus:ring-2 outline-none"
                        id="email"
                        placeholder="john@university.edu"
                        type="email"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-semibold text-text-main dark:text-gray-200"
                      htmlFor="subject"
                    >
                      Subject
                    </label>
                    <div className="relative">
                      <select
                        className="block w-full appearance-none rounded-lg border-border-light bg-background-light px-4 py-3 text-text-main focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white sm:text-sm shadow-sm transition-all focus:ring-2 outline-none"
                        id="subject"
                      >
                        <option>General Inquiry</option>
                        <option>Technical Support</option>
                        <option>Billing Question</option>
                        <option>Partnership</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-text-sub dark:text-gray-400">
                        <span className="material-symbols-outlined">expand_more</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block text-sm font-semibold text-text-main dark:text-gray-200"
                      htmlFor="message"
                    >
                      Message
                    </label>
                    <textarea
                      className="block w-full rounded-lg border-border-light bg-background-light px-4 py-3 text-text-main placeholder-text-sub focus:border-primary focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-white dark:placeholder-gray-500 sm:text-sm shadow-sm transition-all focus:ring-2 outline-none resize-none"
                      id="message"
                      placeholder="How can we help you today?"
                      rows={4}
                    ></textarea>
                  </div>
                  <div className="pt-2">
                    <button
                      className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3.5 text-base font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark hover:shadow-primary/40 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-surface-dark sm:w-auto min-w-[160px]"
                      type="submit"
                    >
                      <span>Send Message</span>
                      <span className="material-symbols-outlined ml-2 text-sm">send</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-20 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-text-main dark:text-white text-center mb-10">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {/* FAQ Item 1 */}
              <details className="group rounded-xl bg-card-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-base font-semibold text-text-main dark:text-white transition-colors hover:text-primary">
                  <span>How do I upgrade to StudentOS Pro?</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="px-6 pb-6 text-text-sub dark:text-gray-400 leading-relaxed">
                  You can upgrade to Pro directly from your dashboard settings. Click on the
                  'Billing' tab and select the Pro plan. We offer monthly and yearly subscriptions.
                </div>
              </details>
              {/* FAQ Item 2 */}
              <details className="group rounded-xl bg-card-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-base font-semibold text-text-main dark:text-white transition-colors hover:text-primary">
                  <span>Is there a discount for students?</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="px-6 pb-6 text-text-sub dark:text-gray-400 leading-relaxed">
                  Yes! We offer a 50% discount for all verified students. Simply sign up with your
                  .edu email address, and the discount will be automatically applied at checkout.
                </div>
              </details>
              {/* FAQ Item 3 */}
              <details className="group rounded-xl bg-card-light dark:bg-surface-dark border border-border-light dark:border-border-dark overflow-hidden transition-all duration-300 open:shadow-md">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6 text-base font-semibold text-text-main dark:text-white transition-colors hover:text-primary">
                  <span>How do I reset my password?</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="px-6 pb-6 text-text-sub dark:text-gray-400 leading-relaxed">
                  If you've forgotten your password, go to the login page and click "Forgot
                  Password". We'll send a reset link to your registered email address immediately.
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border-light dark:border-border-dark bg-card-light dark:bg-surface-dark py-10 mt-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-sm text-text-sub dark:text-gray-500">
            © 2023 StudentOS Inc. All rights reserved.
          </div>
          <div className="flex gap-6">
            <a
              href="/privacy"
              className="text-sm text-text-sub hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms"
              className="text-sm text-text-sub hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <button
              onClick={() => navigateTo(Screen.CONTACT)}
              className="text-sm text-text-sub hover:text-primary dark:text-gray-500 dark:hover:text-white transition-colors"
            >
              Contact Support
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
