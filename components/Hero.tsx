import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, Lightbulb, Shield, Airplay, Eye } from 'lucide-react';

/* 
  DATA ARRAY ARCHITECTURE (Strict Layout & Timeline)
  
  Timing sequence (T=0 to T=2s):
  0.0 - 0.8s : SVG Lines draw out.
  0.8s       : Center Node pops in + Micro Dots pop in.
  1.0s       : Satellite Nodes pop in.
  1.2 - 1.8s : Typography slides up.
*/
const nodesConfig = [
  // LEFT SIDE (3 Nodes)
  {
    id: 'top-left',
    x: -250,
    y: -150,
    content: (
      <div className="w-full h-full bg-[#FFE55C] flex items-center justify-center rounded-[1.2rem] shadow-sm">
        <Lightbulb className="w-7 h-7 text-[#D97706]" />
      </div>
    ),
    floatDuration: 4.2,
  },
  {
    id: 'far-left',
    x: -360,
    y: 20,
    content: (
      <div className="w-full h-full bg-gray-100 rounded-[1.2rem] border-4 border-white shadow-md overflow-hidden">
        <img
          src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
          alt="Student"
          className="w-full h-full object-cover"
        />
      </div>
    ),
    floatDuration: 5.1,
  },
  {
    id: 'bottom-left',
    x: -220,
    y: 180,
    content: (
      <div className="w-full h-full bg-[#42A5F5] flex items-center justify-center rounded-[1.2rem] shadow-sm">
        <Airplay className="w-6 h-6 text-white" />
      </div>
    ),
    floatDuration: 4.8,
  },

  // RIGHT SIDE (3 Nodes)
  {
    id: 'top-right',
    x: 250,
    y: -180,
    content: (
      <div className="w-full h-full bg-[#EF5350] flex items-center justify-center rounded-[1.2rem] shadow-sm">
        <Shield className="w-7 h-7 text-white" />
      </div>
    ),
    floatDuration: 3.9,
  },
  {
    id: 'far-right',
    x: 360,
    y: -10,
    content: (
      <div className="w-full h-full bg-white border border-gray-100 shadow-sm flex items-center justify-center rounded-[1.2rem]">
        <Eye className="w-7 h-7 text-gray-800" />
      </div>
    ),
    floatDuration: 5.5,
  },
  {
    id: 'bottom-right',
    x: 240,
    y: 160,
    content: (
      <div className="w-full h-full bg-gray-100 rounded-[1.2rem] border-4 border-white shadow-md overflow-hidden">
        <img
          src="https://i.pravatar.cc/150?u=a042581f4e29026024d"
          alt="Student"
          className="w-full h-full object-cover"
        />
      </div>
    ),
    floatDuration: 4.5,
  },
];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full flex flex-col items-center pt-[140px] pb-24 overflow-visible z-20">
      {/* 
        1. THE VISUAL CENTERPIECE 
      */}
      <div className="relative w-full max-w-[1024px] h-[450px] flex items-center justify-center pointer-events-none">
        {/* SVG CONNECTING LINES & MICRO-DOTS (Z-0) */}
        <svg
          className="absolute inset-0 w-full h-full z-0 overflow-visible"
          viewBox="0 0 1024 450"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {nodesConfig.map((node) => {
            const cx = 512;
            const cy = 225;
            const targetX = cx + node.x;
            const targetY = cy + node.y;

            // Calculate where the dot should go (44px off center along the vector)
            const length = Math.sqrt(node.x * node.x + node.y * node.y);
            // 1 - 44/length pushes it right outside a typical ~64px radius box
            const factor = 1 - 44 / length;
            const dotX = cx + node.x * factor;
            const dotY = cy + node.y * factor;

            return (
              <React.Fragment key={`group-${node.id}`}>
                {/* 1. The SVG Connecting Line */}
                <motion.line
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  x1={cx}
                  y1={cy}
                  x2={targetX}
                  y2={targetY}
                  stroke="#E5E7EB"
                  strokeWidth="1.5"
                />
                {/* 2. The Purple Micro-Dot near the outer node */}
                <motion.circle
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.8, type: 'spring' }} // Pops exactly as line finishes drawing
                  cx={dotX}
                  cy={dotY}
                  r="3"
                  fill="#8B5CF6"
                />
              </React.Fragment>
            );
          })}
        </svg>

        {/* CENTER NODE (Z-10) */}
        {/* Pops in exactly at T=0.8s (after lines draw) */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 20 }}
          className="absolute z-10"
          style={{ left: '50%', top: '50%' }}
        >
          {/* Continuous Float Wrapper */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: 'mirror',
              ease: 'easeInOut',
              delay: 0.8,
            }}
            className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-[0_0_40px_rgba(139,92,246,0.4)] flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
          >
            <Check className="w-10 h-10 text-white stroke-[3px]" />
          </motion.div>
        </motion.div>

        {/* SATELLITE NODES (Z-10) */}
        {/* Pop in together exactly at T=1.0s */}
        {nodesConfig.map((node, index) => (
          <motion.div
            key={`node-${node.id}`}
            className="absolute z-10"
            style={{
              left: '50%',
              top: '50%',
              marginLeft: node.x,
              marginTop: node.y,
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              delay: 1.0,
              type: 'spring',
              stiffness: 260,
              damping: 20,
            }}
          >
            {/* Infinite Bobbing Wrapper */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{
                duration: node.floatDuration,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut',
                delay: 1.0 + index * 0.1,
              }}
              className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
            >
              {node.content}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* 
        2. HERO TYPOGRAPHY & CTA (Z-20) 
        Slides up from T=1.2s to T=1.8s
      */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 relative z-20 mt-8"
      >
        <h1 className="text-6xl md:text-7xl font-extrabold tracking-tighter text-[#111827] text-center leading-[1.05]">
          All-in-one Student platform
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto text-center mt-6">
          StudentOS is a modern, all-in-one student platform designed to perfectly fit your academic
          needs.
        </p>
        <button
          onClick={() => navigate('/signup/step-1')}
          className="mt-8 px-8 py-4 rounded-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-medium shadow-lg shadow-red-500/20 transition-all mx-auto block w-fit active:scale-95"
        >
          Get Started
        </button>
      </motion.div>
    </section>
  );
}
