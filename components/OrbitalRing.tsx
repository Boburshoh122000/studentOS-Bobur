import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';

const SEEDS = ['orb_1', 'orb_2', 'orb_3', 'orb_4', 'orb_5', 'orb_6', 'orb_7', 'orb_8'];

const RING_TRANSITION = { repeat: Infinity, ease: 'linear' as const, duration: 30 };

export default function OrbitalRing() {
  return (
    <div className="orbital-ring">
      {/* Decorative orbit track */}
      <div className="orbit-track" />

      {/* Center disk — static, not inside the rotating container */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
        <div className="w-[72px] h-[72px] rounded-full bg-white shadow-xl flex items-center justify-center">
          <CheckIcon className="w-8 h-8 text-[#7C3AED]" />
        </div>
      </div>

      {/* Rotating ring */}
      <motion.div
        className="absolute inset-0"
        animate={{ rotate: [0, 360] }}
        transition={RING_TRANSITION}
      >
        {SEEDS.map((seed, i) => (
          <div key={seed} className={`orbit-slot orbit-slot-${i}`}>
            {/* Counter-rotate so each avatar stays upright while orbiting */}
            <motion.div
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden shadow-lg border-2 border-white"
              animate={{ rotate: [0, -360] }}
              transition={RING_TRANSITION}
            >
              <img
                src={`https://i.pravatar.cc/150?u=${seed}`}
                alt=""
                className="w-full h-full object-cover block"
                loading="lazy"
              />
            </motion.div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
