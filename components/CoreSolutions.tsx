import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid';

type CardSpec = { img: string; cls: string; delay: number };

// Positions are HARDCODED as literal Tailwind classes so CDN Tailwind generates them.
// Each card has a unique position — no stacking.
const LEFT_CARDS: CardSpec[] = [
  {
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute top-10 left-10 w-32 h-40',
    delay: 0,
  },
  {
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute top-1/3 right-0 w-36 h-36 z-20',
    delay: 1.4,
  },
  {
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute bottom-10 left-12 w-32 h-40',
    delay: 2.8,
  },
  {
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute -bottom-6 -left-8 w-24 h-32',
    delay: 4.2,
  },
  {
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute top-1/4 -left-6 w-20 h-28',
    delay: 5.6,
  },
];

const RIGHT_CARDS: CardSpec[] = [
  {
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute top-12 right-12 w-28 h-32',
    delay: 0.7,
  },
  {
    img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute top-1/3 left-4 w-40 h-40 z-20',
    delay: 2.1,
  },
  {
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute bottom-12 right-16 w-32 h-36',
    delay: 3.5,
  },
  {
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute -bottom-4 -right-10 w-24 h-32',
    delay: 4.9,
  },
  {
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    cls: 'absolute top-16 -right-8 w-20 h-40',
    delay: 6.3,
  },
];

// Each card floats on its own 3D depth cycle: scale + blur simulate the orbit depth.
// The baseline absolute position is preserved — only scale/blur/y are animated.
function PhotoCard({ card }: { card: CardSpec }) {
  return (
    <motion.div
      className={`${card.cls} border-[6px] border-white rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden`}
      animate={{
        y: [0, -10, 0, 10, 0],
        scale: [1, 0.88, 0.72, 0.88, 1],
        filter: ['blur(0px)', 'blur(2px)', 'blur(4px)', 'blur(2px)', 'blur(0px)'],
      }}
      transition={{
        duration: 7,
        delay: card.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img src={card.img} alt="" className="w-full h-full object-cover" loading="lazy" />
    </motion.div>
  );
}

export default function CoreSolutions() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-[#f4f4f7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-12 h-[680px]">
        {/* Left zone */}
        <div className="relative col-span-4 h-[680px] hidden md:block">
          {LEFT_CARDS.map((card) => (
            <PhotoCard key={card.img} card={card} />
          ))}
        </div>

        {/* Center */}
        <motion.div
          className="col-span-12 md:col-span-4 flex flex-col items-center justify-center text-center px-6 relative z-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-8">
            <UserIcon className="w-8 h-8 text-[#7C3AED]" />
          </div>

          <h2 className="text-[clamp(36px,4.5vw,56px)] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Core Student
            <br />
            solutions
          </h2>

          <p className="text-[15px] text-gray-500 mt-5 leading-relaxed max-w-[260px]">
            Streamline your studies in one centralized platform, enhancing your productivity.
          </p>

          <button
            type="button"
            onClick={() => navigate('/signup/step-1')}
            className="mt-8 px-9 py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-colors"
          >
            Learn more
          </button>
        </motion.div>

        {/* Right zone */}
        <div className="relative col-span-4 h-[680px] hidden md:block">
          {RIGHT_CARDS.map((card) => (
            <PhotoCard key={card.img} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
