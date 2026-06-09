import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid';

type OrbPos = {
  x: number;
  y: number;
  scale: number;
  blur: number;
  opacity: number;
  zIndex: number;
};

// 5 orbital positions per side. (0,0) = centre of the zone.
// Cards cycle through all 5; pos 4 is always hidden (back of orbit).
// Zigzag: top-corner → inner-centre → bottom-corner → outer-edge → hidden
const LEFT_POSITIONS: OrbPos[] = [
  { x: -130, y: -230, scale: 1.0, blur: 0, opacity: 1, zIndex: 4 }, // top-left big
  { x: 30, y: -50, scale: 1.12, blur: 0, opacity: 1, zIndex: 5 }, // inner-centre (biggest)
  { x: -130, y: 140, scale: 0.95, blur: 0, opacity: 1, zIndex: 4 }, // bottom-left
  { x: -205, y: 60, scale: 0.7, blur: 5, opacity: 0.55, zIndex: 2 }, // outer edge, partial
  { x: -220, y: -95, scale: 0.45, blur: 10, opacity: 0, zIndex: 1 }, // hidden
];

const RIGHT_POSITIONS: OrbPos[] = [
  { x: 130, y: -230, scale: 1.0, blur: 0, opacity: 1, zIndex: 4 },
  { x: -30, y: -50, scale: 1.12, blur: 0, opacity: 1, zIndex: 5 },
  { x: 130, y: 140, scale: 0.95, blur: 0, opacity: 1, zIndex: 4 },
  { x: 205, y: 60, scale: 0.7, blur: 5, opacity: 0.55, zIndex: 2 },
  { x: 220, y: -95, scale: 0.45, blur: 10, opacity: 0, zIndex: 1 },
];

const LEFT_IMGS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
];

const RIGHT_IMGS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
];

function OrbitZone({ imgs, positions }: { imgs: string[]; positions: OrbPos[] }) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setOffset((o) => (o + 1) % 5);
    }, 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {imgs.map((img, i) => {
        const pos = positions[(i + offset) % 5];
        return (
          <motion.div
            key={img}
            className="absolute w-36 h-44"
            animate={{
              x: pos.x,
              y: pos.y,
              scale: pos.scale,
              opacity: pos.opacity,
              filter: `blur(${pos.blur}px)`,
            }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            style={{ zIndex: pos.zIndex }}
          >
            {/* Inner div handles gentle float on top of the orbit position */}
            <motion.div
              className="relative w-full h-full border-[6px] border-white rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.15)] overflow-hidden"
              animate={{ y: [0, -7, 0] }}
              transition={{
                duration: 3.8 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.65,
              }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" />
              <div className="card-vignette absolute inset-0 pointer-events-none" />
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function CoreSolutions() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-[#f4f4f7] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-12 h-[680px]">
        {/* Left orbit zone */}
        <div className="col-span-4 h-[680px] hidden md:block">
          <OrbitZone imgs={LEFT_IMGS} positions={LEFT_POSITIONS} />
        </div>

        {/* Centre copy */}
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

        {/* Right orbit zone */}
        <div className="col-span-4 h-[680px] hidden md:block">
          <OrbitZone imgs={RIGHT_IMGS} positions={RIGHT_POSITIONS} />
        </div>
      </div>
    </section>
  );
}
