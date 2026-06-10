import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CheckIcon,
  DocumentTextIcon,
  CalendarDaysIcon,
  AcademicCapIcon,
  SparklesIcon,
} from '@heroicons/react/24/solid';

const CENTER_POP_DELAY = 0.1;
const LINES_START = 0.55;
const LINE_DURATION = 0.6;
const LINE_STAGGER = 0.18;

type NodeType = 'icon' | 'photo' | 'white';
type LineFrom = 'center' | 'leftHub' | 'rightHub';

type NodeCfg = {
  id: string;
  x: number;
  y: number;
  type: NodeType;
  lineFrom: LineFrom;
  bgClass?: string;
  photoUrl?: string;
  icon?: React.ReactNode;
  size: number; // px — equals the w-/h- arbitrary class below (for offset math)
  sizeClass: string;
  floatDuration: number;
  floatY: number[];
};

// SVG viewBox 1024 × 300; badge centre at (CX, CY)
const CX = 512;
const CY = 150;

// Fishbone fork points — corner nodes branch off here, NOT from dead centre.
// This reproduces the reference: 2 horizontal spines + 4 forked branches.
const HUB_DX = 150;
const LEFT_HUB = { x: CX - HUB_DX, y: CY };
const RIGHT_HUB = { x: CX + HUB_DX, y: CY };

// Order: spines (far photo / white card) draw first, then the forked corners.
const NODES: NodeCfg[] = [
  {
    id: 'far-left',
    x: -378,
    y: 0,
    type: 'photo',
    lineFrom: 'center', // horizontal spine through the left hub
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    size: 76,
    sizeClass: 'w-[76px] h-[76px]',
    floatDuration: 5.4,
    floatY: [5, -6, 5],
  },
  {
    id: 'far-right',
    x: 378,
    y: -2,
    type: 'white',
    lineFrom: 'center', // horizontal spine through the right hub
    icon: <SparklesIcon className="w-8 h-8 text-[#7C3AED]" />,
    size: 84,
    sizeClass: 'w-[84px] h-[84px]',
    floatDuration: 5.6,
    floatY: [5, -5, 5],
  },
  {
    id: 'top-left',
    x: -272,
    y: -76,
    type: 'icon',
    lineFrom: 'leftHub',
    bgClass: 'bg-[#F59E0B]',
    icon: <DocumentTextIcon className="w-7 h-7 text-white" />,
    size: 66,
    sizeClass: 'w-[66px] h-[66px]',
    floatDuration: 4.2,
    floatY: [-5, 5, -5],
  },
  {
    id: 'bottom-left',
    x: -246,
    y: 58,
    type: 'icon',
    lineFrom: 'leftHub',
    bgClass: 'bg-[#3B82F6]',
    icon: <CalendarDaysIcon className="w-7 h-7 text-white" />,
    size: 66,
    sizeClass: 'w-[66px] h-[66px]',
    floatDuration: 4.8,
    floatY: [6, -4, 6],
  },
  {
    id: 'top-right',
    x: 248,
    y: -66,
    type: 'icon',
    lineFrom: 'rightHub',
    bgClass: 'bg-[#EF4444]',
    icon: <AcademicCapIcon className="w-7 h-7 text-white" />,
    size: 66,
    sizeClass: 'w-[66px] h-[66px]',
    floatDuration: 3.9,
    floatY: [-6, 4, -6],
  },
  {
    id: 'bottom-right',
    x: 272,
    y: 72,
    type: 'photo',
    lineFrom: 'rightHub',
    photoUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    size: 64,
    sizeClass: 'w-[64px] h-[64px]',
    floatDuration: 4.5,
    floatY: [4, -7, 4],
  },
];

const ALL_CARDS_DONE = LINES_START + 5 * LINE_STAGGER + LINE_DURATION;

function hubFor(from: LineFrom) {
  if (from === 'leftHub') return LEFT_HUB;
  if (from === 'rightHub') return RIGHT_HUB;
  return { x: CX, y: CY };
}

function TypewriterLine({ text, startDelay }: { text: string; startDelay: number }) {
  return (
    <>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, delay: startDelay + i * 0.04, ease: 'easeOut' }}
          className="inline-block whitespace-pre"
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </>
  );
}

function NodeCard({ node }: { node: NodeCfg }) {
  if (node.type === 'photo') {
    return (
      <div
        className={`${node.sizeClass} rounded-[20px] overflow-hidden border-[5px] border-white shadow-[0_10px_30px_-6px_rgba(0,0,0,0.22)]`}
      >
        <img src={node.photoUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
      </div>
    );
  }

  if (node.type === 'white') {
    return (
      <div
        className={`${node.sizeClass} rounded-[20px] bg-white border border-gray-100 flex items-center justify-center shadow-[0_10px_30px_-6px_rgba(0,0,0,0.12)]`}
      >
        {node.icon}
      </div>
    );
  }

  return (
    <div
      className={`${node.sizeClass} ${node.bgClass} rounded-[18px] flex items-center justify-center shadow-[0_10px_26px_-6px_rgba(0,0,0,0.28)]`}
    >
      {node.icon}
    </div>
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
      {/* ── Visual Network — fishbone: 2 spines + 4 forked branches ── */}
      <div className="relative w-full max-w-[1024px] h-[300px] flex items-center justify-center pointer-events-none">
        <svg
          className="absolute inset-0 w-full h-full z-0 overflow-visible"
          viewBox="0 0 1024 300"
          fill="none"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {NODES.map((node, i) => {
            const tx = CX + node.x;
            const ty = CY + node.y;
            const start = hubFor(node.lineFrom);
            const lineDelay = LINES_START + i * LINE_STAGGER;

            // Dot sits 52px from the node centre, back along the line toward its start
            const dx = start.x - tx;
            const dy = start.y - ty;
            const len = Math.sqrt(dx * dx + dy * dy);
            const dotX = tx + (dx / len) * 52;
            const dotY = ty + (dy / len) * 52;

            return (
              <React.Fragment key={node.id}>
                <motion.path
                  d={`M${start.x},${start.y} L${tx},${ty}`}
                  stroke="#dfe2e8"
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
            className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] shadow-[0_14px_50px_rgba(109,40,217,0.45)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            {/* Check sits inside a thin white ring — matches reference focal point */}
            <div className="w-[70px] h-[70px] rounded-full border-[3px] border-white/90 flex items-center justify-center">
              <CheckIcon className="w-9 h-9 text-white" />
            </div>
          </motion.div>
        </motion.div>

        {/* ── Satellite Nodes — one by one, after their line arrives ── */}
        {/* Positioned by % of the same 1024×300 coordinate space as the SVG, so
            nodes and lines stay aligned at any container width. */}
        {NODES.map((node, i) => {
          const toolDelay = LINES_START + i * LINE_STAGGER + LINE_DURATION;
          const leftPct = ((CX + node.x) / 1024) * 100;
          const topPct = ((CY + node.y) / 300) * 100;
          return (
            <div
              key={node.id}
              className="absolute z-10 pointer-events-auto -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${leftPct}%`, top: `${topPct}%` }}
            >
              <motion.div
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
                >
                  <NodeCard node={node} />
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* ── Typography + CTA — typewriter after the last node appears ── */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 relative z-20 mt-6">
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
