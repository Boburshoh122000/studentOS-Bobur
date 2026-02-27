'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircleIcon, CpuChipIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 100, rotateX: -15, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 80, damping: 20, mass: 1 },
  },
};

export default function MinimalCoreTools() {
  return (
    <section id="tools" className="w-full bg-[#FAFAFA] py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-20 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0A0A0A] tracking-tight mb-4">
            Everything you need. <span className="text-gray-400">Zero clutter.</span>
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            StudentOS replaces half a dozen unorganized apps with one unified, hyper-fast ecosystem.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[280px]"
        >
          {/* Card 1: ATS Resume Checker (Wide) */}
          <motion.div
            variants={cardVariants}
            style={{ transformPerspective: 1000 }}
            whileHover={{ y: -8, scale: 1.01, boxShadow: '0 20px 40px -10px rgba(79,70,229,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="col-span-1 md:col-span-2 row-span-1 bg-white border border-[#E5E7EB] rounded-[32px] p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden shadow-sm transition-shadow"
          >
            <div className="flex-1 shrink-0 z-10 mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
                <DocumentTextIcon className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <h3 className="text-2xl font-bold text-[#0A0A0A] mb-2 tracking-tight">
                ATS Resume Checker
              </h3>
              <p className="text-gray-500 text-sm max-w-[250px] leading-relaxed">
                Scan your CV against industry standard ATS algorithms to ensure a perfect match.
              </p>
            </div>
            {/* Fake UI Snippet */}
            <div className="relative w-48 h-48 md:ml-auto shrink-0 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100 p-4">
              <svg
                className="absolute inset-0 w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" r="45" fill="none" stroke="#E5E7EB" strokeWidth="6" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#4F46E5"
                  strokeWidth="6"
                  strokeDasharray="283"
                  initial={{ strokeDashoffset: 283 }}
                  whileInView={{ strokeDashoffset: 283 * 0.05 }}
                  transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                />
              </svg>
              <div className="text-center z-10 bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-sm">
                <span className="text-4xl font-extrabold text-[#0A0A0A] tracking-tighter">95%</span>
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
                  Match
                </span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Daily Habit Tracker (Tall) */}
          <motion.div
            variants={cardVariants}
            style={{ transformPerspective: 1000 }}
            whileHover={{ y: -8, scale: 1.01, boxShadow: '0 20px 40px -10px rgba(79,70,229,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="col-span-1 md:col-span-1 row-span-2 bg-white border border-[#E5E7EB] rounded-[32px] p-10 flex flex-col overflow-hidden shadow-sm transition-shadow"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6">
              <CheckCircleIcon className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0A0A0A] mb-2 tracking-tight">
              Daily Habit Tracker
            </h3>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Build unbreakable routines with our physics-based frictionless tracker.
            </p>

            {/* Fake Checklist UI */}
            <div className="mt-auto space-y-3">
              {[
                { name: 'Leetcode Daily', done: true },
                { name: 'Read 20 pages', done: true },
                { name: 'Gym session', done: false },
              ].map((habit, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center ${habit.done ? 'bg-[#4F46E5]' : 'border-2 border-gray-300'}`}
                  >
                    {habit.done && <CheckCircleIcon className="w-3 h-3 text-white" />}
                  </div>
                  <span
                    className={`text-sm font-medium ${habit.done ? 'text-gray-400 line-through' : 'text-[#0A0A0A]'}`}
                  >
                    {habit.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Card 3: Plagiarism Checker (Square) */}
          <motion.div
            variants={cardVariants}
            style={{ transformPerspective: 1000 }}
            whileHover={{ y: -8, scale: 1.01, boxShadow: '0 20px 40px -10px rgba(79,70,229,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="col-span-1 md:col-span-1 row-span-1 bg-white border border-[#E5E7EB] rounded-[32px] p-10 flex flex-col shadow-sm transition-shadow relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 z-10">
              <ShieldCheckIcon className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 z-10 tracking-tight">
              AI & Plagiarism
            </h3>
            <p className="text-gray-500 text-sm z-10 leading-relaxed">
              Instantly verify academic integrity against billions of sources.
            </p>
            {/* Decorative BG element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-gray-50 rounded-full border border-gray-100" />
            <ShieldCheckIcon
              className="absolute -bottom-6 -right-6 w-32 h-32 text-gray-100 z-0"
            />
          </motion.div>

          {/* Card 4: Smart Learning Plans (Square) */}
          <motion.div
            variants={cardVariants}
            style={{ transformPerspective: 1000 }}
            whileHover={{ y: -8, scale: 1.01, boxShadow: '0 20px 40px -10px rgba(79,70,229,0.15)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="col-span-1 md:col-span-1 row-span-1 bg-white border border-[#E5E7EB] rounded-[32px] p-10 flex flex-col shadow-sm transition-shadow relative overflow-hidden"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center mb-6 z-10">
              <CpuChipIcon className="w-6 h-6 text-[#4F46E5]" />
            </div>
            <h3 className="text-xl font-bold text-[#0A0A0A] mb-2 z-10 tracking-tight">
              Smart Learning Plans
            </h3>
            <p className="text-gray-500 text-sm z-10 leading-relaxed">
              Generate optimal study roadmaps customized to your syllabus.
            </p>
            {/* Decorative BG element */}
            <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-50 rounded-full border border-indigo-100/50" />
            <CpuChipIcon
              className="absolute -bottom-4 -right-4 w-32 h-32 text-indigo-100/50 z-0"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
