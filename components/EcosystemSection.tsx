'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { UserGroupIcon, Squares2X2Icon, AcademicCapIcon } from '@heroicons/react/24/solid';

/* ─── Animation config ──────────────────────────────── */
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const nodeVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.2 + i * 0.2, duration: 0.7, ease: smoothEase },
  }),
};

/* ─── Flowing dashes CSS ──────────────────────────────── */
const flowCSS = `
@keyframes dashFlow {
  to { stroke-dashoffset: -24; }
}
.arrow-flow {
  stroke-dasharray: 8 8;
  stroke-dashoffset: 0;
  animation: dashFlow 0.8s linear infinite;
}
`;

/* ─── Inline Arrow Connector Component ──────────────── */
function ArrowConnector({ vertical = false }: { vertical?: boolean }) {
  if (vertical) {
    return (
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: smoothEase }}
        className="flex flex-col items-center gap-0 origin-top"
      >
        <svg width="3" height="40" className="overflow-visible">
          <line
            x1="1.5"
            y1="0"
            x2="1.5"
            y2="40"
            stroke="#EF4444"
            strokeWidth="2.5"
            className="arrow-flow"
          />
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12">
          <polygon points="0,0 8,12 16,0" fill="#EF4444" />
        </svg>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      transition={{ delay: 0.6, duration: 0.5, ease: smoothEase }}
      className="flex items-center gap-0 origin-left"
    >
      <svg width="60" height="3" className="overflow-visible">
        <line
          x1="0"
          y1="1.5"
          x2="60"
          y2="1.5"
          stroke="#EF4444"
          strokeWidth="2.5"
          className="arrow-flow"
        />
      </svg>
      <svg width="12" height="16" viewBox="0 0 12 16">
        <polygon points="0,0 12,8 0,16" fill="#EF4444" />
      </svg>
    </motion.div>
  );
}

export default function EcosystemSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section
      ref={ref}
      className="w-full bg-white py-24 md:py-32 px-6 border-t border-gray-100 font-sans overflow-hidden"
    >
      <style>{flowCSS}</style>

      {/* Heading */}
      <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: smoothEase }}
          className="text-3xl md:text-5xl lg:text-[3.5rem] font-extrabold text-gray-900 tracking-tight leading-[1.1]"
        >
          The StudentOS Ecosystem
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6, ease: smoothEase }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mt-5 leading-relaxed"
        >
          Students and mentors connected through one intelligent platform.
        </motion.p>
      </div>

      {/* 3-Node Layout with inline arrows */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-center gap-0">
          {/* Students Node */}
          <motion.div
            custom={0}
            variants={nodeVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            className="w-[220px] bg-white rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all duration-300 cursor-default"
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
              <UserGroupIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Students</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Access tools, track progress, and build your career.
            </p>
          </motion.div>

          {/* Arrow 1: Students → StudentOS */}
          <div className="hidden md:flex items-center px-2">{inView && <ArrowConnector />}</div>
          <div className="md:hidden py-3">{inView && <ArrowConnector vertical />}</div>

          {/* StudentOS Center Node — highlighted */}
          <motion.div
            custom={1}
            variants={nodeVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            className="w-[260px] bg-indigo-600 rounded-3xl p-10 flex flex-col items-center text-center shadow-xl shadow-indigo-500/25 ring-1 ring-indigo-500/20 transition-all duration-300 cursor-default relative"
          >
            {/* Glow pulse */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.3, 0.15] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-indigo-400 rounded-3xl blur-xl"
            />
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-[72px] h-[72px] rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5">
                <Squares2X2Icon className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2">StudentOS</h3>
              <p className="text-sm text-indigo-100 leading-relaxed">
                The intelligent hub connecting everything together.
              </p>
            </div>
          </motion.div>

          {/* Arrow 2: StudentOS → Mentors */}
          <div className="hidden md:flex items-center px-2">{inView && <ArrowConnector />}</div>
          <div className="md:hidden py-3">{inView && <ArrowConnector vertical />}</div>

          {/* Mentors Node */}
          <motion.div
            custom={2}
            variants={nodeVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
            className="w-[220px] bg-white rounded-3xl p-8 flex flex-col items-center text-center border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200 transition-all duration-300 cursor-default"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-5">
              <AcademicCapIcon className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Mentors</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Guide students, share expertise, and make an impact.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
