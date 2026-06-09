import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid';

const CENTER_POP_DELAY = 0.1;
const LINES_START = 0.55;
const LINE_DURATION = 0.6;
const LINE_STAGGER = 0.2;

type NodeCfg = {
  id: string;
  x: number;
  y: number;
  bg: string;
  icon: React.ReactNode;
  floatDuration: number;
  floatY: number[];
};

// Reference layout: 2 far horizontal arms (y≈0) + 4 diagonal nodes (y≈±50px)
// Much flatter than before — horizontal spread dominates, vertical is minimal
const NODES: NodeCfg[] = [
  {
    id: 'top-left',
    x: -265,
    y: -50,
    bg: '#F97316',
    icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
    floatDuration: 4.2,
    floatY: [-5, 5, -5],
  },
  {
    id: 'far-left',
    x: -415,
    y: 0,
    bg: '#3B82F6',
    icon: <MagnifyingGlassIcon className="w-7 h-7 text-white" />,
    floatDuration: 5.4,
    floatY: [5, -6, 5],
  },
  {
    id: 'bottom-left',
    x: -238,
    y: 50,
    bg: '#22C55E',
    icon: <CalendarDaysIcon className="w-7 h-7 text-white" />,
    floatDuration: 4.8,
    floatY: [6, -4, 6],
  },
  {
    id: 'top-right',
    x: 252,
    y: -52,
    bg: '#F43F5E',
    icon: <AcademicCapIcon className="w-7 h-7 text-white" />,
    floatDuration: 3.9,
    floatY: [-6, 4, -6],
  },
  {
    id: 'far-right',
    x: 420,
    y: 0,
    bg: '#7C3AED',
    icon: <BriefcaseIcon className="w-7 h-7 text-white" />,
    floatDuration: 5.6,
    floatY: [5, -5, 5],
  },
  {
    id: 'bottom-right',
    x: 256,
    y: 48,
    bg: '#14B8A6',
    icon: <UserGroupIcon className="w-7 h-7 text-white" />,
    floatDuration: 4.5,
    floatY: [4, -7, 4],
  },
];

// SVG center matches 50% of the 280px-tall container
const CX = 512;
const CY = 140;

const ALL_CARDS_DONE = LINES_START + 5 * LINE_STAGGER + LINE_DURATION;

function TypewriterLine({ text, startDelay }: { text: string; startDelay: number }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: startDelay + i * 0.04, ease: 'easeOut' }}
          className="inline-block"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </>
  );
}

export default function Hero() {
  const navigate = useNavigate();

  const line1 = 'All-in-one Student';
  const line2 = 'platform';
  const line1End = ALL_CARDS_DONE + line1.length * 0.04;
  const line2End = line1End + 0.06 + line2.length * 0.04;

  return (
    <section className="relative w-full flex flex-col items-center pt-[120px] pb-20 overflow-visible z-20 bg-white">
      {/* ── Visual Network ── */}
      {/* 280px tall container keeps the flat network compact — text sits close below */}
      <div className="relative w-full max-w-[1024px] h-[280px] flex items-center justify-center pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full z-0 overflow-visible"
          viewBox="0 0 1024 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {NODES.map((node, i) => {
            const tx = CX + node.x;
            const ty = CY + node.y;
            const lineDelay = LINES_START + i * LINE_STAGGER;

            const len = Math.sqrt(node.x * node.x + node.y * node.y);
            const f = 1 - 52 / len;
            const dotX = CX + node.x * f;
            const dotY = CY + node.y * f;

            return (
              <React.Fragment key={node.id}>
                <motion.path
                  d={`M${CX},${CY} L${tx},${ty}`}
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: LINE_DURATION, delay: lineDelay, ease: 'easeOut' }}
                />
                <motion.circle
                  cx={dotX}
                  cy={dotY}
                  r="4"
                  fill="#7C3AED"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: lineDelay + LINE_DURATION,
                    type: 'spring',
                    stiffness: 420,
                    damping: 18,
                  }}
                />
              </React.Fragment>
            );
          })}
        </svg>

        {/* ── Centre Badge — first to appear ── */}
        <motion.div
          className="absolute z-10"
          style={{ left: '50%', top: '50%' }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 0.95, 1] }}
          transition={{ delay: CENTER_POP_DELAY, duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
        >
          <motion.div
            animate={{ y: [-6, 6, -6] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: CENTER_POP_DELAY + 0.7,
            }}
            className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_12px_48px_rgba(109,40,217,0.45)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <CheckIcon className="w-12 h-12 text-white" />
          </motion.div>
        </motion.div>

        {/* ── Satellite Tool Cards — one by one after their line arrives ── */}
        {NODES.map((node, i) => {
          const toolDelay = LINES_START + i * LINE_STAGGER + LINE_DURATION;
          return (
            <motion.div
              key={node.id}
              className="absolute z-10"
              style={{
                left: '50%',
                top: '50%',
                marginLeft: node.x,
                marginTop: node.y,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: toolDelay,
                type: 'spring',
                stiffness: 280,
                damping: 17,
              }}
            >
              <motion.div
                animate={{ y: node.floatY }}
                transition={{
                  duration: node.floatDuration,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: toolDelay + 0.5,
                }}
                className="w-[70px] h-[70px] rounded-[18px] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-[0_8px_24px_-4px_rgba(0,0,0,0.2)]"
                style={{ backgroundColor: node.bg }}
              >
                {node.icon}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Typography + CTA — typewriter after last card appears ── */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 relative z-20 mt-4">
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-[#111827] leading-[1.05]">
          <TypewriterLine text={line1} startDelay={ALL_CARDS_DONE} />
          <br />
          <TypewriterLine text={line2} startDelay={line1End + 0.06} />
        </h1>
        <motion.p
          className="text-lg text-gray-400 max-w-xl mx-auto mt-6 leading-relaxed"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: line2End + 0.15, duration: 0.55 }}
        >
          StudentOS is a modern, all-in-one student platform designed to perfectly fit your academic
          needs.
        </motion.p>
        <motion.button
          type="button"
          onClick={() => navigate('/signup/step-1')}
          className="mt-8 px-9 py-4 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base shadow-lg shadow-violet-500/30 transition-all active:scale-95"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: line2End + 0.45, duration: 0.5 }}
        >
          Get Started
        </motion.button>
      </div>
    </section>
  );
}
