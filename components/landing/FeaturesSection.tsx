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

/* 3D card CSS shipped inline (scoped under .study3d) so it travels with the JS
   bundle — avoids the cached /styles.css going stale after a deploy. */
const STUDY3D_CSS = `
.study3d { width: 100%; max-width: 300px; height: 320px; perspective: 1200px; }
.study3d .card {
  position: relative; height: 100%; border-radius: 40px;
  background: linear-gradient(135deg, rgb(106,90,205) 0%, rgb(147,112,219) 100%);
  transition: all 0.6s ease-in-out; transform-style: preserve-3d;
  box-shadow: rgba(30,30,60,0) 40px 50px 25px -40px, rgba(30,30,60,0.2) 0px 25px 25px -5px;
}
.study3d .glass {
  transform-style: preserve-3d; position: absolute; inset: 10px; border-radius: 45px;
  border-top-left-radius: 100%;
  background: linear-gradient(0deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.7) 100%);
  transform: translate3d(0px, 0px, 30px);
  border-right: 1px solid rgba(255,255,255,0.5); border-bottom: 1px solid rgba(255,255,255,0.5);
  transition: all 0.6s ease-in-out;
}
.study3d .content { padding: 90px 50px 0px 25px; transform: translate3d(0, 0, 31px); }
.study3d .content .title { display: block; color: #3c2f80; font-weight: 900; font-size: 22px; }
.study3d .content .text { display: block; color: rgba(60,47,128,0.8); font-size: 14px; margin-top: 15px; }
.study3d .bottom {
  padding: 12px 15px; transform-style: preserve-3d; position: absolute;
  bottom: 25px; left: 25px; right: 25px; display: flex; align-items: center;
  justify-content: space-between; transform: translate3d(0, 0, 31px);
}
.study3d .bottom .view-more {
  display: flex; align-items: center; width: 40%; justify-content: flex-end;
  transition: all 0.3s ease-in-out;
}
.study3d .bottom .view-more:hover { transform: translate3d(0, 0, 15px); }
.study3d .bottom .view-more .view-more-button {
  background: none; border: none; color: #6a5acd; font-weight: bold; font-size: 13px; cursor: pointer;
}
.study3d .bottom .view-more .svg {
  fill: none; stroke: #6a5acd; stroke-width: 2.5px; max-height: 14px; margin-left: 4px;
}
.study3d .bottom .social-buttons-container { display: flex; gap: 12px; transform-style: preserve-3d; }
.study3d .bottom .social-buttons-container .social-button {
  width: 32px; aspect-ratio: 1; padding: 6px; background: rgba(255,255,255,0.9);
  border-radius: 50%; border: none; display: grid; place-content: center;
  box-shadow: rgba(30,30,60,0.4) 0px 8px 6px -5px; cursor: pointer;
}
.study3d .bottom .social-buttons-container .social-button:first-child {
  transition: transform 0.3s ease-in-out 0.3s, box-shadow 0.3s ease-in-out 0.3s;
}
.study3d .bottom .social-buttons-container .social-button:nth-child(2) {
  transition: transform 0.3s ease-in-out 0.5s, box-shadow 0.3s ease-in-out 0.5s;
}
.study3d .bottom .social-buttons-container .social-button:nth-child(3) {
  transition: transform 0.3s ease-in-out 0.7s, box-shadow 0.3s ease-in-out 0.7s;
}
.study3d .bottom .social-buttons-container .social-button .svg { width: 16px; fill: #3c2f80; }
.study3d .bottom .social-buttons-container .social-button:hover { background: #3c2f80; }
.study3d .bottom .social-buttons-container .social-button:hover .svg { fill: #ffffff; }
.study3d .bottom .social-buttons-container .social-button:active { background: #ffd700; }
.study3d .bottom .social-buttons-container .social-button:active .svg { fill: #3c2f80; }
.study3d .logo { position: absolute; left: 0; top: 0; transform-style: preserve-3d; }
.study3d .logo .circle {
  display: block; position: absolute; aspect-ratio: 1; border-radius: 50%; top: 0; left: 0;
  box-shadow: rgba(100,100,111,0.2) 10px 10px 20px 0px; background: rgba(147,112,219,0.3);
  transition: all 0.6s ease-in-out;
}
.study3d .logo .circle1 { width: 160px; transform: translate3d(0,0,25px); top: 10px; left: 10px; }
.study3d .logo .circle2 { width: 130px; transform: translate3d(0,0,45px); top: 12px; left: 12px; transition-delay: 0.3s; }
.study3d .logo .circle3 { width: 100px; transform: translate3d(0,0,65px); top: 15px; left: 15px; transition-delay: 0.6s; }
.study3d .logo .circle4 { width: 70px; transform: translate3d(0,0,85px); top: 20px; left: 20px; transition-delay: 0.9s; }
.study3d .logo .circle5 {
  width: 40px; transform: translate3d(0,0,105px); top: 25px; left: 25px;
  display: grid; place-content: center; transition-delay: 1.2s;
}
.study3d .logo .circle5 .svg { width: 18px; fill: #ffffff; }
.study3d:hover .card {
  transform: rotate3d(1, -1, 0, 25deg);
  box-shadow: rgba(30,30,60,0.3) 30px 50px 25px -40px, rgba(30,30,60,0.15) 0px 25px 30px 0px;
}
.study3d:hover .card .bottom .social-buttons-container .social-button {
  transform: translate3d(0,0,60px); box-shadow: rgba(30,30,60,0.25) 5px 20px 10px 0px;
}
.study3d:hover .card .logo .circle2 { transform: translate3d(0,0,65px); }
.study3d:hover .card .logo .circle3 { transform: translate3d(0,0,85px); }
.study3d:hover .card .logo .circle4 { transform: translate3d(0,0,105px); }
.study3d:hover .card .logo .circle5 { transform: translate3d(0,0,125px); }
`;

/** 3D tilt card (Uiverse by chase2k25, themed for Study Schedule) */
function StudyScheduleCard() {
  const navigate = useNavigate();
  return (
    <div className="study3d">
      <style>{STUDY3D_CSS}</style>
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
