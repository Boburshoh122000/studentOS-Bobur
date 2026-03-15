import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  WrenchScrewdriverIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';

const steps = [
  {
    number: '01',
    icon: UserPlusIcon,
    title: 'Create your profile',
    description:
      'Sign up in seconds with Google. Tell us your university, major, and career goals.',
  },
  {
    number: '02',
    icon: WrenchScrewdriverIcon,
    title: 'Choose your tools',
    description: 'Pick from CV Builder, ATS Checker, Plagiarism Checker, Career Tracker and more.',
  },
  {
    number: '03',
    icon: PresentationChartLineIcon,
    title: 'Track your progress',
    description: 'Your dashboard shows everything — scores, streaks, deadlines, and next actions.',
  },
];

export default function HowItWorks() {
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
            How it works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Start in 3 minutes</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-md mx-auto">
            No setup required. Just sign in and you're ready to go.
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row gap-8 md:gap-0">
          {/* Connector line — desktop only */}
          <div className="hidden md:block absolute top-10 left-[calc(16.666%+1.5rem)] right-[calc(16.666%+1.5rem)] h-px bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="flex-1 flex flex-col items-center text-center px-4"
            >
              {/* Number badge + icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border-2 border-indigo-200 text-[10px] font-black text-indigo-600 flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[200px] mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
