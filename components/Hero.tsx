import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import OrbitalRing from './OrbitalRing';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full flex flex-col items-center pt-[120px] pb-24 overflow-visible z-20">
      {/* Orbital ring visual */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center justify-center"
      >
        <OrbitalRing />
      </motion.div>

      {/* Typography + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex flex-col items-center text-center max-w-3xl mx-auto px-4 mt-10"
      >
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-[#111827] leading-[1.05]">
          All-in-one Student platform
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto mt-6">
          StudentOS is a modern, all-in-one student platform designed to perfectly fit your academic
          needs.
        </p>
        <button
          type="button"
          onClick={() => navigate('/signup/step-1')}
          className="mt-8 px-8 py-4 rounded-full bg-[#FF6B6B] hover:bg-[#FF5252] text-white font-medium shadow-lg shadow-red-500/20 transition-all block w-fit active:scale-95"
        >
          Get Started
        </button>
      </motion.div>
    </section>
  );
}
