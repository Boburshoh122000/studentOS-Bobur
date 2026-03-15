import { motion } from 'framer-motion';
import {
  DocumentTextIcon,
  ChartBarIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  BookOpenIcon,
  FireIcon,
} from '@heroicons/react/24/outline';

const features = [
  {
    icon: DocumentTextIcon,
    color: 'from-indigo-500 to-violet-500',
    bg: 'from-indigo-50 to-violet-50',
    title: 'CV Builder',
    description:
      'Build a polished, ATS-optimized CV in minutes using AI-guided templates. No design skills needed — just fill in your details and export.',
    tag: 'Most popular',
  },
  {
    icon: ChartBarIcon,
    color: 'from-emerald-500 to-teal-500',
    bg: 'from-emerald-50 to-teal-50',
    title: 'ATS Checker',
    description:
      'Upload your CV and get an instant compatibility score. Pinpoint exactly which keywords are missing before you hit send.',
    tag: null,
  },
  {
    icon: AcademicCapIcon,
    color: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    title: 'Plagiarism Checker',
    description:
      'Protect your academic integrity. Scan essays, reports, and assignments before submission — with detailed source detection.',
    tag: null,
  },
  {
    icon: BriefcaseIcon,
    color: 'from-sky-500 to-blue-500',
    bg: 'from-sky-50 to-blue-50',
    title: 'Career Tracker',
    description:
      'Manage every job application, interview, and offer in one place. Never lose track of where you stand in any hiring pipeline.',
    tag: null,
  },
  {
    icon: BookOpenIcon,
    color: 'from-purple-500 to-pink-500',
    bg: 'from-purple-50 to-pink-50',
    title: 'Learning Plans',
    description:
      'Get a personalised skill roadmap based on your career goals. Progress through structured milestones and track your growth.',
    tag: null,
  },
  {
    icon: FireIcon,
    color: 'from-rose-500 to-red-500',
    bg: 'from-rose-50 to-red-50',
    title: 'Habit Tracker',
    description:
      'Build daily study and career habits that compound. Streaks, check-ins, and consistency scores keep you accountable.',
    tag: null,
  },
];

export default function FeatureShowcase() {
  return (
    <section className="w-full py-20 md:py-28 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-4">
            Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            One platform. Every tool you need.
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
            From your first CV to your first offer — StudentOS has every tool organised in one
            place.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              {f.tag && (
                <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                  {f.tag}
                </span>
              )}
              {/* Gradient icon block */}
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.bg} flex items-center justify-center mb-4`}
              >
                <f.icon
                  className={`w-6 h-6 bg-gradient-to-br ${f.color} [background-clip:text] text-transparent`}
                  style={{ WebkitBackgroundClip: 'text' }}
                />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
