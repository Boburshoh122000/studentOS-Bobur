import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid';

/* Four columns of photos — left outer, left inner, right inner, right outer.
   Each column scrolls upward infinitely at slightly different speeds.
   We duplicate the list so the loop is seamless (move -50% = one full set). */

const colA = [
  'https://i.pravatar.cc/300?u=col_a1',
  'https://i.pravatar.cc/300?u=col_a2',
  'https://i.pravatar.cc/300?u=col_a3',
  'https://i.pravatar.cc/300?u=col_a4',
  'https://i.pravatar.cc/300?u=col_a5',
];
const colB = [
  'https://i.pravatar.cc/300?u=col_b1',
  'https://i.pravatar.cc/300?u=col_b2',
  'https://i.pravatar.cc/300?u=col_b3',
  'https://i.pravatar.cc/300?u=col_b4',
  'https://i.pravatar.cc/300?u=col_b5',
];
const colC = [
  'https://i.pravatar.cc/300?u=col_c1',
  'https://i.pravatar.cc/300?u=col_c2',
  'https://i.pravatar.cc/300?u=col_c3',
  'https://i.pravatar.cc/300?u=col_c4',
  'https://i.pravatar.cc/300?u=col_c5',
];
const colD = [
  'https://i.pravatar.cc/300?u=col_d1',
  'https://i.pravatar.cc/300?u=col_d2',
  'https://i.pravatar.cc/300?u=col_d3',
  'https://i.pravatar.cc/300?u=col_d4',
  'https://i.pravatar.cc/300?u=col_d5',
];

interface PhotoColumnProps {
  photos: string[];
  duration: number;
  /** true = scroll up, false = scroll down */
  reverse?: boolean;
  cardHeight?: string;
  gap?: string;
}

function PhotoColumn({
  photos,
  duration,
  reverse = false,
  cardHeight = 'h-44',
  gap = 'gap-4',
}: PhotoColumnProps) {
  const doubled = [...photos, ...photos];
  return (
    <div className="overflow-hidden h-full">
      <motion.div
        className={`flex flex-col ${gap}`}
        animate={{ y: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{
          duration,
          repeat: Infinity,
          ease: 'linear',
          repeatType: 'loop',
        }}
      >
        {doubled.map((src, i) => (
          <div
            key={i}
            className={`shrink-0 w-full ${cardHeight} rounded-2xl overflow-hidden shadow-md bg-gray-100`}
          >
            <img src={src} alt="" className="w-full h-full object-cover" loading="lazy" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export default function CoreSolutions() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full overflow-hidden bg-[#f4f4f7] py-16">
      <div className="relative flex items-center justify-center min-h-[640px]">
        {/* ── LEFT SIDE: 2 scrolling columns ── */}
        <div className="absolute left-0 top-0 bottom-0 hidden md:flex gap-3 w-[340px] -translate-x-4">
          {/* Outer left column — taller cards, slower */}
          <div className="w-[155px]">
            <PhotoColumn photos={colA} duration={18} cardHeight="h-52" gap="gap-3" />
          </div>
          {/* Inner left column — shorter cards, faster, reversed */}
          <div className="w-[155px]">
            <PhotoColumn photos={colB} duration={14} reverse cardHeight="h-40" gap="gap-3" />
          </div>
        </div>

        {/* ── CENTER CONTENT ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Top icon */}
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-8">
            <UserIcon className="w-7 h-7 text-[#7C3AED]" />
          </div>

          <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Core Student
            <br />
            solutions
          </h2>
          <p className="text-base text-gray-500 mt-5 leading-relaxed max-w-xs">
            Streamline your studies in one centralized platform, enhancing your productivity.
          </p>

          <button
            type="button"
            onClick={() => navigate('/signup/step-1')}
            className="mt-8 px-8 py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all active:scale-95"
          >
            Learn more
          </button>
        </motion.div>

        {/* ── RIGHT SIDE: 2 scrolling columns ── */}
        <div className="absolute right-0 top-0 bottom-0 hidden md:flex gap-3 w-[340px] translate-x-4">
          {/* Inner right column — shorter cards, reversed */}
          <div className="w-[155px]">
            <PhotoColumn photos={colC} duration={16} reverse cardHeight="h-40" gap="gap-3" />
          </div>
          {/* Outer right column — taller cards, slower */}
          <div className="w-[155px]">
            <PhotoColumn photos={colD} duration={20} cardHeight="h-52" gap="gap-3" />
          </div>
        </div>
      </div>
    </section>
  );
}
