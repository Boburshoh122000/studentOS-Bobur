import { motion } from 'framer-motion';
import {
  AcademicCapIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  BookOpenIcon,
  VideoCameraIcon,
  LinkIcon,
} from '@heroicons/react/24/solid';
import ScrollReveal from '../ScrollReveal';

/* ═══════════════════════════════════════════════════════════
   TOOL DATA
   5 student-relevant integrations. Index 2 = center/active.
══════════════════════════════════════════════════════════════ */

interface Tool {
  id: string;
  name: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Tailwind bg class for the logo block */
  logoBg: string;
  isActive?: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'classroom',
    name: 'Google Classroom',
    description: '',
    Icon: AcademicCapIcon,
    logoBg: 'bg-[#0F9D58]',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    description: '',
    Icon: EnvelopeIcon,
    logoBg: 'bg-[#EA4335]',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    description:
      'Never miss a deadline. StudentOS syncs your class schedule, assignments, and exams in one live calendar.',
    Icon: CalendarDaysIcon,
    logoBg: 'bg-[#4285F4]',
    isActive: true,
  },
  {
    id: 'notion',
    name: 'Notion',
    description: '',
    Icon: BookOpenIcon,
    logoBg: 'bg-[#191919]',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    description: '',
    Icon: VideoCameraIcon,
    logoBg: 'bg-[#2D8CFF]',
  },
];

/* ═══════════════════════════════════════════════════════════
   PER-CARD INITIAL ANIMATION STATE
   Cards fly in from the sides with a 3D Y-axis tilt.
   Center card just rises; outer cards tilt more sharply.
══════════════════════════════════════════════════════════════ */

type InitialState = {
  opacity: number;
  x?: number;
  y?: number;
  rotateY?: number;
  scale?: number;
};

function getInitial(index: number): InitialState {
  switch (index) {
    case 0:
      return { opacity: 0, x: -90, rotateY: 22 };
    case 1:
      return { opacity: 0, x: -45, rotateY: 12 };
    case 2:
      return { opacity: 0, y: 36, scale: 0.94 };
    case 3:
      return { opacity: 0, x: 45, rotateY: -12 };
    case 4:
      return { opacity: 0, x: 90, rotateY: -22 };
    default:
      return { opacity: 0 };
  }
}

/* ═══════════════════════════════════════════════════════════
   SIMPLE LOGO SVG — uses HeroIcon + brand colour
══════════════════════════════════════════════════════════════ */

function LogoBlock({
  Icon,
  bg,
  size = 'sm',
}: {
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  bg: string;
  size?: 'sm' | 'lg';
}) {
  return (
    <div
      className={`${size === 'lg' ? 'w-16 h-16 rounded-2xl' : 'w-12 h-12 rounded-xl'} ${bg} flex items-center justify-center shadow-md`}
    >
      <Icon className={`${size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} text-white`} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   INDIVIDUAL CARD
══════════════════════════════════════════════════════════════ */

function IntegrationCard({ tool, index }: { tool: Tool; index: number }) {
  const isActive = tool.isActive;
  const delay = index * 0.1;

  return (
    <motion.div
      initial={getInitial(index)}
      whileInView={{ opacity: 1, x: 0, y: 0, rotateY: 0, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
        /* Longer spring feel for the outer cards */
        type: 'tween',
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      className={[
        'flex flex-col items-center rounded-2xl p-5 cursor-default select-none',
        'border transition-shadow duration-300',
        isActive
          ? 'bg-white border-indigo-200 shadow-xl shadow-indigo-100 w-48'
          : 'bg-white border-slate-100 shadow-md hover:shadow-lg w-36',
      ].join(' ')}
    >
      {/* Logo */}
      <LogoBlock Icon={tool.Icon} bg={tool.logoBg} size={isActive ? 'lg' : 'sm'} />

      {/* Tool name */}
      <p
        className={`mt-3 font-bold text-center leading-tight ${isActive ? 'text-sm text-slate-900' : 'text-xs text-slate-600'}`}
      >
        {tool.name}
      </p>

      {/* Active card: description below name */}
      {isActive && tool.description && (
        <p className="mt-2 text-[11px] text-slate-400 text-center leading-relaxed">
          {tool.description}
        </p>
      )}

      {/* Active indicator dot */}
      {isActive && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          <span className="text-[10px] text-indigo-600 font-semibold">Connected</span>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════════════════════════════ */

export default function Integrations() {
  return (
    <section className="w-full py-24 md:py-28 px-4 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="flex flex-col items-center text-center mb-14">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-5">
              <LinkIcon className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                Integrations
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              Integrates with your
              <br className="hidden md:block" />
              <span className="text-indigo-600"> favourite student tools</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.15} className="mt-4">
            <p className="text-lg text-gray-500 max-w-lg">
              Connect the apps you already use. StudentOS works alongside your existing workflow —
              no switching required.
            </p>
          </ScrollReveal>
        </div>

        {/* Card row — perspective wrapper for 3D tilt */}
        <div className="integrations-row flex items-end justify-center gap-4 flex-wrap md:flex-nowrap">
          {TOOLS.map((tool, i) => (
            <IntegrationCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>

        {/* "More coming soon" footer */}
        <ScrollReveal delay={0.3} className="mt-10 text-center">
          <p className="text-sm text-slate-400">
            More integrations coming soon &mdash;&nbsp;
            <a
              href="/contact"
              className="text-indigo-500 hover:text-indigo-700 font-semibold transition-colors"
            >
              request one
            </a>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
