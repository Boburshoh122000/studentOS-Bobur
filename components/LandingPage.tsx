import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Screen, NavigationProps } from '../types';
import { useAuth } from '../src/contexts/AuthContext';
import { motion, useScroll, useTransform } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';

/* ═══════════════════════════════════════════════════════════════
   ANIMATION CONFIGURATION — Exact Framer Motion Variants
   ═══════════════════════════════════════════════════════════════ */

/** Stagger container — wrap around children that need sequential entrance */
const stagger = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.1,
    },
  },
};

/** Fade-up with spring physics */
const springUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
};

/** Soft scale-in */
const scaleReveal = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 120, damping: 24 },
  },
};

/** Staggered pop for integration icons */
const popIn = {
  hidden: { opacity: 0, scale: 0, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 260, damping: 20 },
  },
};

/* ═══════════════════════════════════════════════════════════════
   HERO NODE CONFIG — Positions, icons, delays for connected nodes
   ═══════════════════════════════════════════════════════════════ */

interface HeroNode {
  id: string;
  icon: string;
  label: string;
  /** Position as percentage of the container */
  x: string;
  y: string;
  /** SVG endpoint for the connecting line (in viewBox coords 0-1000) */
  svgX: number;
  svgY: number;
  /** Floating animation delay in seconds */
  delay: number;
  /** Floating range in px */
  yRange: number;
  /** Duration of one float cycle */
  duration: number;
  /** Gradient colors for the icon background */
  from: string;
  to: string;
}

const heroNodes: HeroNode[] = [
  {
    id: 'cv',
    icon: 'description',
    label: 'CV Builder',
    x: '8%',
    y: '18%',
    svgX: 130,
    svgY: 220,
    delay: 0,
    yRange: 15,
    duration: 4.0,
    from: 'from-violet-500',
    to: 'to-purple-600',
  },
  {
    id: 'career',
    icon: 'work',
    label: 'Career Tracker',
    x: '82%',
    y: '12%',
    svgX: 870,
    svgY: 170,
    delay: 0.5,
    yRange: 12,
    duration: 3.5,
    from: 'from-blue-500',
    to: 'to-indigo-600',
  },
  {
    id: 'habits',
    icon: 'check_circle',
    label: 'Habit Tracker',
    x: '85%',
    y: '68%',
    svgX: 890,
    svgY: 720,
    delay: 1.2,
    yRange: 14,
    duration: 4.5,
    from: 'from-emerald-500',
    to: 'to-teal-600',
  },
  {
    id: 'telegram',
    icon: 'send',
    label: 'Telegram Bot',
    x: '5%',
    y: '72%',
    svgX: 100,
    svgY: 760,
    delay: 0.8,
    yRange: 11,
    duration: 3.8,
    from: 'from-sky-500',
    to: 'to-cyan-600',
  },
  {
    id: 'learning',
    icon: 'auto_stories',
    label: 'Learning Plans',
    x: '42%',
    y: '85%',
    svgX: 480,
    svgY: 890,
    delay: 1.5,
    yRange: 10,
    duration: 4.2,
    from: 'from-amber-500',
    to: 'to-orange-600',
  },
];

const SVG_CENTER_X = 500;
const SVG_CENTER_Y = 460;

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  const handleToolClick = (toolPath: string) => {
    if (isAuthenticated) {
      navigate(toolPath);
    } else {
      navigate(`/signup/step-1?redirect_to=${encodeURIComponent(toolPath)}`);
    }
  };

  /* Parallax refs for Section 2 */
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start'],
  });

  const parallaxY1 = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const parallaxY2 = useTransform(scrollYProgress, [0, 1], [40, -80]);
  const parallaxY3 = useTransform(scrollYProgress, [0, 1], [80, -40]);
  const parallaxY4 = useTransform(scrollYProgress, [0, 1], [30, -70]);

  return (
    <div className="bg-[#FAFAFA] min-h-screen overflow-x-hidden pt-20 font-sans selection:bg-indigo-200/60">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="fixed top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100/80 h-20">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-8">
          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => navigateTo(Screen.LANDING)}
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-400/25">
              <span className="material-symbols-outlined text-[20px]">school</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">StudentOS</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: t('Header.home'), to: '/' },
              { label: t('Header.about'), to: '/about' },
              { label: t('Header.career_tracker'), to: '/career-tracker' },
              { label: t('Header.blog'), to: '/blog' },
              { label: t('Header.contact'), to: '/contact' },
            ].map((l) => (
              <button
                key={l.to}
                onClick={() => navigate(l.to)}
                className="text-[13px] font-medium text-gray-500 hover:text-indigo-600 transition-colors"
              >
                {l.label}
              </button>
            ))}

            {/* Tools Dropdown */}
            <div className="group relative flex items-center">
              <button className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-indigo-600 transition-colors py-6 focus:outline-none">
                {t('Header.tools')}
                <span className="material-symbols-outlined text-[14px] transition-transform duration-300 group-hover:-rotate-180">
                  keyboard_arrow_down
                </span>
              </button>
              <div className="absolute left-1/2 top-[80%] z-50 w-[580px] -translate-x-1/2 translate-y-2 rounded-[1.5rem] bg-white/95 backdrop-blur-xl p-5 shadow-2xl ring-1 ring-black/5 transition-all duration-300 ease-out invisible opacity-0 scale-95 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100">
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    {
                      icon: 'fact_check',
                      label: t('Tools.cv_ats'),
                      desc: t('Tools.cv_ats_desc'),
                      onClick: () => handleToolClick('/app/cv-ats'),
                    },
                    {
                      icon: 'work_outline',
                      label: t('Tools.career_tracker'),
                      desc: t('Tools.career_tracker_desc'),
                      onClick: () => navigate('/career-tracker'),
                    },
                    {
                      icon: 'gavel',
                      label: t('Tools.plagiarism'),
                      desc: t('Tools.plagiarism_desc'),
                      onClick: () => handleToolClick('/app/plagiarism'),
                    },
                    {
                      icon: 'co_present',
                      label: t('Tools.presentations'),
                      desc: t('Tools.presentations_desc'),
                      onClick: () => handleToolClick('/app/presentation'),
                    },
                    {
                      icon: 'school',
                      label: t('Tools.scholarships'),
                      desc: t('Tools.scholarships_desc'),
                      onClick: () => handleToolClick('/app/scholarships'),
                    },
                    {
                      icon: 'check_circle',
                      label: t('Tools.habits'),
                      desc: t('Tools.habits_desc'),
                      onClick: () => handleToolClick('/app/habit-tracker'),
                    },
                    {
                      icon: 'route',
                      label: t('Tools.learning_plans'),
                      desc: t('Tools.learning_plans_desc'),
                      onClick: () => handleToolClick('/app/learning-plan'),
                    },
                  ].map((t) => (
                    <button
                      key={t.label}
                      onClick={t.onClick}
                      className="w-full text-left flex items-start gap-3 rounded-xl p-3 hover:bg-indigo-50/60 transition-colors group/item"
                    >
                      <span className="material-symbols-outlined text-indigo-600 mt-0.5 group-hover/item:scale-110 transition-transform text-[20px]">
                        {t.icon}
                      </span>
                      <div>
                        <div className="font-semibold text-[13px] text-gray-800">{t.label}</div>
                        <div className="text-[11px] text-gray-400">{t.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <>
                <div
                  className="size-9 rounded-full bg-gray-200 bg-cover bg-center ring-2 ring-white cursor-pointer hover:ring-indigo-400 transition-all hidden sm:block"
                  style={{
                    backgroundImage: `url('${user?.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.profile?.fullName || user?.email?.split('@')[0] || 'U')}&background=random`}')`,
                  }}
                  onClick={() => navigate('/app/profile')}
                />
                <button
                  onClick={() => navigate('/app')}
                  className="rounded-full bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-400/20"
                >
                  {t('Header.dashboard')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/signin')}
                  className="hidden sm:block text-[13px] font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                >
                  {t('Header.sign_in')}
                </button>
                <button
                  onClick={() => navigate('/signup/step-1')}
                  className="rounded-full bg-indigo-600 px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-400/20"
                >
                  {t('Header.get_started')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 1 — HERO: Connected Nodes
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full px-4 pt-16 pb-8 sm:pt-24 sm:pb-12 lg:pt-28 lg:pb-16">
        {/* Centered headline */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 leading-[1.05]">
            {t('Hero.title_1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              {t('Hero.title_2')}
            </span>{' '}
            {t('Hero.title_3')}
          </h1>
          <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            {t('Hero.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            <button
              onClick={() => navigate('/signup/step-1')}
              className="h-12 rounded-full bg-indigo-600 px-8 text-[15px] font-semibold text-white shadow-xl shadow-indigo-500/25 hover:bg-indigo-700 hover:shadow-indigo-500/35 transition-all active:scale-95"
            >
              {t('Hero.cta_start')}
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="h-12 rounded-full border-2 border-gray-200 bg-white px-8 text-[15px] font-semibold text-gray-700 hover:border-indigo-300 hover:text-indigo-600 transition-all active:scale-95 shadow-sm"
            >
              {t('Hero.cta_learn')}
            </button>
          </div>
        </motion.div>

        {/* ── Connected Nodes Diagram ── */}
        <div className="relative mx-auto mt-20 max-w-[680px] h-[420px] sm:h-[480px] lg:h-[520px]">
          {/* Radial glow behind the center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-indigo-400/[0.08] rounded-full blur-3xl pointer-events-none" />

          {/* SVG Connecting Lines — drawn BEHIND the nodes */}
          <svg
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            viewBox="0 0 1000 1000"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            {heroNodes.map((node) => (
              <line
                key={node.id}
                x1={SVG_CENTER_X}
                y1={SVG_CENTER_Y}
                x2={node.svgX}
                y2={node.svgY}
                stroke="#E5E7EB"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
            ))}
          </svg>

          {/* Center Logo Element */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <div className="flex size-20 sm:size-24 items-center justify-center rounded-[1.5rem] bg-white shadow-2xl shadow-indigo-500/20 border border-gray-100/80">
              <div className="flex size-12 sm:size-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <span className="material-symbols-outlined text-[28px] sm:text-[32px]">school</span>
              </div>
            </div>
          </motion.div>

          {/* Floating Nodes */}
          {heroNodes.map((node) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -node.yRange, 0],
              }}
              transition={{
                opacity: { duration: 0.5, delay: node.delay + 0.4 },
                scale: {
                  duration: 0.5,
                  delay: node.delay + 0.4,
                  type: 'spring' as const,
                  stiffness: 200,
                },
                y: {
                  duration: node.duration,
                  repeat: Infinity,
                  ease: 'easeInOut' as const,
                  delay: node.delay,
                },
              }}
              className="absolute z-10"
              style={{ left: node.x, top: node.y }}
            >
              <div className="flex flex-col items-center gap-1.5 group cursor-default">
                <div className="flex size-14 sm:size-16 items-center justify-center rounded-2xl backdrop-blur-md bg-white/80 border border-white shadow-lg shadow-gray-200/50 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <div
                    className={`flex size-9 sm:size-10 items-center justify-center rounded-xl bg-gradient-to-br ${node.from} ${node.to} text-white`}
                  >
                    <span className="material-symbols-outlined text-[20px] sm:text-[22px]">
                      {node.icon}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] font-semibold text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {node.label}
                </span>
              </div>
            </motion.div>
          ))}

          {/* Tiny decorative floating shapes */}
          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 45, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute top-[30%] left-[30%] z-0"
          >
            <div className="w-3 h-3 rounded-sm bg-indigo-200/40 rotate-45" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, delay: 1, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute top-[55%] right-[25%] z-0"
          >
            <div className="w-2 h-2 rounded-full bg-violet-300/30" />
          </motion.div>
          <motion.div
            animate={{ y: [0, -5, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 4, delay: 2, repeat: Infinity, ease: 'easeInOut' as const }}
            className="absolute bottom-[25%] left-[22%] z-0"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-200/40" />
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 2 — CORE SOLUTIONS (Parallax Scroll)
         ═══════════════════════════════════════════════════════════════ */}
      <section ref={parallaxRef} className="relative w-full py-32 sm:py-40 overflow-hidden">
        {/* Section text */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mx-auto max-w-3xl text-center px-4 relative z-20"
        >
          <motion.p
            variants={springUp}
            className="text-[13px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3"
          >
            Core Solutions
          </motion.p>
          <motion.h2
            variants={springUp}
            className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900"
          >
            Streamline your academic
            <br className="hidden sm:block" /> and career journey
          </motion.h2>
          <motion.p variants={springUp} className="mt-5 text-base text-gray-400 max-w-lg mx-auto">
            Tools designed by ambitious students, for ambitious students.
          </motion.p>
        </motion.div>

        {/* Parallax floating cards */}
        <div className="relative mx-auto max-w-5xl h-[360px] sm:h-[420px] mt-16">
          {/* Card 1: ATS Score — Left, parallaxY1 */}
          <motion.div
            style={{ y: parallaxY1 }}
            className="absolute top-4 left-[4%] sm:left-[8%] z-10"
          >
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-black/[0.04] border border-gray-100 p-5 w-52 sm:w-56 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="size-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white">
                  <span className="font-black text-sm">85</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-800">ATS Score</div>
                  <div className="text-[11px] text-emerald-500 font-semibold">Excellent Match</div>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Card 2: Interview Passed — Top Right, parallaxY2 */}
          <motion.div
            style={{ y: parallaxY2 }}
            className="absolute top-0 right-[4%] sm:right-[10%] z-10"
          >
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-black/[0.04] border border-gray-100 p-5 w-56 sm:w-60 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="size-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    verified
                  </span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-800">Interview Passed</div>
                  <div className="text-[11px] text-gray-400">Google · UX Intern</div>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-5 flex-1 bg-emerald-400/20 rounded" />
                ))}
                <div className="h-5 flex-1 bg-emerald-500 rounded" />
              </div>
            </div>
          </motion.div>

          {/* Card 3: Habit Streak — Bottom Left, parallaxY3 */}
          <motion.div
            style={{ y: parallaxY3 }}
            className="absolute bottom-4 left-[6%] sm:left-[14%] z-10"
          >
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-black/[0.04] border border-gray-100 p-5 w-48 sm:w-52 hover:shadow-2xl transition-shadow">
              <div className="text-[13px] font-bold text-gray-800 mb-2">🔥 14-Day Streak</div>
              <div className="text-[11px] text-gray-400 mb-3">Morning Study · 45 min</div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 14 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-4 rounded-md ${i < 12 ? 'bg-emerald-400/70' : 'bg-emerald-200/50'}`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Card 4: New Match — Bottom Right, parallaxY4 */}
          <motion.div
            style={{ y: parallaxY4 }}
            className="absolute bottom-8 right-[4%] sm:right-[8%] z-10"
          >
            <div className="bg-white rounded-[1.5rem] shadow-xl shadow-black/[0.04] border border-gray-100 p-5 w-52 sm:w-56 hover:shadow-2xl transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="size-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600 text-[16px]">
                    notifications
                  </span>
                </div>
                <span className="text-[13px] font-bold text-gray-800">New Match</span>
                <span className="text-[10px] text-gray-300 ml-auto">2m</span>
              </div>
              <div className="text-[11px] text-gray-500">UX Design Intern at Figma — 92% fit</div>
            </div>
          </motion.div>

          {/* Center floating avatars */}
          {[
            { pos: 'top-[30%] left-[38%]', bg: 'E8B4B8', d: 3.5, dl: 0.3 },
            { pos: 'top-[45%] right-[36%]', bg: 'B4D4E8', d: 4.2, dl: 1 },
            { pos: 'top-[20%] left-[52%]', bg: 'D4E8B4', d: 3, dl: 1.8 },
            { pos: 'bottom-[30%] right-[44%]', bg: 'E8D4B4', d: 3.8, dl: 0.5 },
          ].map((a, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -(8 + i * 2), 0] }}
              transition={{
                duration: a.d,
                delay: a.dl,
                repeat: Infinity,
                ease: 'easeInOut' as const,
              }}
              className={`absolute ${a.pos} z-0`}
            >
              <div className="size-10 sm:size-12 rounded-full border-[3px] border-white shadow-lg overflow-hidden">
                <img
                  src={`https://ui-avatars.com/api/?name=S${i + 1}&background=${a.bg}&color=fff&bold=true&size=96`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 3 — BENTO GRID ("Built for Ambitious Students")
         ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="w-full px-4 py-24 sm:py-32 sm:px-6 lg:px-8 scroll-mt-24">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={springUp} className="text-center mb-16">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">
              Platform Features
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
              Built for ambitious students
            </h2>
            <p className="mt-4 text-base text-gray-400 max-w-lg mx-auto">
              Everything you need to ace your academics and launch your career.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Career Tracker (spans 2 cols on desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ type: 'spring' as const, stiffness: 100, damping: 20 }}
              className="group md:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-black/[0.06] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-50/60 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-blue-600 text-[28px]">
                    view_kanban
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Career Tracker</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
                  Manage job applications and track your career progress on a visual Kanban
                  pipeline.
                </p>
                {/* Mini Kanban */}
                <div className="flex gap-3 group-hover:scale-[1.02] transition-transform origin-top-left">
                  {[
                    { title: 'Applied', count: 3 },
                    { title: 'Interview', count: 2 },
                    { title: 'Offer', count: 1 },
                  ].map((col) => (
                    <div key={col.title} className="flex-1 bg-gray-50 rounded-xl p-2.5">
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        {col.title}
                      </div>
                      {Array.from({ length: col.count }).map((_, j) => (
                        <div
                          key={j}
                          className="h-7 bg-white border border-gray-100 rounded-lg mb-1.5 shadow-sm"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2: Telegram */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ type: 'spring' as const, stiffness: 100, damping: 20, delay: 0.1 }}
              className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-black/[0.06] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-sky-50/60 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-sky-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-sky-500 text-[28px]">send</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Telegram Bot</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Get instant alerts and manage habits directly via Telegram.
                </p>
                <div className="space-y-2 group-hover:scale-[1.02] transition-transform origin-top-left">
                  <div className="flex justify-end">
                    <div className="bg-indigo-600 text-white text-[10px] px-3 py-1.5 rounded-2xl rounded-br-sm max-w-[150px]">
                      Track habit ✅
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-gray-100 text-gray-600 text-[10px] px-3 py-1.5 rounded-2xl rounded-bl-sm max-w-[170px]">
                      🎉 Streak: 14 days!
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: CV Builder */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ type: 'spring' as const, stiffness: 100, damping: 20, delay: 0.2 }}
              className="group bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-black/[0.06] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-violet-50/60 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-violet-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-violet-600 text-[28px]">
                    description
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">CV Builder & ATS</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-6">
                  Create ATS-friendly resumes effortlessly.
                </p>
                <div className="bg-gray-50 rounded-xl p-3 group-hover:scale-[1.02] transition-transform origin-top-left">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-7 rounded-full bg-violet-200" />
                    <div>
                      <div className="h-2 w-16 bg-gray-200 rounded" />
                      <div className="h-1.5 w-10 bg-gray-100 rounded mt-1" />
                    </div>
                  </div>
                  <div className="space-y-1.5 ml-9">
                    <div className="h-1.5 w-full bg-gray-100 rounded" />
                    <div className="h-1.5 w-4/5 bg-gray-100 rounded" />
                    <div className="h-1.5 w-3/5 bg-gray-100 rounded" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 4: Habits & Learning (spans 2 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ type: 'spring' as const, stiffness: 100, damping: 20, delay: 0.3 }}
              className="group md:col-span-2 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-black/[0.06] transition-all duration-500 overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-emerald-50/60 to-transparent rounded-bl-full pointer-events-none" />
              <div className="relative z-10">
                <div className="size-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-emerald-600 text-[28px]">
                    calendar_month
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Habits & Learning Plans</h3>
                <p className="text-sm text-gray-400 leading-relaxed mb-8 max-w-md">
                  Build consistent habits and generate AI-powered learning roadmaps tailored to your
                  goals.
                </p>
                <div className="grid grid-cols-7 sm:grid-cols-14 gap-1.5 max-w-md group-hover:scale-[1.02] transition-transform origin-top-left">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 rounded-md transition-colors ${i < 22 ? 'bg-emerald-400/70 hover:bg-emerald-500' : 'bg-gray-100'}`}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 4 — INTEGRATIONS (Neumorphic, Staggered)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full px-4 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mx-auto max-w-4xl text-center"
        >
          <motion.p
            variants={springUp}
            className="text-[13px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3"
          >
            Integrations
          </motion.p>
          <motion.h2
            variants={springUp}
            className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900"
          >
            Integrate with your
            <br className="hidden sm:block" /> existing tools in seconds
          </motion.h2>
          <motion.p variants={springUp} className="mt-4 text-base text-gray-400 max-w-lg mx-auto">
            Connect seamlessly and keep everything in sync.
          </motion.p>

          <motion.div
            variants={stagger}
            className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-16"
          >
            {[
              { name: 'Notion', emoji: '📝' },
              { name: 'Google', emoji: '🔍' },
              { name: 'Telegram', emoji: '✈️' },
              { name: 'Railway', emoji: '🚂' },
              { name: 'Discord', emoji: '💬' },
            ].map((tool) => (
              <motion.div
                key={tool.name}
                variants={popIn}
                whileHover={{ y: -4, scale: 1.05 }}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.5rem] bg-white border border-gray-100 shadow-[6px_6px_12px_#e8e8e8,-6px_-6px_12px_#ffffff] flex flex-col items-center justify-center gap-2 cursor-default transition-shadow hover:shadow-[8px_8px_16px_#e0e0e0,-8px_-8px_16px_#ffffff]"
              >
                <span className="text-3xl sm:text-4xl">{tool.emoji}</span>
                <span className="text-[11px] sm:text-xs font-semibold text-gray-500">
                  {tool.name}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 5 — TESTIMONIALS
         ═══════════════════════════════════════════════════════════════ */}
      <section className="w-full px-4 py-24 sm:py-32">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <motion.div variants={springUp} className="text-center mb-14">
            <p className="text-[13px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-3">
              Testimonials
            </p>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-gray-900">
              Words of appreciation
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah Johnson',
                role: 'CS at Stanford',
                quote:
                  'StudentOS helped me track 12 internship applications simultaneously. I landed my dream role at Google thanks to the ATS checker.',
                bg: 'F0C4C4',
              },
              {
                name: 'Arjun Patel',
                role: 'Engineering at MIT',
                quote:
                  'The habit tracker with Telegram bot is a game-changer. My study consistency went from 40% to 92% in one semester.',
                bg: 'C4D4F0',
              },
              {
                name: 'Aisha Karimova',
                role: 'Business at Harvard',
                quote:
                  "The scholarship finder matched me with $15k in funding I didn't know existed. Essential for every ambitious student.",
                bg: 'D4F0C4',
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{
                  type: 'spring' as const,
                  stiffness: 100,
                  damping: 20,
                  delay: i * 0.1,
                }}
                className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-xl shadow-black/[0.03] hover:shadow-2xl hover:shadow-black/[0.06] transition-all duration-300"
              >
                <div className="flex items-center gap-0.5 mb-5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg
                      key={s}
                      className="w-[18px] h-[18px] text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-8">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-5 border-t border-gray-50">
                  <div className="size-11 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=${t.bg}&color=fff&bold=true&size=88`}
                      alt={t.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-[13px] font-bold text-gray-800">{t.name}</div>
                    <div className="text-[11px] text-gray-400">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 6 — FOOTER WITH BLURRED WATERMARK
         ═══════════════════════════════════════════════════════════════ */}
      <footer className="relative w-full bg-[#0e0e1a] text-white pt-20 pb-8 overflow-hidden">
        {/* 🔥 WATERMARK — Massive blurred background text */}
        <div
          className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none select-none"
          aria-hidden="true"
        >
          <div
            className="text-[15vw] font-black tracking-tighter text-indigo-600 opacity-10 whitespace-nowrap leading-none"
            style={{ filter: 'blur(8px)' }}
          >
            StudentOS
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
            {[
              {
                title: 'Product',
                items: ['Dashboard', 'Career Tracker', 'CV Builder', 'Habit Tracker'],
              },
              {
                title: 'Features',
                items: ['ATS Checker', 'Presentations', 'Scholarships', 'Learning Plans'],
              },
              { title: 'Resources', items: ['Blog', 'Documentation', 'Support', 'FAQ'] },
              { title: 'Follow Us', items: ['Twitter', 'LinkedIn', 'Instagram', 'Telegram'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] font-bold text-white/60 uppercase tracking-[0.15em] mb-5">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item}>
                      <button className="text-[13px] text-white/35 hover:text-white transition-colors duration-200">
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white">
                <span className="material-symbols-outlined text-[14px]">school</span>
              </div>
              <span className="text-sm font-bold">StudentOS</span>
            </div>
            <p className="text-[11px] text-white/25">
              © {new Date().getFullYear()} StudentOS. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
