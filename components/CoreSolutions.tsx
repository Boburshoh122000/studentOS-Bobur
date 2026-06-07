import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid';

const COL_A = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6'];
const COL_B = ['b1', 'b2', 'b3', 'b4', 'b5', 'b6'];
const COL_C = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'];
const COL_D = ['d1', 'd2', 'd3', 'd4', 'd5', 'd6'];

interface ColProps {
  seeds: string[];
  durationS: number;
  direction?: 'up' | 'down';
  wide?: boolean;
}

function PhotoCol({ seeds, durationS, direction = 'up', wide = false }: ColProps) {
  const doubled = [...seeds, ...seeds];
  return (
    <div className={`overflow-hidden h-full ${wide ? 'w-[155px]' : 'w-[130px]'} shrink-0`}>
      <div
        className={direction === 'up' ? 'marquee-up' : 'marquee-down'}
        style={{ '--marquee-duration': `${durationS}s` } as React.CSSProperties}
      >
        <div className="flex flex-col gap-3">
          {doubled.map((seed, i) => (
            <div
              key={i}
              className={`w-full shrink-0 rounded-2xl overflow-hidden shadow-md bg-gray-200 ${wide ? 'h-[200px]' : 'h-[165px]'}`}
            >
              <img
                src={`https://i.pravatar.cc/400?u=sos_${seed}`}
                alt=""
                className="w-full h-full object-cover block"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CoreSolutions() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-[#f4f4f7] overflow-hidden">
      <div className="relative h-[680px] flex items-center justify-center">
        {/* ── LEFT: outer col + inner col ── */}
        <div className="absolute left-0 top-0 bottom-0 hidden md:flex gap-3">
          <PhotoCol seeds={COL_A} durationS={16} direction="up" wide />
          <PhotoCol seeds={COL_B} durationS={22} direction="down" />
        </div>

        {/* ── CENTER ── */}
        <motion.div
          className="relative z-10 flex flex-col items-center text-center px-6 max-w-[360px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <div className="w-14 h-14 rounded-2xl bg-white shadow-md flex items-center justify-center mb-7">
            <UserIcon className="w-7 h-7 text-[#7C3AED]" />
          </div>

          <h2 className="text-[clamp(38px,4.5vw,56px)] font-extrabold tracking-tight text-[#111827] leading-[1.08]">
            Core Student
            <br />
            solutions
          </h2>

          <p className="text-[15px] text-gray-500 mt-5 leading-relaxed max-w-[270px]">
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

        {/* ── RIGHT: inner col + outer col ── */}
        <div className="absolute right-0 top-0 bottom-0 hidden md:flex gap-3">
          <PhotoCol seeds={COL_C} durationS={20} direction="up" />
          <PhotoCol seeds={COL_D} durationS={15} direction="down" wide />
        </div>
      </div>
    </section>
  );
}
