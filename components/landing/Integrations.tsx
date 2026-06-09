import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cog6ToothIcon } from '@heroicons/react/24/solid';

const TOOLS = [
  {
    id: 'gmail',
    name: 'Gmail',
    description: 'Send and manage your academic emails',
    logo: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <rect width="64" height="64" rx="10" fill="#fff" />
        <path d="M6 52V22L32 38 58 22V52H48V30L32 44 16 30V52H6z" fill="#EA4335" />
        <path d="M6 22L32 38 58 22H6z" fill="#B31412" />
      </svg>
    ),
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Organize your notes and study plans',
    logo: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <rect width="64" height="64" rx="10" fill="#fff" />
        <text
          x="32"
          y="44"
          textAnchor="middle"
          fontSize="32"
          fontWeight="800"
          fill="#191919"
          fontFamily="Georgia, serif"
        >
          N
        </text>
      </svg>
    ),
  },
  {
    id: 'meet',
    name: 'Google Meet',
    description: 'Seamless video meetings for study groups',
    logo: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <rect width="64" height="64" rx="10" fill="#fff" />
        <rect x="8" y="18" width="30" height="26" rx="4" fill="#00897B" />
        <path d="M38 26l18-10v32L38 38V26z" fill="#4CAF50" />
        <rect x="14" y="24" width="18" height="3" rx="1.5" fill="#fff" opacity="0.4" />
      </svg>
    ),
  },
  {
    id: 'outlook',
    name: 'Microsoft Outlook',
    description: 'Stay on top of every deadline and email',
    logo: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <rect width="64" height="64" rx="10" fill="#fff" />
        <rect x="6" y="14" width="36" height="36" rx="4" fill="#0072C6" />
        <ellipse cx="24" cy="32" rx="10" ry="11" fill="#fff" opacity="0.9" />
        <ellipse cx="24" cy="32" rx="6" ry="7" fill="#0072C6" />
        <rect x="42" y="14" width="16" height="36" rx="3" fill="#0096D6" />
        <path d="M42 20l8 8-8 8" fill="none" stroke="#fff" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Collaborate on projects with classmates',
    logo: (
      <svg viewBox="0 0 64 64" className="w-16 h-16">
        <rect width="64" height="64" rx="10" fill="#fff" />
        <rect x="6" y="20" width="40" height="30" rx="6" fill="#5059C9" />
        <rect x="20" y="14" width="32" height="30" rx="6" fill="#7B83EB" />
        <circle cx="36" cy="22" r="7" fill="#fff" opacity="0.9" />
        <circle cx="36" cy="22" r="4" fill="#7B83EB" />
        <rect x="26" y="32" width="20" height="3" rx="1.5" fill="#fff" opacity="0.8" />
        <rect x="28" y="37" width="16" height="3" rx="1.5" fill="#fff" opacity="0.6" />
      </svg>
    ),
  },
];

// y values derived from: y = (cardHalfH) * (1 - scale)
// so every card's BOTTOM edge lands at the same pixel → rainbow arc shape.
// cardHalfH = 104px (h-52 = 208px / 2)
function getCardStyle(offset: number) {
  switch (offset) {
    case -2:
      return { rotate: -16, scale: 0.65, x: -310, y: 36, opacity: 0.55, zIndex: 1 };
    case -1:
      return { rotate: -8, scale: 0.82, x: -168, y: 19, opacity: 0.82, zIndex: 2 };
    case 0:
      return { rotate: 0, scale: 1, x: 0, y: 0, opacity: 1, zIndex: 5 };
    case 1:
      return { rotate: 8, scale: 0.82, x: 168, y: 19, opacity: 0.82, zIndex: 2 };
    case 2:
      return { rotate: 16, scale: 0.65, x: 310, y: 36, opacity: 0.55, zIndex: 1 };
    default:
      return { rotate: 0, scale: 0.5, x: 0, y: 0, opacity: 0, zIndex: 0 };
  }
}

export default function Integrations() {
  const [activeIndex, setActiveIndex] = useState(2);

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
        <div className="bg-white rounded-3xl py-16 px-6 shadow-sm overflow-hidden">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-16">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center mb-6">
              <Cog6ToothIcon className="w-6 h-6 text-[#EF4444]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] leading-tight">
              Integrate with your existing
              <br />
              tools in seconds
            </h2>
          </div>

          {/* Fan carousel — arc layout: all card bottoms align at same y */}
          <div className="relative flex items-center justify-center h-[224px]">
            {TOOLS.map((tool, i) => {
              const raw = (((i - activeIndex) % TOOLS.length) + TOOLS.length) % TOOLS.length;
              const offset = raw > 2 ? raw - TOOLS.length : raw;
              if (Math.abs(offset) > 2) return null;
              const s = getCardStyle(offset);
              const isCenter = offset === 0;

              return (
                <motion.div
                  key={tool.id}
                  animate={{ rotate: s.rotate, scale: s.scale, x: s.x, y: s.y, opacity: s.opacity }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveIndex(i)}
                  className={`absolute w-40 h-52 rounded-2xl flex items-center justify-center cursor-pointer ${
                    isCenter
                      ? 'bg-white shadow-[0_20px_60px_-8px_rgba(0,0,0,0.18)]'
                      : 'bg-[#ebebed] shadow-sm'
                  }`}
                  style={{ zIndex: s.zIndex }}
                  aria-label={`Select ${tool.name}`}
                >
                  {tool.logo}
                </motion.div>
              );
            })}
          </div>

          {/* Active tool label */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-center mt-8"
            >
              <p className="text-base font-bold text-[#111827]">{activeTool.name}</p>
              <p className="text-sm text-gray-400 mt-1">{activeTool.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6">
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
