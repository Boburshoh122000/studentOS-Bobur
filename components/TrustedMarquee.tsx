'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LOGOS = [
  'Harvard',
  'Stanford',
  'MIT',
  'Oxford',
  'Cambridge',
  'Yale',
  'Princeton',
  'Columbia',
];

export default function TrustedMarquee() {
  return (
    <section className="w-full bg-white py-12 overflow-hidden border-y border-gray-100 flex flex-col items-center">
      <p className="text-sm font-semibold text-gray-400 mb-8 tracking-widest uppercase">
        Trusted by students at
      </p>

      <div className="relative w-full max-w-7xl mx-auto flex overflow-hidden mask-image-gradient">
        {/* The Fade Masks for smooth entry/exit */}
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10" />

        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ['0%', '-50%'] }}
          transition={{
            repeat: Infinity,
            ease: 'linear',
            duration: 30, // Adjust speed here
          }}
        >
          {/* Double the array to ensure seamless looping */}
          {[...LOGOS, ...LOGOS, ...LOGOS].map((logo, i) => (
            <div key={i} className="mx-12 lg:mx-20 flex items-center justify-center shrink-0">
              <h3 className="text-2xl md:text-3xl font-black tracking-tighter text-gray-300 hover:text-[#4F46E5] transition-colors duration-500 cursor-default select-none">
                {logo}
              </h3>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
