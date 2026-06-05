'use client';

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  CheckIcon,
  CalendarDaysIcon,
  ClockIcon,
  ChartBarIcon,
  UsersIcon,
  SparklesIcon,
  BookOpenIcon,
  FireIcon,
  BoltIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/solid';

/* ═══════════════════════════════════════════════════
   COORDINATE SYSTEM
   Design reference: 1440 × 920 px section
   Hub center: (720, 330)
   Cards are desktop-only (hidden below lg)
══════════════════════════════════════════════════════ */

const SVG_W = 1440;
const SVG_H = 920;
const HUB = { x: 720, y: 330 }; // hub center in SVG coords

/* Each card:
   - css: absolute positioning for card div
   - svgC: center of card in SVG coordinate space (for connector line)
   - float: stagger delay & duration for the y-loop animation */
const CARDS = [
  {
    id: 'schedule',
    pos: 'top-[62px] left-[58px]',
    svgC: { x: 172, y: 130 },
    float: { delay: 0, duration: 3.6 },
    mount: { delay: 0.1 },
  },
  {
    id: 'gpa',
    pos: 'top-[44px] right-[68px]',
    svgC: { x: 1267, y: 101 },
    float: { delay: 0.4, duration: 4.0 },
    mount: { delay: 0.2 },
  },
  {
    id: 'deadline',
    pos: 'top-[296px] left-[18px]',
    svgC: { x: 135, y: 364 },
    float: { delay: 0.8, duration: 3.8 },
    mount: { delay: 0.3 },
  },
  {
    id: 'progress',
    pos: 'top-[308px] right-[18px]',
    svgC: { x: 1305, y: 373 },
    float: { delay: 1.2, duration: 4.2 },
    mount: { delay: 0.4 },
  },
  {
    id: 'group',
    pos: 'top-[528px] left-[52px]',
    svgC: { x: 167, y: 597 },
    float: { delay: 1.6, duration: 3.5 },
    mount: { delay: 0.5 },
  },
  {
    id: 'tools',
    pos: 'top-[546px] right-[58px]',
    svgC: { x: 1270, y: 608 },
    float: { delay: 2.0, duration: 3.9 },
    mount: { delay: 0.6 },
  },
] as const;

type CardId = (typeof CARDS)[number]['id'];

/* ── SVG connector lines ── */
function ConnectorLines({ visible }: { visible: boolean }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      preserveAspectRatio="xMidYMid slice"
    >
      {CARDS.map((card, i) => (
        <g key={card.id}>
          {/* Connector line */}
          <motion.line
            x1={HUB.x}
            y1={HUB.y}
            x2={card.svgC.x}
            y2={card.svgC.y}
            stroke="#C4B5FD"
            strokeWidth="1.5"
            strokeDasharray="5 5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={visible ? { pathLength: 1, opacity: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.4 + i * 0.12, ease: 'easeInOut' }}
          />
          {/* Dot at card end */}
          <motion.circle
            cx={card.svgC.x}
            cy={card.svgC.y}
            r={4}
            fill="#7C3AED"
            initial={{ scale: 0, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 1.2 + i * 0.1 }}
          />
          {/* Dot at hub end */}
          <motion.circle
            cx={HUB.x + Math.sign(card.svgC.x - HUB.x) * 64}
            cy={HUB.y + Math.sign(card.svgC.y - HUB.y) * 64}
            r={3}
            fill="#A78BFA"
            initial={{ scale: 0, opacity: 0 }}
            animate={visible ? { scale: 1, opacity: 1 } : {}}
            transition={{ duration: 0.3, delay: 0.9 + i * 0.1 }}
          />
        </g>
      ))}
    </svg>
  );
}

/* ── Card contents ── */
function CardContent({ id }: { id: CardId }) {
  if (id === 'schedule') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 w-[228px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
            <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Today's Schedule</span>
        </div>
        {[
          { time: '09:00', label: 'Mathematics', dot: 'bg-indigo-500' },
          { time: '11:30', label: 'Computer Science', dot: 'bg-emerald-500' },
          { time: '14:00', label: 'Physics Lab', dot: 'bg-amber-500' },
        ].map((item) => (
          <div
            key={item.time}
            className="flex items-center gap-2 py-1.5 border-b border-slate-50 last:border-0"
          >
            <span className="text-[10px] text-slate-400 w-9 font-semibold">{item.time}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${item.dot} flex-shrink-0`} />
            <span className="text-xs text-slate-600 font-medium">{item.label}</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'gpa') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 w-[210px]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <ChartBarIcon className="w-4 h-4 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-slate-700">GPA Tracker</span>
          </div>
          <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full">
            ↑ +0.2
          </span>
        </div>
        <div className="flex items-baseline gap-1 mt-1 mb-2">
          <span className="text-3xl font-black text-slate-900">4.0</span>
          <span className="text-xs text-slate-400 font-semibold">/ 4.0</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: '95%' }}
            transition={{ duration: 1, delay: 1.2 }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5">This semester</p>
      </div>
    );
  }

  if (id === 'deadline') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 w-[234px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
            <BoltIcon className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-xs font-bold text-slate-700">Upcoming Deadlines</span>
          <span className="ml-auto text-[9px] bg-rose-100 text-rose-600 font-bold px-1.5 py-0.5 rounded-full">
            2 due
          </span>
        </div>
        {[
          { label: 'CS Assignment', when: 'Tomorrow', color: 'text-rose-500' },
          { label: 'Math Quiz', when: 'Thu, Jan 23', color: 'text-amber-500' },
          { label: 'Essay Draft', when: 'Fri, Jan 24', color: 'text-slate-400' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"
          >
            <span className="text-xs text-slate-600 font-medium">{item.label}</span>
            <span className={`text-[10px] font-bold ${item.color}`}>{item.when}</span>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'progress') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 w-[234px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
            <BookOpenIcon className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-xs font-bold text-slate-700">Course Progress</span>
        </div>
        {[
          { label: 'Mathematics', pct: 78, color: 'from-indigo-400 to-indigo-500' },
          { label: 'Physics', pct: 42, color: 'from-amber-400 to-orange-400' },
          { label: 'Comp. Sci', pct: 95, color: 'from-emerald-400 to-teal-400' },
        ].map((c, i) => (
          <div key={c.label} className="mb-2 last:mb-0">
            <div className="flex justify-between mb-0.5">
              <span className="text-[10px] text-slate-500 font-medium">{c.label}</span>
              <span className="text-[10px] text-slate-700 font-bold">{c.pct}%</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full bg-gradient-to-r ${c.color} rounded-full`}
                initial={{ width: 0 }}
                animate={{ width: `${c.pct}%` }}
                transition={{ duration: 0.9, delay: 1.3 + i * 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (id === 'group') {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-3 w-[230px]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700">Your Study Group</span>
          <span className="text-[9px] text-indigo-600 font-bold">8 members</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { src: 'https://i.pravatar.cc/80?img=12', empty: false },
            { src: 'https://i.pravatar.cc/80?img=47', empty: false },
            { src: 'https://i.pravatar.cc/80?img=33', empty: false },
            { src: 'https://i.pravatar.cc/80?img=8', empty: false },
            { src: '', empty: true, label: '+4' },
            { src: 'https://i.pravatar.cc/80?img=59', empty: false },
          ].map((cell, i) =>
            cell.empty ? (
              <div
                key={i}
                className="aspect-square bg-indigo-50 rounded-xl flex items-center justify-center"
              >
                <span className="text-[10px] font-black text-indigo-500">{cell.label}</span>
              </div>
            ) : (
              <div key={i} className="aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={cell.src} alt="" className="w-full h-full object-cover" />
              </div>
            )
          )}
        </div>
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[10px] text-slate-400">Active now</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] font-semibold text-emerald-600">3 online</span>
        </div>
      </div>
    );
  }

  if (id === 'tools') {
    const tools = [
      { Icon: AcademicCapIcon, color: 'bg-indigo-100 text-indigo-600', label: 'CV' },
      { Icon: ChartBarIcon, color: 'bg-emerald-100 text-emerald-600', label: 'ATS' },
      { Icon: SparklesIcon, color: 'bg-amber-100 text-amber-600', label: 'AI' },
      { Icon: BookOpenIcon, color: 'bg-violet-100 text-violet-600', label: 'Plans' },
      { Icon: FireIcon, color: 'bg-rose-100 text-rose-600', label: 'Habits' },
      { Icon: ClockIcon, color: 'bg-sky-100 text-sky-600', label: 'Track' },
    ];
    return (
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-4 w-[222px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
            <SparklesIcon className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-xs font-bold text-slate-700">AI Study Tools</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {tools.map(({ Icon, color, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[9px] font-semibold text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* ── Center hub icon ── */
function HubIcon({ visible }: { visible: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={visible ? { opacity: 1, scale: 1 } : {}}
      transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.05 }}
      className="relative"
    >
      {/* Outer glow ring */}
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-[2rem] bg-violet-400 blur-2xl"
      />
      {/* Main icon */}
      <div className="relative w-[120px] h-[120px] rounded-[2rem] bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-violet-500/40">
        <AcademicCapIcon className="w-14 h-14 text-white" />
      </div>
      {/* Checkmark badge */}
      <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
        <CheckIcon className="w-4 h-4 text-white" />
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════ */
/* MAIN COMPONENT                                      */
/* ══════════════════════════════════════════════════ */

export default function TrustlineHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Short rAF delay ensures layout is stable before animations start
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative w-full min-h-[920px] bg-[#F8FAFC] overflow-hidden font-sans">
      {/* ── Subtle background radial gradient ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-violet-100/60 to-transparent rounded-full blur-3xl" />
      </div>

      {/* ── LAYER 0: SVG connector lines ── */}
      <div className="absolute inset-0 hidden lg:block">
        <ConnectorLines visible={mounted} />
      </div>

      {/* ── LAYER 1: 6 floating cards (desktop only) ── */}
      <div className="absolute inset-0 pointer-events-none hidden lg:block">
        {CARDS.map((card) => (
          <motion.div
            key={card.id}
            className={`absolute pointer-events-auto ${card.pos}`}
            /* Mount: staggered fade+scale in */
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 100,
              damping: 18,
              delay: card.mount.delay,
            }}
          >
            {/* Continuous float loop (runs after mount via AnimatePresence-free approach) */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{
                duration: card.float.duration,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: card.float.delay,
              }}
            >
              <CardContent id={card.id} />
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* ── LAYER 2: Center hub icon ── */}
      {/* Positioned at the hub's CSS location (matches SVG HUB coords) */}
      {/* hub center: top = HUB.y(330) - half icon(60) = 270px */}
      <div className="absolute hidden lg:flex items-center justify-center top-[270px] left-1/2 -translate-x-1/2 z-20">
        <HubIcon visible={mounted} />
      </div>

      {/* ── LAYER 3: Center text & CTA ── */}
      <div className="relative z-[30] flex flex-col items-center justify-center text-center px-4 pt-16 lg:pt-0">
        {/* Spacer: HUB.y(330) + half icon(60) + gap(48) = 438px */}
        <div className="hidden lg:block h-[438px]" />

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.7 }}
          className="mb-5 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-50 border border-violet-200"
        >
          <span className="w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
            <CheckIcon className="w-2.5 h-2.5 text-white" />
          </span>
          <span className="text-sm font-semibold text-violet-700">
            Built for students, by students
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] max-w-3xl"
        >
          All-in-one{' '}
          <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            student platform
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.95 }}
          className="mt-5 text-lg md:text-xl text-slate-500 max-w-xl leading-relaxed"
        >
          Organize your studies, track deadlines, improve your CV, and land your first role — all
          from one place.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3"
        >
          <Link
            to="/signup/step-1"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-7 py-3.5 rounded-full font-semibold text-sm shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-200"
          >
            Get Started Free
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 px-6 py-3.5 rounded-full font-medium text-sm border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition-all duration-200"
          >
            See how it works
          </Link>
        </motion.div>

        {/* Social proof strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-8 flex items-center gap-3 pb-12"
        >
          <div className="flex -space-x-2">
            {['12', '47', '33', '8', '59'].map((n) => (
              <img
                key={n}
                src={`https://i.pravatar.cc/40?img=${n}`}
                alt=""
                className="w-8 h-8 rounded-full border-2 border-white"
              />
            ))}
          </div>
          <p className="text-sm text-slate-500">
            <span className="font-bold text-slate-700">10,000+</span> students already using
            StudentOS
          </p>
        </motion.div>
      </div>
    </section>
  );
}
