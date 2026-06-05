import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  WrenchScrewdriverIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/outline';
import { CheckIcon } from '@heroicons/react/24/solid';

const steps = [
  {
    number: '01',
    icon: UserPlusIcon,
    title: 'Create your profile',
    description:
      'Sign up in seconds with Google. Tell us your university, major, and career goals.',
    points: [
      'Google one-click sign-up',
      'Profile set up in under 2 min',
      'Personalised tool suggestions',
    ],
    color: 'from-indigo-500 to-violet-600',
    dotColor: 'bg-indigo-600',
    numColor: 'text-indigo-600',
    numBg: 'bg-indigo-50',
  },
  {
    number: '02',
    icon: WrenchScrewdriverIcon,
    title: 'Choose your tools',
    description: 'Pick from CV Builder, ATS Checker, Plagiarism Checker, Career Tracker and more.',
    points: ['8+ AI-powered tools', 'Use credits as you need', 'No locked features'],
    color: 'from-emerald-500 to-teal-600',
    dotColor: 'bg-emerald-600',
    numColor: 'text-emerald-600',
    numBg: 'bg-emerald-50',
  },
  {
    number: '03',
    icon: PresentationChartLineIcon,
    title: 'Track your progress',
    description: 'Your dashboard shows everything — scores, streaks, deadlines, and next actions.',
    points: ['Real-time ATS scores', 'Streak & habit tracking', 'Deadline reminders'],
    color: 'from-rose-500 to-pink-600',
    dotColor: 'bg-rose-600',
    numColor: 'text-rose-600',
    numBg: 'bg-rose-50',
  },
];

export default function HowItWorks() {
  return (
    <section className="w-full py-24 md:py-32 px-4 bg-white overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 mb-4">
            How it works
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900">Start in 3 minutes</h2>
          <p className="mt-4 text-lg text-gray-500 max-w-sm mx-auto">
            No setup required. Just sign in and you&apos;re ready to go.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative max-w-3xl mx-auto space-y-8">
          {/* Vertical connector line */}
          <div className="hidden md:block absolute left-[2.25rem] top-10 bottom-10 w-px bg-gradient-to-b from-indigo-200 via-emerald-200 to-rose-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative flex gap-6 items-start"
            >
              {/* Left: number + icon */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <motion.div
                  whileHover={{ scale: 1.08 }}
                  className={`relative w-[4.5rem] h-[4.5rem] rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg z-10`}
                >
                  <step.icon className="w-7 h-7 text-white" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white border-2 border-gray-100 text-[9px] font-black text-gray-700 flex items-center justify-center shadow-sm">
                    {step.number}
                  </span>
                </motion.div>
              </div>

              {/* Right: content */}
              <div className="flex-1 pt-2 pb-4">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-widest ${step.numColor}`}>
                    Step {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{step.description}</p>

                {/* Feature bullets */}
                <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                  {step.points.map((pt) => (
                    <div key={pt} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span
                        className={`w-4 h-4 rounded-full ${step.dotColor} flex items-center justify-center flex-shrink-0`}
                      >
                        <CheckIcon className="w-2.5 h-2.5 text-white" />
                      </span>
                      {pt}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
