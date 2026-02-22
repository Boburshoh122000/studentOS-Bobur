import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Zap, FolderDot } from 'lucide-react';

export default function Features() {
  return (
    <section className="w-full flex justify-center py-20 px-4 bg-[#FAFAFA]">
      <div className="w-full max-w-6xl flex flex-col gap-24">
        {/* =========================================
            SECTION A: "Built for everyone" Bento Grid
            ========================================= */}
        <div className="flex flex-col items-center text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#111827]">
            Built for everyone.
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mt-4">
            Whether you're a freshman organizing your first semester or a grad student managing a
            thesis team, our platform adapts to your academic workflow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
            {/* Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                <Layers className="text-indigo-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Undergrads</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">
                Track assignments, organize lecture notes, and keep your GPA goals on a singular
                fast dashboard.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-6">
                <Zap className="text-rose-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Researchers</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">
                Advanced analytics, reference management, and deep integration with citation
                trackers.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
              className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                <FolderDot className="text-emerald-600 w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">For Group Projects</h3>
              <p className="text-gray-500 mt-2 leading-relaxed">
                Secure workspaces with role-based access, shared drives, and real-time collaboration
                trails.
              </p>
            </motion.div>
          </div>
        </div>

        {/* =========================================
            SECTION B: Dark Feature Mock OS UI 
            ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="w-full bg-[#111827] rounded-[2.5rem] p-10 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative"
        >
          {/* Subtle glow effect behind */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

          {/* Left Text Column */}
          <div className="flex-1 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <FolderDot className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold text-indigo-400 tracking-wider uppercase">
                Big Data Ready
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-[1.1]">
              Centralize all your data.
            </h2>
            <p className="text-lg text-gray-400 mt-6 leading-relaxed max-w-md">
              Stop jumping between tabs. Connect all your academic sources into one unified
              dashboard that gives you the full picture instantly.
            </p>
          </div>

          {/* Right Mock OS UI Column */}
          <div className="flex-1 w-full max-w-lg z-10">
            <div className="w-full bg-[#1F2937] rounded-2xl border border-gray-700 shadow-2xl overflow-hidden">
              {/* Fake OS Header */}
              <div className="w-full h-12 bg-[#374151]/50 border-b border-gray-700/50 flex items-center px-4">
                <span className="text-sm font-semibold text-gray-300">Live Feed</span>
                <span className="ml-auto text-xs text-gray-500">Updated just now</span>
              </div>

              {/* Fake List content */}
              <div className="p-6 flex flex-col gap-5">
                {[
                  { time: '14:30', action: 'Canvas sync completed', date: '2024-02-22' },
                  {
                    time: '14:31',
                    action: 'New deadline detected: Physics Lab',
                    date: '2024-02-22',
                  },
                  {
                    time: '14:32',
                    action: 'Resume ATS checker generated report',
                    date: '2024-02-22',
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 text-sm">
                    {/* Pulsing purple dot */}
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                    </span>
                    <span className="text-gray-400 font-mono text-xs">
                      {item.date} {item.time}
                    </span>
                    <span className="text-gray-300 flex-1 truncate">{item.action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
