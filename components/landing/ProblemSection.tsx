import { motion } from 'framer-motion';
import { DocumentMagnifyingGlassIcon, LightBulbIcon, MapIcon } from '@heroicons/react/24/outline';

const problems = [
  {
    icon: DocumentMagnifyingGlassIcon,
    title: 'Rejected by ATS',
    description:
      'Your CV never reaches a human — automated filters eliminate 75% of applications before anyone reads them.',
    color: 'text-red-400',
    bg: 'bg-red-50',
  },
  {
    icon: LightBulbIcon,
    title: 'Generic career advice',
    description:
      "One-size-fits-all tips don't work. What got someone else hired won't necessarily work for your profile.",
    color: 'text-amber-400',
    bg: 'bg-amber-50',
  },
  {
    icon: MapIcon,
    title: 'No clear roadmap',
    description:
      'Scattered tools, contradicting advice, no structure. You spend more time researching than actually progressing.',
    color: 'text-slate-400',
    bg: 'bg-slate-50',
  },
];

export default function ProblemSection() {
  return (
    <section className="w-full py-20 md:py-28 px-4 bg-[#fafafa]">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-red-500 mb-4">
            The Problem
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
            Students waste 40+ hours on career prep
            <br className="hidden md:block" /> that leads nowhere
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-xl ${p.bg} flex items-center justify-center mb-4`}>
                <p.icon className={`w-6 h-6 ${p.color}`} />
              </div>
              <h3 className="text-base font-semibold text-gray-900 mb-2">{p.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bridge to solution */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-sm text-gray-400 mt-10"
        >
          There's a better way ↓
        </motion.p>
      </div>
    </section>
  );
}
