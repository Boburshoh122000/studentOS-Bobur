'use client';

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

const ORBS = [
  { id: 1, size: 'w-96 h-96', color: 'bg-[#00F0FF]/30', initial: { x: -200, y: -200 } },
  { id: 2, size: 'w-[30rem] h-[30rem]', color: 'bg-[#8A2BE2]/30', initial: { x: 200, y: 100 } },
  { id: 3, size: 'w-80 h-80', color: 'bg-[#00F0FF]/20', initial: { x: -100, y: 300 } },
];

const SCRAMBLE_CHARS = '!<>-_\\\\/[]{}—=+*^?#________';

// Sophisticated Letter Reveal Component
const ScrambleText = ({ text }: { text: string }) => {
  return (
    <div className="flex flex-wrap justify-center overflow-hidden">
      {text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-[2vw] lg:mr-8 overflow-hidden">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={`${wordIndex}-${charIndex}`}
              initial={{ y: 200, opacity: 0, rotateZ: 10 }}
              animate={{ y: 0, opacity: 1, rotateZ: 0 }}
              transition={{
                duration: 1,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.2 + wordIndex * 0.1 + charIndex * 0.03,
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </div>
  );
};

export default function SpatialHero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]">
      {/* Background Liquid Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {ORBS.map((orb, i) => (
          <motion.div
            key={orb.id}
            className={`absolute ${orb.size} ${orb.color} rounded-full blur-[100px] mix-blend-screen`}
            initial={{ opacity: 0, ...orb.initial }}
            animate={{
              opacity: 1,
              x: mousePosition.x * (0.02 + i * 0.01) + orb.initial.x,
              y: mousePosition.y * (0.02 + i * 0.01) + orb.initial.y,
            }}
            transition={{
              x: { type: 'spring', stiffness: 20, damping: 30 },
              y: { type: 'spring', stiffness: 20, damping: 30 },
              opacity: { duration: 2 },
            }}
          />
        ))}

        {/* Dynamic Vignette Darker overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050505_100%)] opacity-80" />
      </div>

      {/* Grid Pattern overlay */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `linear-gradient(to right, #00F0FF 1px, transparent 1px), linear-gradient(to bottom, #00F0FF 1px, transparent 1px)`,
          backgroundSize: '4rem 4rem',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)',
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center -mt-20">
        {/* Top Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.05)]"
        >
          <Sparkles className="w-4 h-4 text-[#00F0FF]" />
          <span className="text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-[#00F0FF] to-[#8A2BE2] bg-clip-text text-transparent">
            StudentOS V2 OS Platform
          </span>
        </motion.div>

        {/* Massive Typography Headline */}
        <h1
          className="text-[12vw] sm:text-[10vw] md:text-[8vw] lg:text-[7.5vw] leading-[0.9] font-bold text-white tracking-tighter mix-blend-plus-lighter"
          style={{ fontFamily: 'Space Grotesk, sans-serif' }}
        >
          <ScrambleText text="THE SPATIAL" />
          <ScrambleText text="LEARNING WEB" />
        </h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="mt-8 text-lg sm:text-xl md:text-2xl text-neutral-400 max-w-2xl font-light leading-relaxed"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          An immersive, unified operating system designed to elevate your educational workflow into
          the future. Do not just study, <span className="text-white">experience.</span>
        </motion.p>

        {/* Glowing Neon CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-12"
        >
          <motion.button
            whileHover="hover"
            whileTap={{ scale: 0.95 }}
            className="group relative overflow-hidden px-10 py-5 rounded-full bg-white text-[#050505] font-bold text-lg flex items-center gap-3 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Sweeping Light Effect */}
            <motion.div
              variants={{
                hover: { x: ['-100%', '200%'] },
              }}
              transition={{ duration: 1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.5 }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg] mix-blend-overlay z-10"
            />

            <span className="relative z-20">Enter Matrix</span>
            <ArrowRight className="w-6 h-6 relative z-20 group-hover:translate-x-1 transition-transform" />

            {/* Glowing Border effect using absolute positioning behind the bg */}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
