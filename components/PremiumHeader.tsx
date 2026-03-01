import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function PremiumHeader() {
  const navigate = useNavigate();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0, x: '-50%' }}
      animate={{ y: 0, opacity: 1, x: '-50%' }}
      transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl h-[64px] bg-white/80 backdrop-blur-md rounded-full border border-gray-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)] flex items-center justify-between px-6"
    >
      {/* 1. Left: Brand Logo */}
      <div className="flex items-center shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-[#111827] font-[800] text-[18px] tracking-tight hover:opacity-80 transition-opacity"
        >
          StudentOS
        </button>
      </div>

      {/* 2. Center: Navigation Links */}
      <nav className="hidden md:flex items-center gap-8">
        {['Home', 'Tools', 'Career Tracker', 'Pricing'].map((item) => {
          // Map to hash routes or standard routes as needed by Vite setup
          const target = item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`;
          return (
            <button
              key={item}
              onClick={() => navigate(target)}
              className="text-[14px] font-[500] text-[#4B5563] hover:text-black transition-colors"
            >
              {item}
            </button>
          );
        })}
      </nav>

      {/* 3. Right: CTA Actions */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => navigate('/signin')}
          className="hidden sm:inline-flex text-[14px] font-[500] text-[#4B5563] hover:text-black transition-colors px-2 py-2"
        >
          Sign In
        </button>
        <button
          onClick={() => navigate('/signup/step-1')}
          className="inline-flex items-center justify-center bg-[#4F46E5] text-white text-[14px] font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95"
        >
          Get Started
        </button>
      </div>
    </motion.header>
  );
}
