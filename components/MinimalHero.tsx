'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

function MagneticButton({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 100, damping: 20, mass: 0.1 });
  const y = useSpring(0, { stiffness: 100, damping: 20, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.3);
    y.set(middleY * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: x.get(), y: y.get() }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Huge, slow-moving blurred orbs background
const GlowingOrbs = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Indigo Orb */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px] mix-blend-multiply"
      />

      {/* Purple Orb */}
      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.15, 0.2, 0.15],
          x: [0, -40, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500 rounded-full blur-[120px] mix-blend-multiply"
      />

      {/* Pink Highlight Orb */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-pink-400 rounded-full blur-[100px] mix-blend-multiply"
      />
    </div>
  );
};

// Floating "Wow" Factor 3D-like elements
const FloatingShapes = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -150]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -250]);
  const y3 = useTransform(scrollY, [0, 1000], [0, -100]);

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden hidden md:block">
      <motion.div style={{ y: y1 }} className="absolute top-32 left-[10%] drop-shadow-2xl">
        <motion.div
          animate={{ rotate: 360, y: [0, -20, 0] }}
          transition={{
            rotate: { duration: 40, repeat: Infinity, ease: 'linear' },
            y: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-500 to-purple-500 opacity-90 backdrop-blur-md border border-white/20 shadow-2xl"
        />
      </motion.div>

      <motion.div style={{ y: y2 }} className="absolute top-64 right-[10%] drop-shadow-2xl">
        <motion.div
          animate={{ rotate: -360, y: [0, 30, 0] }}
          transition={{
            rotate: { duration: 50, repeat: Infinity, ease: 'linear' },
            y: { duration: 7, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-32 h-32 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 opacity-80 backdrop-blur-md border border-white/20 shadow-[-10px_-10px_30px_rgba(236,72,153,0.3)]"
        />
      </motion.div>

      <motion.div style={{ y: y3 }} className="absolute bottom-32 left-[20%] drop-shadow-2xl">
        <motion.div
          animate={{ rotate: 360, x: [0, 20, 0] }}
          transition={{
            rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
            x: { duration: 6, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-400 to-cyan-300 opacity-90 backdrop-blur-md border border-white/20"
          style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} // Hexagon
        />
      </motion.div>
    </div>
  );
};

export default function MinimalHero() {
  const headlineWords = 'The Operating System for your '.split(' ');

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
  };

  const item = {
    hidden: { y: '150%' },
    show: {
      y: '0%',
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <section className="relative w-full min-h-[95vh] flex flex-col items-center justify-center bg-white pt-32 pb-12 overflow-hidden">
      <GlowingOrbs />
      <FloatingShapes />

      {/* Grid Pattern overlay for texture */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={
          {
            backgroundImage: `linear-gradient(to right, #0A0A0A 1px, transparent 1px), linear-gradient(to bottom, #0A0A0A 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          } as React.CSSProperties
        }
      />

      <div className="max-w-5xl mx-auto px-6 text-center z-20 relative mt-10">
        {/* Animated Headline */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-wrap justify-center overflow-hidden mb-4"
        >
          {headlineWords.map((word, i) => (
            <div key={i} className="overflow-hidden inline-block mr-4 mb-2 lg:mr-6 lg:mb-4">
              <motion.span
                variants={item}
                className="inline-block text-[4.5rem] leading-[1.1] md:text-8xl tracking-tighter font-extrabold text-[#0A0A0A]"
              >
                {word}
              </motion.span>
            </div>
          ))}

          {/* Glowing Gradient Text Reveal */}
          <div className="overflow-hidden inline-block">
            <motion.span
              variants={item}
              className="inline-block text-[4.5rem] leading-[1.1] md:text-8xl tracking-tighter font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 drop-shadow-[0_0_40px_rgba(168,85,247,0.4)]"
            >
              academic life.
            </motion.span>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2, ease: 'easeOut' }}
          className="text-lg md:text-2xl text-gray-500 max-w-2xl mx-auto mt-8 font-medium"
        >
          Organize tasks, build your CV, and crush exams in one unified workspace.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1.5, type: 'spring' }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton>
            <button className="px-8 py-4 rounded-full bg-[#4F46E5] text-white font-semibold text-sm shadow-[0_8px_30px_rgb(79,70,229,0.3)] hover:bg-[#4338ca] hover:shadow-[0_8px_30px_rgb(79,70,229,0.4)] transition-all flex items-center gap-2">
              Start for free
            </button>
          </MagneticButton>

          <MagneticButton>
            <button className="px-8 py-4 rounded-full bg-white border border-[#E5E7EB] text-[#0A0A0A] font-semibold text-sm shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch video
            </button>
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  );
}
