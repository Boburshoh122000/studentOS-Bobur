import React, { useRef } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Activity, Briefcase, Target, Award, Cpu, Layers } from 'lucide-react';

/* 
  DATA ARRAY ARCHITECTURE (Dual-Wrapper Parallax)
  
  Each tool receives a precise percentage-based absolute position to keep it orbiting the center.
  Parallax bounds map `scrollYProgress` [0, 1] mapped against an array (e.g., `[0, -400]`).
*/
const toolsConfig = [
  // LEFT SIDE ALIGNMENT
  {
    id: 'ats',
    title: 'ATS Checker',
    icon: <FileText className="w-5 h-5 text-indigo-600" />,
    top: '15%',
    left: '8%',
    parallaxSpeed: [0, -350],
    delay: 0,
  },
  {
    id: 'habit',
    title: 'Habit Tracker',
    icon: <Activity className="w-5 h-5 text-indigo-600" />,
    top: '45%',
    left: '12%',
    parallaxSpeed: [0, -200],
    delay: 0.5,
  },
  {
    id: 'cv',
    title: 'Smart CV',
    icon: <Briefcase className="w-5 h-5 text-indigo-600" />,
    top: '75%',
    left: '6%',
    parallaxSpeed: [0, -450],
    delay: 1.2,
  },

  // RIGHT SIDE ALIGNMENT
  {
    id: 'job',
    title: 'Job Board',
    icon: <Target className="w-5 h-5 text-indigo-600" />,
    top: '20%',
    left: '72%',
    parallaxSpeed: [0, -400],
    delay: 0.2,
  },
  {
    id: 'scholarship',
    title: 'Scholarships',
    icon: <Award className="w-5 h-5 text-indigo-600" />,
    top: '55%',
    left: '76%',
    parallaxSpeed: [0, -600],
    delay: 0.8,
  },
  {
    id: 'ai',
    title: 'Mock Interviews',
    icon: <Cpu className="w-5 h-5 text-indigo-600" />,
    top: '80%',
    left: '70%',
    parallaxSpeed: [0, -250],
    delay: 1.5,
  },
];

export interface ToolConfig {
  id: string;
  title: string;
  icon: React.ReactNode;
  top: string;
  left: string;
  parallaxSpeed: number[];
  delay: number;
}

// Extracted ToolCard component for cleaner rendering
function ToolCard({
  tool,
  scrollYProgress,
}: {
  tool: ToolConfig;
  scrollYProgress: MotionValue<number>;
}) {
  // CRITICAL: The outer wrapper handles the sticky viewport scroll parallax via useTransform.
  const yTransform = useTransform(scrollYProgress, [0, 1], tool.parallaxSpeed);

  return (
    <motion.div
      style={{
        top: tool.top,
        left: tool.left,
        y: yTransform as any,
      }}
      className="absolute z-20 hidden md:block" // Hide on small mobile to prevent text overlap
    >
      {/* 
        CRITICAL: The inner wrapper handles the continuous independent localized yoyo floating.
        Separating these prevents Framer's physics engines from conflicting. 
      */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: tool.delay,
        }}
        className="bg-white/90 backdrop-blur-md border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl p-4 flex items-center gap-4 w-56 hover:shadow-[0_12px_40px_rgb(99,102,241,0.15)] hover:scale-105 transition-all cursor-default"
      >
        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
          {tool.icon}
        </div>
        <span className="font-semibold text-gray-800 tracking-tight text-[15px]">{tool.title}</span>
      </motion.div>
    </motion.div>
  );
}

export default function CoreSolutions() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Hook scroll progress to the exact bounds of this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[130vh] flex items-center justify-center overflow-hidden bg-[#FAFAFA] py-32 mt-12"
    >
      {/* 
        1. CENTER CONTENT (Static & Centered) 
      */}
      <div className="relative z-30 flex flex-col items-center text-center px-4">
        {/* Top Floating Badge */}
        <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 shadow-sm shadow-indigo-200/50">
          <Layers className="w-6 h-6" />
        </div>

        {/* Core Typography */}
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
          Core Student <br className="hidden sm:block" /> solutions
        </h2>
        <p className="text-lg text-gray-500 max-w-md mt-6 leading-relaxed">
          Streamline your studies, habits, and career path in one centralized platform, enhancing
          your productivity.
        </p>

        {/* Trigger Button */}
        <button
          onClick={() => navigate('/tools')}
          className="mt-8 px-8 py-4 rounded-full bg-indigo-600 text-white font-semibold shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all text-lg"
        >
          Explore tools
        </button>
      </div>

      {/* 
        2. THE PARALLAX FLOATING CARDS (Orbiting Perimeter)
      */}
      <div className="absolute inset-0 w-full max-w-[1400px] mx-auto pointer-events-none">
        {toolsConfig.map((tool) => (
          <div key={tool.id} className="pointer-events-auto">
            <ToolCard tool={tool} scrollYProgress={scrollYProgress} />
          </div>
        ))}
      </div>
    </section>
  );
}
