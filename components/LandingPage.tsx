'use client';

import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NavigationProps } from '../types';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from './Navbar';

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
  type: 'icon' | 'avatar' | 'white-icon';
  content: string;
  x: string;
  y: string;
  svgX: number;
  svgY: number;
  delay: number;
  yRange: number;
  duration: number;
  bgClass?: string;
  textClass?: string;
}

const heroNodes: HeroNode[] = [
  // Top Left - Yellow (Lightbulb)
  {
    id: 'idea',
    type: 'icon',
    content: 'lightbulb',
    x: '12%',
    y: '16%',
    svgX: 180,
    svgY: 150,
    delay: 0,
    yRange: 15,
    duration: 4.2,
    bgClass: 'bg-gradient-to-br from-yellow-300 to-amber-400',
    textClass: 'text-amber-800',
  },
  // Mid Left - Avatar
  {
    id: 'avatar1',
    type: 'avatar',
    content: 'https://ui-avatars.com/api/?name=Student+A&background=e2e8f0',
    x: '5%',
    y: '45%',
    svgX: 100,
    svgY: 480,
    delay: 0.8,
    yRange: 12,
    duration: 3.8,
  },
  // Bottom Left - Blue (Book/Learning)
  {
    id: 'learning',
    type: 'icon',
    content: 'auto_stories',
    x: '18%',
    y: '68%',
    svgX: 250,
    svgY: 660,
    delay: 1.5,
    yRange: 14,
    duration: 4.5,
    bgClass: 'bg-gradient-to-br from-sky-400 to-blue-500',
    textClass: 'text-white',
  },
  // Top Right - Red (Shield/Tracker)
  {
    id: 'tracker',
    type: 'icon',
    content: 'track_changes',
    x: '68%',
    y: '18%',
    svgX: 720,
    svgY: 180,
    delay: 0.5,
    yRange: 10,
    duration: 3.5,
    bgClass: 'bg-gradient-to-br from-orange-400 to-red-500',
    textClass: 'text-white',
  },
  // Far Right - White (CV/Document)
  {
    id: 'cv',
    type: 'white-icon',
    content: 'visibility',
    x: '82%',
    y: '42%',
    svgX: 860,
    svgY: 440,
    delay: 1.2,
    yRange: 12,
    duration: 4.0,
    bgClass: 'bg-white border-2 border-gray-100',
    textClass: 'text-gray-900',
  },
  // Bottom Right - Avatar
  {
    id: 'avatar2',
    type: 'avatar',
    content: 'https://ui-avatars.com/api/?name=Student+B&background=dcfce3',
    x: '72%',
    y: '72%',
    svgX: 780,
    svgY: 760,
    delay: 2.0,
    yRange: 13,
    duration: 4.3,
  },
];

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export default function LandingPage({ navigateTo }: NavigationProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  /* Parallax refs for Section 2 */
  const parallaxRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ['start end', 'end start'],
  });

  return (
    <div className="bg-[#FAFAFA] min-h-screen overflow-x-hidden pt-28 font-sans selection:bg-indigo-200/60">
      <Navbar navigateTo={navigateTo} />

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 1 — HERO: Connected Nodes Graphic (Top)
         ═══════════════════════════════════════════════════════════════ */}
      <section className="relative w-full px-4 pt-4 pb-8 lg:pt-8 flex flex-col items-center overflow-hidden">
        {/* ── Connected Nodes Diagram ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1, delayChildren: 0 },
            },
          }}
          className="relative mx-auto w-full max-w-[800px] h-[350px] sm:h-[450px] lg:h-[480px]"
        >
          {/* Radial glow behind the center */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-indigo-500/[0.12] rounded-full blur-3xl pointer-events-none"
          />

          {/* SVG Connecting Lines — drawn BEHIND the nodes */}
          <motion.svg
            variants={{
              hidden: { opacity: 0, pathLength: 0 },
              visible: {
                opacity: 1,
                pathLength: 1,
                transition: { duration: 1.2, ease: 'easeInOut' },
              },
            }}
            className="absolute inset-0 w-full h-full z-0 pointer-events-none"
            viewBox="0 0 1000 1000"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Main horizontal center line matching the image */}
            <motion.line
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, ease: 'easeInOut', delay: 0.2 }}
              x1="200"
              y1={460}
              x2="800"
              y2={460}
              stroke="#E5E7EB"
              strokeWidth="1.5"
            />

            {/* Diagonal lines branching out */}
            {heroNodes.map((node) => {
              // Determine branch origin: If on left side, branch from x=350, if right, branch from x=650
              const branchX = node.svgX > 500 ? 650 : 350;
              // Don't draw line if it's the center horizontal nodes (the avatars in this setup are loosely horizontal)
              if (node.svgX === 100 || node.svgX === 780 || node.svgX === 860) {
                // Direct horizontal line connection
                return (
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 + node.delay * 0.5 }}
                    key={node.id}
                    x1={node.svgX > 500 ? 550 : 450}
                    y1={460}
                    x2={node.svgX}
                    y2={node.svgY}
                    stroke="#E5E7EB"
                    strokeWidth="1.5"
                  />
                );
              }
              return (
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 + node.delay * 0.5 }}
                  key={node.id}
                  x1={branchX}
                  y1={460}
                  x2={node.svgX}
                  y2={node.svgY}
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />
              );
            })}
          </motion.svg>

          {/* Center Logo Element (The massive blue/indigo squircle) */}
          <motion.div
            variants={{
              hidden: { opacity: 0, scale: 0.5, y: -220, x: '-50%' }, // Note: Need absolute centering offset via x/y if possible, but framer allows x/y arrays. We'll use style positioning and just animate scale/opacity/y.
              visible: {
                opacity: 1,
                scale: 1,
                y: -220, // Initial static position -50% (-230px ish depending on height)
                x: '-50%',
                transition: { duration: 0.8, type: 'spring', bounce: 0.4 },
              },
            }}
            // Here we chain the entrance animation to an infinite continuous loop
            // Because x/y transform logic can get messy mixing CSS -translate and Framer y, we wrap the position in a div, and float the inner content.
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{
                duration: 6, // Very slow, heavy float
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
              }}
              className="flex size-28 sm:size-36 items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-blue-500 shadow-2xl shadow-indigo-500/40"
            >
              <span className="material-symbols-outlined text-[48px] sm:text-[56px] text-white">
                check_circle
              </span>
            </motion.div>
          </motion.div>

          {/* Floating Nodes */}
          {heroNodes.map((node) => (
            <motion.div
              key={node.id}
              variants={{
                hidden: { opacity: 0, scale: 0 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: {
                    type: 'spring',
                    bounce: 0.5,
                    duration: 0.8,
                    delay: node.delay + 0.3,
                  },
                },
              }}
              className="absolute z-10"
              style={{ left: node.x, top: node.y }}
            >
              {/* The inner motion.div handles the continuous organic floating AFTER entrance */}
              <motion.div
                animate={{ y: [-node.yRange, node.yRange, -node.yRange] }}
                transition={{
                  duration: node.duration, // 3s - 5s
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: node.delay + 0.2, // Stagger the start of the float
                }}
              >
                {node.type === 'avatar' ? (
                  <div className="size-16 sm:size-20 rounded-[1.5rem] shadow-xl shadow-black/5 overflow-hidden border border-white">
                    <img src={node.content} alt="" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className={`flex size-14 sm:size-16 items-center justify-center rounded-[1.25rem] shadow-xl shadow-black/5 ${node.bgClass}`}
                  >
                    <span
                      className={`material-symbols-outlined text-[24px] sm:text-[28px] ${node.textClass}`}
                    >
                      {node.content}
                    </span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Hero Typography & CTA (Bottom) ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.8 }, // Start after diagram entrance
            },
          }}
          className="mx-auto max-w-4xl text-center -mt-4 sm:-mt-8 relative z-30"
        >
          <motion.h1
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tighter text-gray-900 leading-[1.05]"
          >
            {t('Hero.title_1')} <span className="text-gray-900">{t('Hero.title_2')}</span>{' '}
            {t('Hero.title_3')}
          </motion.h1>
          <motion.p
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            {t('Hero.subtitle')}
          </motion.p>
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { type: 'spring', damping: 20, stiffness: 100 },
              },
            }}
            className="flex justify-center mt-8 sm:mt-10"
          >
            <button
              onClick={() => navigate('/signup/step-1')}
              className="rounded-full bg-indigo-600 px-10 py-4 text-[16px] font-bold text-white shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 hover:shadow-indigo-500/40 hover:scale-[1.03] transition-all duration-300 active:scale-95"
            >
              {t('Hero.cta_start')}
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
         SECTION 2 — CORE SOLUTIONS (Parallax Scroll)
         ═══════════════════════════════════════════════════════════════ */}
      <section ref={parallaxRef} className="relative w-full h-[150vh] bg-[#FAFAFA] overflow-hidden">
        {/* Sticky Center Content Container */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center pointer-events-none z-20">
          {/* Centered Text Block */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative flex flex-col items-center justify-center text-center px-4 max-w-[600px] pointer-events-auto"
          >
            <div className="size-12 rounded-2xl bg-white shadow-xl shadow-black/[0.04] border border-gray-100 flex items-center justify-center mb-5">
              <span className="material-symbols-outlined text-[24px] text-indigo-500">
                category
              </span>
            </div>
            <h2 className="text-[44px] sm:text-[56px] font-black tracking-tight text-gray-900 mb-5 leading-[1.05]">
              Core Student solutions
            </h2>
            <p className="text-[16px] sm:text-[18px] text-gray-500 mb-8 max-w-[480px]">
              Streamline your studies, habits, and career path in one centralized platform,
              enhancing your productivity.
            </p>
            <button
              onClick={() => navigate('/#features')}
              className="rounded-full bg-indigo-600 px-8 py-3.5 text-[15px] font-bold text-white shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 hover:scale-[1.03] transition-all duration-300 active:scale-95"
            >
              Explore tools
            </button>
          </motion.div>
        </div>

        {/* ── PARALLAX FLOATING CARDS ── */}
        {/* Placed ABSOLUTELY to the 150vh section (outside the sticky container) so they naturally scroll. 
            We use offset percentages to cluster them tightly around the text's mid-scroll state. */}
        <div className="absolute inset-0 w-full max-w-[1200px] mx-auto pointer-events-none z-10">
          {/* 1. ATS Checker (Top Left) */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [-180, 180]) }}
            className="absolute top-[15%] left-[5%] lg:left-[15%] hidden sm:block"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
              className="backdrop-blur-sm bg-white/90 rounded-[18px] p-3.5 shadow-xl shadow-indigo-500/5 border border-gray-100 w-52 transform -rotate-2 hover:rotate-0 transition-transform pointer-events-auto"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="size-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-500/30">
                  <span className="material-symbols-outlined text-[18px]">fact_check</span>
                </div>
                <div>
                  <div className="text-[13px] font-bold text-gray-900 leading-tight">
                    ATS Checker
                  </div>
                  <div className="text-[11px] text-emerald-500 font-bold">95% Match</div>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1 overflow-hidden">
                <div className="bg-emerald-500 h-1 rounded-full w-[95%]"></div>
              </div>
            </motion.div>
          </motion.div>

          {/* 2. Daily Habits (Mid Left) */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [100, -100]) }}
            className="absolute top-[42%] left-[2%] lg:left-[8%] hidden sm:block"
          >
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
              className="backdrop-blur-sm bg-white/90 rounded-[18px] p-3.5 shadow-xl shadow-indigo-500/5 border border-gray-100 w-48 transform rotate-1 hover:-rotate-1 transition-transform pointer-events-auto"
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="size-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                  <span className="material-symbols-outlined text-[16px]">checklist</span>
                </div>
                <div className="text-[12px] font-bold text-gray-900">Daily Habits</div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 line-through text-gray-400 text-[10px]">
                  <span className="size-3 rounded-sm bg-emerald-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[8px] text-white">check</span>
                  </span>{' '}
                  Leetcode
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-[10px]">
                  <span className="size-3 rounded-sm border border-gray-200"></span> Read 20 pages
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 3. Originality (Bottom Left) */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [-220, 220]) }}
            className="absolute top-[75%] left-[10%] lg:left-[18%] hidden md:block"
          >
            <motion.div
              animate={{ y: [-12, 12, -12] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              className="backdrop-blur-sm bg-white/90 rounded-full pr-4 p-2 shadow-xl shadow-indigo-500/5 border border-gray-100 transform -rotate-3 hover:rotate-1 transition-transform pointer-events-auto flex items-center gap-2.5"
            >
              <div className="size-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 shrink-0">
                <span className="material-symbols-outlined text-[16px]">gpp_good</span>
              </div>
              <div>
                <div className="text-[12px] font-bold text-gray-900 leading-none mb-1">
                  Originality
                </div>
                <div className="text-[10px] text-gray-400 leading-none">100% Unique</div>
              </div>
            </motion.div>
          </motion.div>

          {/* 4. CV Builder (Top Right) */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [150, -150]) }}
            className="absolute top-[22%] right-[5%] lg:right-[15%] hidden sm:block"
          >
            <motion.div
              animate={{ y: [-9, 9, -9] }}
              transition={{ duration: 5.1, repeat: Infinity, ease: 'easeInOut', delay: 1.8 }}
              className="backdrop-blur-sm bg-white/90 rounded-[18px] p-3.5 shadow-xl shadow-indigo-500/5 border border-gray-100 w-44 transform rotate-2 hover:-rotate-1 transition-transform pointer-events-auto"
            >
              <div className="flex items-start gap-3">
                <div className="size-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <span className="material-symbols-outlined text-[18px]">description</span>
                </div>
                <div className="w-full space-y-1.5 pt-1">
                  <div className="h-1.5 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-1 bg-gray-100 rounded-full w-5/6"></div>
                  <div className="h-1 bg-gray-100 rounded-full w-4/6"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* 5. Learning Plan (Mid Right) */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [-120, 120]) }}
            className="absolute top-[50%] right-[2%] lg:right-[10%] hidden sm:block"
          >
            <motion.div
              animate={{ y: [-11, 11, -11] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              className="backdrop-blur-sm bg-white/90 rounded-[18px] p-3.5 shadow-xl shadow-indigo-500/5 border border-gray-100 w-52 transform -rotate-1 hover:rotate-1 transition-transform pointer-events-auto"
            >
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2 text-[12px] font-bold text-gray-900">
                  <div className="size-6 bg-purple-50 rounded flex items-center justify-center">
                    <span className="material-symbols-outlined text-purple-600 text-[14px]">
                      psychology
                    </span>
                  </div>
                  Learning
                </div>
                <span className="text-[9px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Wk 3
                </span>
              </div>
              <div className="text-[10px] text-gray-500 leading-snug">
                Mastering React Hooks & React Context.
              </div>
            </motion.div>
          </motion.div>

          {/* 6. Job Finder (Bottom Right) */}
          <motion.div
            style={{ y: useTransform(scrollYProgress, [0, 1], [180, -180]) }}
            className="absolute top-[78%] right-[8%] lg:right-[18%] hidden md:block"
          >
            <motion.div
              animate={{ y: [-7, 7, -7] }}
              transition={{ duration: 3.9, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
              className="backdrop-blur-sm bg-white/90 rounded-full pr-4 p-2 shadow-xl shadow-indigo-500/5 border border-gray-100 transform rotate-3 hover:rotate-0 transition-transform pointer-events-auto flex items-center gap-2.5"
            >
              <div className="size-8 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-500 shrink-0">
                <span className="material-symbols-outlined text-[16px]">work</span>
              </div>
              <div>
                <div className="text-[12px] font-bold text-gray-900 leading-none mb-1">
                  UX Intern
                </div>
                <div className="text-[10px] text-gray-400 leading-none">Microsoft · Remote</div>
              </div>
            </motion.div>
          </motion.div>
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
