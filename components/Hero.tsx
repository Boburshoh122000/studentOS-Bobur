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
const LINE_DURATION = 0.65;
const LINE_STAGGER = 0.12;

type NodeCfg = {
  id: string;
  x: number;
  y: number;
  bg: string;
  icon: React.ReactNode;
  floatDuration: number;
};

const NODES: NodeCfg[] = [
  {
    id: 'top-left',
    x: -250,
    y: -148,
    bg: '#F97316',
    icon: <DocumentTextIcon className="w-8 h-8 text-white" />,
    floatDuration: 4.2,
  },
  {
    id: 'far-left',
    x: -362,
    y: 18,
    bg: '#3B82F6',
    icon: <MagnifyingGlassIcon className="w-8 h-8 text-white" />,
    floatDuration: 5.1,
  },
  {
    id: 'bottom-left',
    x: -218,
    y: 178,
    bg: '#22C55E',
    icon: <CalendarDaysIcon className="w-8 h-8 text-white" />,
    floatDuration: 4.8,
  },
  {
    id: 'top-right',
    x: 252,
    y: -178,
    bg: '#F43F5E',
    icon: <AcademicCapIcon className="w-8 h-8 text-white" />,
    floatDuration: 3.9,
  },
  {
    id: 'far-right',
    x: 362,
    y: -8,
    bg: '#7C3AED',
    icon: <BriefcaseIcon className="w-8 h-8 text-white" />,
    floatDuration: 5.5,
  },
  {
    id: 'bottom-right',
    x: 238,
    y: 162,
    bg: '#14B8A6',
    icon: <UserGroupIcon className="w-8 h-8 text-white" />,
    floatDuration: 4.5,
  },
];

const CX = 512;
const CY = 225;

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full flex flex-col items-center pt-[140px] pb-24 overflow-visible z-20 bg-white">
      {/* ── Visual Network ── */}
      <div className="relative w-full max-w-[1024px] h-[450px] flex items-center justify-center pointer-events-none">
        {/* SVG Lines */}
        <svg
          className="absolute inset-0 w-full h-full z-0 overflow-visible"
          viewBox="0 0 1024 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {NODES.map((node, i) => {
            const tx = CX + node.x;
            const ty = CY + node.y;
            const lineDelay = LINES_START + i * LINE_STAGGER;

            // Dot sits 52px from the satellite card centre along the line vector
            const len = Math.sqrt(node.x * node.x + node.y * node.y);
            const f = 1 - 52 / len;
            const dotX = CX + node.x * f;
            const dotY = CY + node.y * f;

            return (
              <React.Fragment key={node.id}>
                {/* Thin gray connector line */}
                <motion.path
                  d={`M${CX},${CY} L${tx},${ty}`}
                  stroke="#d1d5db"
                  strokeWidth="1.5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: LINE_DURATION, delay: lineDelay, ease: 'easeOut' }}
                />
                {/* Purple dot — pops when line arrives */}
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

        {/* ── Centre Badge ── */}
        <motion.div
          className="absolute z-10"
          style={{ left: '50%', top: '50%' }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.18, 0.96, 1] }}
          transition={{ delay: CENTER_POP_DELAY, duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
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
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_8px_32px_rgba(109,40,217,0.38)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <CheckIcon className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>

        {/* ── Satellite Tool Cards ── */}
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
                animate={{ y: [-6, 6, -6] }}
                transition={{
                  duration: node.floatDuration,
                  repeat: Infinity,
                  repeatType: 'mirror',
                  ease: 'easeInOut',
                  delay: toolDelay + 0.4,
                }}
                className="w-20 h-20 rounded-[22px] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto shadow-[0_8px_28px_-4px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: node.bg }}
              >
                {node.icon}
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* ── Typography + CTA ── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: LINES_START + 6 * LINE_STAGGER + LINE_DURATION + 0.2, duration: 0.6 }}
        className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 relative z-20 mt-8"
      >
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-[#111827] leading-[1.05]">
          All-in-one Student
          <br />
          platform
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto mt-6 leading-relaxed">
          StudentOS is a modern, all-in-one student platform designed to perfectly fit your academic
          needs.
        </p>
        <button
          type="button"
          onClick={() => navigate('/signup/step-1')}
          className="mt-8 px-9 py-4 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-base shadow-lg shadow-violet-500/30 transition-all active:scale-95"
        >
          Get Started
        </button>
      </motion.div>
    </section>
  );
}
