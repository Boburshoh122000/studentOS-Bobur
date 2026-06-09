import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid';

type Card = { id: string; img: string; size: string; float: string };

const LEFT_CARDS: Card[] = [
  {
    id: 'l0',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    size: 'w-36 h-44',
    float: 'fc-1',
  },
  {
    id: 'l1',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    size: 'w-32 h-40',
    float: 'fc-2',
  },
  {
    id: 'l2',
    img: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    size: 'w-28 h-36',
    float: 'fc-3',
  },
  {
    id: 'l3',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
    size: 'w-24 h-28',
    float: 'fc-4',
  },
  {
    id: 'l4',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=80',
    size: 'w-28 h-32',
    float: 'fc-5',
  },
];

const RIGHT_CARDS: Card[] = [
  {
    id: 'r0',
    img: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    size: 'w-36 h-44',
    float: 'fc-3',
  },
  {
    id: 'r1',
    img: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    size: 'w-32 h-40',
    float: 'fc-1',
  },
  {
    id: 'r2',
    img: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
    size: 'w-28 h-36',
    float: 'fc-4',
  },
  {
    id: 'r3',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
    size: 'w-24 h-28',
    float: 'fc-2',
  },
  {
    id: 'r4',
    img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
    size: 'w-28 h-32',
    float: 'fc-5',
  },
];

function PhotoZone({ cards, side }: { cards: Card[]; side: 'left' | 'right' }) {
  return (
    <div className="relative w-full h-full">
      {cards.map((card) => (
        <div
          key={card.id}
          data-card={card.id}
          className={`absolute ${card.size} ${card.float} rounded-[2rem] border-[5px] border-white shadow-2xl overflow-hidden`}
        >
          <img src={card.img} alt="" className="w-full h-full object-cover block" loading="lazy" />
        </div>
      ))}
      {/* outer-edge gradient fade */}
      <div
        className={`absolute inset-0 pointer-events-none z-10 ${side === 'left' ? 'pz-fade-l' : 'pz-fade-r'}`}
      />
    </div>
  );
}

export default function CoreSolutions() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-[#f4f4f7] overflow-hidden">
      <div className="relative grid grid-cols-12 w-full max-w-7xl mx-auto h-[680px]">
        {/* Left photo zone */}
        <div className="col-span-4 h-full hidden md:block">
          <PhotoZone cards={LEFT_CARDS} side="left" />
        </div>

        {/* Center */}
        <motion.div
          className="col-span-12 md:col-span-4 flex flex-col items-center justify-center text-center px-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-7">
            <UserIcon className="w-7 h-7 text-[#7C3AED]" />
          </div>

          <h2 className="text-[clamp(34px,4vw,52px)] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Core Student
            <br />
            solutions
          </h2>

          <p className="text-[15px] text-gray-500 mt-5 leading-relaxed max-w-[240px]">
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

        {/* Right photo zone */}
        <div className="col-span-4 h-full hidden md:block">
          <PhotoZone cards={RIGHT_CARDS} side="right" />
        </div>
      </div>
    </section>
  );
}
