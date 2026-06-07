import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';

/* Tool data — real SVG logos as img or inline */
const TOOLS = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and manage your academic emails',
    logo: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <path fill="#EA4335" d="M6 6h36v36H6z" opacity="0" />
        <path
          fill="#4CAF50"
          d="M45 16.5v25A2.5 2.5 0 0142.5 44h-5V21l-13.5 9L10 21v23H5A2.5 2.5 0 012.5 41.5v-25A2.5 2.5 0 015 14h.5L24 27 42.5 14H43A2.5 2.5 0 0145 16.5z"
          opacity="0"
        />
        <g>
          <path fill="#EA4335" d="M6 44V18.5L24 31l18-12.5V44" />
          <path fill="#B0BEC5" d="M42 4H6L24 17z" />
          <path fill="#EA4335" d="M42 4L24 17 6 4" opacity=".2" />
          <path fill="#FAFAFA" d="M6 4h36L24 17z" opacity=".1" />
          <path fill="#EA4335" d="M6 4v14.5L24 31l18-12.5V4" opacity=".1" />
          {/* Simple Gmail M icon */}
          <rect x="4" y="4" width="40" height="40" rx="2" fill="#ffffff" />
          <path d="M8 36V16.5L24 28l16-11.5V36H8z" fill="#EA4335" />
          <path d="M8 16L24 28 40 16H8z" fill="#C62828" />
        </g>
      </svg>
    ),
    bg: 'bg-white',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Organize your notes and study plans',
    logo: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="4" y="4" width="40" height="40" rx="6" fill="#ffffff" />
        <text
          x="24"
          y="32"
          textAnchor="middle"
          fontSize="22"
          fontWeight="bold"
          fill="#191919"
          fontFamily="serif"
        >
          N
        </text>
      </svg>
    ),
    bg: 'bg-white',
  },
  {
    id: 'meet',
    name: 'Google Meet',
    description: 'Seamless video meetings for study groups',
    logo: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="4" y="4" width="40" height="40" rx="6" fill="#ffffff" />
        <path d="M14 16h20v16H14z" fill="#00897B" rx="2" />
        <path d="M34 20l8-6v20l-8-6V20z" fill="#00ACC1" />
        <path d="M14 16h20v16H14z" fill="#00897B" />
        <path d="M14 32l5-8h10l5 8H14z" fill="#00838F" />
        <rect x="4" y="4" width="40" height="40" rx="6" fill="none" />
        <g>
          <rect x="4" y="4" width="40" height="40" rx="8" fill="#ffffff" />
          <path d="M12 18v12h16V18H12z" fill="#00BCD4" rx="2" />
          <path d="M28 22l8-5v14l-8-5v-4z" fill="#4CAF50" />
          <path d="M12 26l6-8h10l-6 8H12z" fill="#0097A7" opacity="0.3" />
        </g>
      </svg>
    ),
    bg: 'bg-white',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description: 'Never miss a deadline or exam date',
    logo: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="4" y="4" width="40" height="40" rx="6" fill="#ffffff" />
        <rect x="8" y="12" width="32" height="28" rx="3" fill="#4285F4" />
        <rect x="8" y="12" width="32" height="10" rx="3" fill="#EA4335" />
        <rect x="8" y="18" width="32" height="4" fill="#EA4335" />
        <circle cx="16" cy="10" r="3" fill="#B0BEC5" />
        <circle cx="32" cy="10" r="3" fill="#B0BEC5" />
        <rect x="12" y="26" width="6" height="5" rx="1" fill="#ffffff" opacity="0.7" />
        <rect x="21" y="26" width="6" height="5" rx="1" fill="#ffffff" opacity="0.4" />
        <rect x="30" y="26" width="6" height="5" rx="1" fill="#ffffff" opacity="0.4" />
        <rect x="12" y="34" width="6" height="3" rx="1" fill="#ffffff" opacity="0.4" />
        <rect x="21" y="34" width="6" height="3" rx="1" fill="#ffffff" opacity="0.7" />
      </svg>
    ),
    bg: 'bg-white',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Video calls for online lectures',
    logo: (
      <svg viewBox="0 0 48 48" className="w-10 h-10">
        <rect x="4" y="4" width="40" height="40" rx="8" fill="#2D8CFF" />
        <path d="M10 18h18v12H10z" rx="4" fill="#ffffff" />
        <path d="M28 22l10-6v16l-10-6v-4z" fill="#ffffff" />
      </svg>
    ),
    bg: 'bg-white',
  },
];

/* How much each card is rotated/offset from center */
function getCardStyle(offset: number) {
  switch (offset) {
    case -2:
      return { rotate: -14, scale: 0.78, x: -220, opacity: 0.55, zIndex: 1 };
    case -1:
      return { rotate: -7, scale: 0.88, x: -110, opacity: 0.75, zIndex: 2 };
    case 0:
      return { rotate: 0, scale: 1, x: 0, opacity: 1, zIndex: 5 };
    case 1:
      return { rotate: 7, scale: 0.88, x: 110, opacity: 0.75, zIndex: 2 };
    case 2:
      return { rotate: 14, scale: 0.78, x: 220, opacity: 0.55, zIndex: 1 };
    default:
      return { rotate: 0, scale: 0.6, x: 0, opacity: 0, zIndex: 0 };
  }
}

export default function Integrations() {
  const [activeIndex, setActiveIndex] = useState(2);

  /* Auto-rotate every 2.5s */
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % TOOLS.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const activeTool = TOOLS[activeIndex];

  return (
    <section className="w-full py-20 px-4 bg-[#f4f4f7]">
      <div className="max-w-4xl mx-auto">
        {/* White card wrapper */}
        <div className="bg-white rounded-3xl py-16 px-6 shadow-sm">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-14">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-6">
              <Cog6ToothIcon className="w-6 h-6 text-[#EF4444]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] leading-tight">
              Integrate with your existing
              <br />
              tools in seconds
            </h2>
          </div>

          {/* Carousel — perspective container */}
          <div className="relative flex items-center justify-center h-52 [perspective:1200px]">
            {TOOLS.map((tool, i) => {
              const offset = (((i - activeIndex) % TOOLS.length) + TOOLS.length) % TOOLS.length;
              const normalizedOffset = offset > 2 ? offset - TOOLS.length : offset;
              if (Math.abs(normalizedOffset) > 2) return null;
              const style = getCardStyle(normalizedOffset);

              return (
                <motion.div
                  key={tool.id}
                  animate={{
                    rotate: style.rotate,
                    scale: style.scale,
                    x: style.x,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                  }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveIndex(i)}
                  className="absolute w-36 h-44 bg-[#f4f4f7] rounded-2xl flex items-center justify-center cursor-pointer shadow-sm"
                  style={{ zIndex: style.zIndex }}
                  aria-label={`Select ${tool.name}`}
                >
                  <div className="flex flex-col items-center gap-3">{tool.logo}</div>
                </motion.div>
              );
            })}
          </div>

          {/* Active tool info */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center mt-6"
            >
              <p className="text-base font-bold text-[#111827]">{activeTool.name}</p>
              <p className="text-sm text-gray-400 mt-1">{activeTool.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {TOOLS.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to ${TOOLS[i].name}`}
                onClick={() => setActiveIndex(i)}
                className={`transition-all rounded-full ${
                  i === activeIndex ? 'w-5 h-2 bg-[#111827]' : 'w-2 h-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
