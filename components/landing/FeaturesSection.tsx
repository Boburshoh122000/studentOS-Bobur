import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ChartBarIcon,
  BriefcaseIcon,
  ClockIcon,
  BookOpenIcon,
} from '@heroicons/react/24/solid';
import ScrollReveal from '../ScrollReveal';

/* ── Card rise animation variant ── */
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15,
      ease: [0.25, 0.1, 0.25, 1.0] as [number, number, number, number],
    },
  }),
};

/* ══════════════════════════════════════
   MINI UI MOCKUPS (inside each card)
══════════════════════════════════════ */

/** 3D tilt card (Uiverse by chase2k25, themed for Study Schedule) */
function StudyScheduleCard() {
  const navigate = useNavigate();
  return (
    <div className="study3d">
      <div className="card">
        <div className="glass" />
        <div className="content">
          <span className="title">Study Schedule</span>
          <span className="text">
            Track attendance, plan your sessions, and never miss a class with smart reminders.
          </span>
        </div>
        <div className="bottom">
          <div className="view-more">
            <button
              type="button"
              className="view-more-button"
              onClick={() => navigate('/signup/step-1')}
            >
              Learn more
            </button>
            <svg
              className="svg"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h15m0 0-6-6m6 6-6 6" />
            </svg>
          </div>
          <div className="social-buttons-container">
            <button type="button" className="social-button" aria-label="Schedule">
              <CalendarDaysIcon className="svg" />
            </button>
            <button type="button" className="social-button" aria-label="Reminders">
              <ClockIcon className="svg" />
            </button>
            <button type="button" className="social-button" aria-label="Courses">
              <BookOpenIcon className="svg" />
            </button>
          </div>
        </div>
        <div className="logo">
          <span className="circle circle1" />
          <span className="circle circle2" />
          <span className="circle circle3" />
          <span className="circle circle4" />
          <span className="circle circle5">
            <CalendarDaysIcon className="svg" />
          </span>
        </div>
      </div>
    </div>
  );
}

/** Line chart mockup — Real-time grade/progress insights */
function InsightsMockup() {
  /* Points for an SVG polyline in a 200×80 box */
  const points = '0,60 40,45 80,55 120,25 160,35 200,15';
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold text-slate-700">Progress Insights</p>
        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
          ↑ 12% vs last month
        </span>
      </div>
      <p className="text-[10px] text-slate-400 mb-3">Average score across all courses</p>
      {/* Line chart */}
      <div className="relative h-20">
        <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="none">
          {/* Fill under the line */}
          <defs>
            <linearGradient id="lgFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.polygon
            points={`0,60 40,45 80,55 120,25 160,35 200,15 200,80 0,80`}
            fill="url(#lgFill)"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          {/* Line */}
          <motion.polyline
            points={points}
            fill="none"
            stroke="#6366F1"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3, ease: 'easeInOut' }}
          />
          {/* Latest dot */}
          <motion.circle
            cx="200"
            cy="15"
            r="4"
            fill="#6366F1"
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 1.1 }}
          />
        </svg>
      </div>
      {/* Metrics row */}
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { label: 'Avg Score', value: '87%' },
          { label: 'Streak', value: '14d' },
          { label: 'Top Subject', value: 'CS' },
        ].map((m) => (
          <div key={m.label}>
            <p className="text-xs font-black text-slate-800">{m.value}</p>
            <p className="text-[9px] text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Pipeline mockup — CV & career application tracker */
function CareerMockup() {
  const stages = [
    { label: 'Applied', count: 12, color: 'bg-slate-200', text: 'text-slate-600' },
    { label: 'Screening', count: 5, color: 'bg-indigo-200', text: 'text-indigo-700' },
    { label: 'Interview', count: 3, color: 'bg-violet-300', text: 'text-violet-700' },
    { label: 'Offer', count: 1, color: 'bg-emerald-400', text: 'text-emerald-900' },
  ];
  return (
    <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-bold text-slate-700">Career Pipeline</p>
        <span className="text-[9px] text-slate-400 font-medium">Jan 2026</span>
      </div>
      {/* Funnel bars */}
      <div className="space-y-2.5">
        {stages.map((s, i) => (
          <div key={s.label} className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-14 font-medium shrink-0">{s.label}</span>
            <div className="flex-1 h-5 bg-slate-50 rounded-md overflow-hidden">
              <motion.div
                className={`h-full ${s.color} rounded-md flex items-center pl-2`}
                initial={{ width: 0 }}
                whileInView={{ width: `${[100, 42, 25, 9][i]}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
              >
                <span className={`text-[9px] font-bold ${s.text}`}>{s.count}</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
      {/* CV score badge */}
      <div className="mt-3 flex items-center gap-2 bg-indigo-50 rounded-xl px-3 py-2">
        <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center">
          <BriefcaseIcon className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-[10px] text-indigo-700 font-semibold">ATS score: 92 / 100</span>
        <span className="ml-auto text-[9px] text-indigo-500 font-bold">↑ +8</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════
   FEATURE CARD WRAPPER
══════════════════════════════════════ */
interface FeatureCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  mockup: React.ReactNode;
  index: number;
}

function FeatureCard({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  mockup,
  index,
}: FeatureCardProps) {
  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
      className="bg-[#fafafa] rounded-3xl border border-gray-100 p-6 flex flex-col gap-5 hover:shadow-lg transition-shadow duration-300"
    >
      {/* Icon + label */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-400 leading-relaxed mt-0.5">{description}</p>
        </div>
      </div>
      {/* Mini UI mockup */}
      {mockup}
    </motion.div>
  );
}

/* ══════════════════════════════════════
   MAIN EXPORT
══════════════════════════════════════ */
/* The first column is the 3D Study Schedule card; these are the remaining two. */
const cards: Omit<FeatureCardProps, 'index'>[] = [
  {
    icon: ChartBarIcon,
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    title: 'Real-Time Insights',
    description: 'See your grade trends and study streaks live.',
    mockup: <InsightsMockup />,
  },
  {
    icon: BriefcaseIcon,
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    title: 'Career Tools',
    description: 'Manage applications and optimise your CV with AI.',
    mockup: <CareerMockup />,
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#111827] leading-tight">
              Built for everyone
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.12} className="mt-4">
            <p className="text-base text-gray-400 max-w-md mx-auto">
              Thousands of students, from freshmen to PhD candidates, use StudentOS to handle their
              academic life.
            </p>
          </ScrollReveal>
        </div>

        {/* Feature cards — first column is the 3D Study Schedule card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            className="flex items-center justify-center"
          >
            <StudyScheduleCard />
          </motion.div>
          {cards.map((card, i) => (
            <FeatureCard key={card.title} {...card} index={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
