import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from '@heroicons/react/24/solid';

/* Student photos scattered on both sides — matches video frame_01/02 style */
const leftPhotos = [
  {
    id: 'l1',
    src: 'https://i.pravatar.cc/300?u=student1',
    className: 'w-44 h-52 top-[8%] left-[2%] rotate-[-3deg]',
    delay: 0.1,
  },
  {
    id: 'l2',
    src: 'https://i.pravatar.cc/300?u=student2',
    className: 'w-36 h-44 top-[38%] left-[6%] rotate-[2deg]',
    delay: 0.2,
  },
  {
    id: 'l3',
    src: 'https://i.pravatar.cc/300?u=student3',
    className: 'w-28 h-32 top-[72%] left-[1%] rotate-[-1deg]',
    delay: 0.3,
  },
  {
    id: 'l4',
    src: 'https://i.pravatar.cc/300?u=student9',
    className: 'w-36 h-40 top-[22%] left-[18%] rotate-[1deg]',
    delay: 0.15,
  },
];

const rightPhotos = [
  {
    id: 'r1',
    src: 'https://i.pravatar.cc/300?u=student4',
    className: 'w-36 h-44 top-[6%] right-[3%] rotate-[2deg]',
    delay: 0.1,
  },
  {
    id: 'r2',
    src: 'https://i.pravatar.cc/300?u=student5',
    className: 'w-28 h-36 top-[36%] right-[0%] rotate-[-2deg]',
    delay: 0.25,
  },
  {
    id: 'r3',
    src: 'https://i.pravatar.cc/300?u=student6',
    className: 'w-40 h-48 top-[60%] right-[4%] rotate-[1deg]',
    delay: 0.2,
  },
  {
    id: 'r4',
    src: 'https://i.pravatar.cc/300?u=student7',
    className: 'w-24 h-28 top-[20%] right-[18%] rotate-[-3deg]',
    delay: 0.35,
  },
];

export default function CoreSolutions() {
  const navigate = useNavigate();

  return (
    <section className="relative w-full min-h-[620px] flex items-center justify-center overflow-hidden bg-[#f4f4f7] py-24">
      {/* Left scattered photos */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {leftPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            className={`absolute ${photo.className} rounded-2xl overflow-hidden shadow-lg`}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: photo.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={photo.src} alt="Student" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      {/* Right scattered photos */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        {rightPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            className={`absolute ${photo.className} rounded-2xl overflow-hidden shadow-lg`}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7, delay: photo.delay, ease: [0.22, 1, 0.36, 1] }}
          >
            <img src={photo.src} alt="Student" className="w-full h-full object-cover" />
          </motion.div>
        ))}
      </div>

      {/* Center content */}
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
          onClick={() => navigate('/signup/step-1')}
          className="mt-8 px-8 py-3.5 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-sm shadow-lg shadow-violet-500/25 transition-all active:scale-95"
        >
          Learn more
        </button>
      </motion.div>
    </section>
  );
}
