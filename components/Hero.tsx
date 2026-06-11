import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';

const CENTER_POP_DELAY = 0.1;
const LINES_START = 0.55;
const LINE_DURATION = 0.6;
const LINE_STAGGER = 0.18;

type NodeCfg = {
  id: string;
  x: number;
  y: number;
  icon: React.ReactNode;
  size: number; // px — equals the w-/h- arbitrary class below (for offset math)
  sizeClass: string;
  dot: boolean; // reference shows purple dots only on the corner-node lines
  floatDuration: number;
  floatY: number[];
};

// SVG viewBox 1024 × 300; badge centre at (CX, CY)
const CX = 512;
const CY = 150;

// Per-side fork points. All three lines of a side converge here and STOP —
// in the reference no line touches the badge (≈60px gap to the badge edge).
const LEFT_FORK = { x: CX - 115, y: CY };
const RIGHT_FORK = { x: CX + 115, y: CY + 4 };

// Positions traced from the reference image (relative to badge centre).
// Order = draw order: horizontal arms first, then corner nodes.
// All nodes are white cards holding 3D product icons (small webp copies of
// the originals in public/icons — the sources are up to 7MB, hero uses ~5KB).
const NODES: NodeCfg[] = [
  {
    id: 'far-left',
    x: -420,
    y: -2,
    icon: <img src="/icons/hero-folder.webp" alt="" className="w-2/3 h-2/3 object-contain" />,
    size: 108,
    sizeClass: 'w-[108px] h-[108px]',
    dot: false,
    floatDuration: 5.4,
    floatY: [5, -6, 5],
  },
  {
    id: 'far-right',
    x: 418,
    y: -2,
    icon: <SparklesIcon className="w-10 h-10 text-[#7C3AED]" />,
    size: 100,
    sizeClass: 'w-[100px] h-[100px]',
    dot: false,
    floatDuration: 5.6,
    floatY: [5, -5, 5],
  },
  {
    id: 'top-left',
    x: -305,
    y: -95,
    icon: <img src="/icons/hero-plagiarism.webp" alt="" className="w-2/3 h-2/3 object-contain" />,
    size: 78,
    sizeClass: 'w-[78px] h-[78px]',
    dot: true,
    floatDuration: 4.2,
    floatY: [-5, 5, -5],
  },
  {
    id: 'bottom-left',
    x: -272,
    y: 80,
    icon: <img src="/icons/hero-telegram.webp" alt="" className="w-2/3 h-2/3 object-contain" />,
    size: 90,
    sizeClass: 'w-[90px] h-[90px]',
    dot: true,
    floatDuration: 4.8,
    floatY: [6, -4, 6],
  },
  {
    id: 'top-right',
    x: 272,
    y: -85,
    icon: <img src="/icons/hero-ats.webp" alt="" className="w-2/3 h-2/3 object-contain" />,
    size: 90,
    sizeClass: 'w-[90px] h-[90px]',
    dot: true,
    floatDuration: 3.9,
    floatY: [-6, 4, -6],
  },
  {
    id: 'bottom-right',
    x: 305,
    y: 95,
    icon: <img src="/icons/hero-cv.webp" alt="" className="w-2/3 h-2/3 object-contain" />,
    size: 78,
    sizeClass: 'w-[78px] h-[78px]',
    dot: true,
    floatDuration: 4.5,
    floatY: [4, -7, 4],
  },
];

const ALL_CARDS_DONE = LINES_START + 5 * LINE_STAGGER + LINE_DURATION;

/* CTA button (Uiverse by adamgiebl, "cssbuttons-io"): black at rest, the skewed
   overlay slides away on hover revealing the purple gradient. Shipped inline via
   <style> so it can't go stale with the cached /styles.css. */
const HERO_CTA_CSS = `
.hero-cta {
  position: relative;
  font-family: inherit;
  font-weight: 600;
  font-size: 17px;
  letter-spacing: 0.04em;
  border-radius: 0.8em;
  cursor: pointer;
  border: none;
  background: linear-gradient(to right, #8e2de2, #4a00e0);
  color: ghostwhite;
  overflow: hidden;
  box-shadow: 0 12px 32px -8px rgba(110, 30, 220, 0.55);
}
.hero-cta svg {
  width: 1.2em;
  height: 1.2em;
  margin-right: 0.5em;
}
.hero-cta span {
  position: relative;
  z-index: 10;
  display: inline-flex;
  align-items: center;
  padding: 0.8em 1.3em 0.8em 1.1em;
  transition: color 0.4s;
}
.hero-cta::before {
  content: "";
  position: absolute;
  top: 0;
  left: -10%;
  width: 120%;
  height: 100%;
  background: #000;
  transform: skew(30deg);
  transition: transform 0.4s cubic-bezier(0.3, 1, 0.8, 1);
}
.hero-cta:hover::before {
  transform: translate3d(100%, 0, 0);
}
.hero-cta:active {
  transform: scale(0.95);
}
`;

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
  return (
    <div
      className={`${node.sizeClass} rounded-[22px] bg-white border border-gray-100 flex items-center justify-center shadow-[0_18px_40px_-8px_rgba(0,0,0,0.22),0_4px_12px_rgba(0,0,0,0.06)]`}
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
      {/* ── Visual Network — per side: 3 lines converge at a floating fork ── */}
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
            const fork = node.x < 0 ? LEFT_FORK : RIGHT_FORK;
            const lineDelay = LINES_START + i * LINE_STAGGER;

            // Corner nodes: angular two-segment path — horizontal out of the node,
            // then a 45° diagonal into the fork. The bend sits |dy| away from the
            // fork horizontally so the diagonal is exactly 45° (reference geometry).
            // Far nodes: single straight horizontal segment.
            const dy = ty - fork.y;
            const bendX = fork.x + (node.x > 0 ? Math.abs(dy) : -Math.abs(dy));
            const d = node.dot
              ? `M${fork.x},${fork.y} L${bendX},${ty} L${tx},${ty}`
              : `M${fork.x},${fork.y} L${tx},${ty}`;

            return (
              <React.Fragment key={node.id}>
                <motion.path
                  d={d}
                  stroke="#D1D5DB"
                  strokeWidth="1.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: LINE_DURATION, delay: lineDelay, ease: 'easeOut' }}
                />
                {/* Solid dot AT the junction (bend) point, as in the reference */}
                {node.dot && (
                  <motion.circle
                    cx={bendX}
                    cy={ty}
                    r="3.5"
                    fill="#7C3AED"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      delay: lineDelay + LINE_DURATION * 0.55,
                      type: 'spring',
                      stiffness: 420,
                      damping: 18,
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </svg>

        {/* ── Centre Badge — first to appear ── */}
        {/* Centering translate lives on a plain div: framer-motion overwrites the
            inline transform of whatever it animates, so scale/float must sit on
            separate inner layers or the badge drifts off-centre. */}
        <div className="absolute z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
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
              className="w-32 h-32 rounded-[2.2rem] bg-white border border-gray-100 shadow-[0_18px_56px_rgba(124,58,237,0.35),0_6px_18px_rgba(0,0,0,0.08)] flex items-center justify-center overflow-hidden pointer-events-auto"
            >
              {/* 3D student avatar (de-watermarked small webp) as the network hub */}
              <img
                src="/icons/hero-student.webp"
                alt="StudentOS student avatar"
                className="w-[88%] h-[88%] object-contain"
              />
            </motion.div>
          </motion.div>
        </div>

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
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: line2End + 0.45, duration: 0.5 }}
        >
          <style>{HERO_CTA_CSS}</style>
          <button type="button" onClick={() => navigate('/signup/step-1')} className="hero-cta">
            <span>
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M0 0h24v24H0z" fill="none" />
                <path
                  d="M13.25 3.75a.75.75 0 01.75-.75h6a.75.75 0 01.75.75v6a.75.75 0 01-1.5 0V5.56l-8.22 8.22a.75.75 0 11-1.06-1.06l8.22-8.22h-4.19a.75.75 0 01-.75-.75zM5.25 6A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75v-5a.75.75 0 00-1.5 0v5a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V8.25a.75.75 0 01.75-.75h5a.75.75 0 000-1.5h-5z"
                  fill="currentColor"
                />
              </svg>
              Get Started
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
