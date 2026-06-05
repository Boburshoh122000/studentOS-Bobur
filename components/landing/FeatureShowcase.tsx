import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

const features = [
  {
    icon: DocumentTextIcon,
    gradient: 'from-indigo-500 via-violet-500 to-purple-600',
    glow: 'shadow-indigo-500/25',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    iconColor: 'text-indigo-600',
    title: 'CV Builder',
    description:
      'Build a polished, ATS-optimized CV in minutes using AI-guided templates. No design skills needed — just fill in your details and export.',
    tag: 'Most popular',
    tagColor: 'bg-indigo-100 text-indigo-700',
    wide: true,
  },
  {
    icon: ChartBarIcon,
    gradient: 'from-emerald-500 to-teal-500',
    glow: 'shadow-emerald-500/25',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    title: 'ATS Checker',
    description:
      'Upload your CV and get an instant compatibility score. Pinpoint exactly which keywords are missing.',
    tag: null,
    wide: false,
  },
  {
    icon: AcademicCapIcon,
    gradient: 'from-amber-500 to-orange-500',
    glow: 'shadow-amber-500/25',
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    title: 'Plagiarism Checker',
    description:
      'Scan essays and assignments before submission — with detailed source detection and AI content scoring.',
    tag: null,
    wide: false,
  },
  {
    icon: BriefcaseIcon,
    gradient: 'from-sky-500 to-blue-600',
    glow: 'shadow-sky-500/25',
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    title: 'Career Tracker',
    description:
      'Manage every job application, interview, and offer in one place. Never lose track of your pipeline.',
    tag: null,
    wide: false,
  },
  {
    icon: BookOpenIcon,
    gradient: 'from-purple-500 to-pink-500',
    glow: 'shadow-purple-500/25',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    title: 'Learning Plans',
    description:
      'Get a personalised skill roadmap based on your career goals. Progress through structured milestones.',
    tag: null,
    wide: false,
  },
  {
    icon: FireIcon,
    gradient: 'from-rose-500 to-red-500',
    glow: 'shadow-rose-500/25',
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    title: 'Habit Tracker',
    description:
      'Build daily habits that compound. Streaks, check-ins, and consistency scores keep you accountable.',
    tag: null,
    wide: false,
  },
];

function FeatureCard({
  f,
  i,
  wide = false,
}: {
  f: (typeof features)[0];
  i: number;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group relative bg-white rounded-2xl border border-gray-100 p-6 overflow-hidden cursor-default hover:shadow-xl hover:${f.glow} transition-all duration-300 ${wide ? 'md:col-span-2' : ''}`}
    >
      {/* Gradient top accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      {/* Tag */}
      {f.tag && (
        <span
          className={`absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${f.tagColor}`}
        >
          {f.tag}
        </span>
      )}

      {/* Icon */}
      <div
        className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
      >
        <f.icon className={`w-6 h-6 ${f.iconColor}`} />
      </div>

      <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>

      {/* Arrow on hover */}
      <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-gray-400 group-hover:text-indigo-600 transition-colors duration-200">
        <span>Try it free</span>
        <ArrowRightIcon className="w-3 h-3 translate-x-0 group-hover:translate-x-1 transition-transform duration-200" />
      </div>
    </motion.div>
  );
}

export default function FeatureShowcase() {
  const [first, ...rest] = features;

  return (
    <section className="w-full py-24 md:py-32 px-4 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">
            One platform.
            <br className="hidden md:block" />
            <span className="text-indigo-600"> Every tool you need.</span>
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-lg mx-auto">
            From your first CV to your first offer — StudentOS has every tool in one place.
          </p>
        </motion.div>

        {/* Bento grid: wide first card + 5 equal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {/* Wide featured card */}
          <FeatureCard f={first} i={0} wide={true} />
          {/* Remaining cards */}
          {rest.map((f, i) => (
            <FeatureCard key={f.title} f={f} i={i + 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
