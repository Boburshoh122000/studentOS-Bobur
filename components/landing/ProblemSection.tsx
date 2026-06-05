import { motion } from 'framer-motion';

const problems = [
  {
    stat: '75%',
    label: 'of CVs never reach a human',
    title: 'Rejected by ATS before anyone sees you',
    desc: 'Automated filters silently kill your application before a single recruiter opens it.',
    accent: 'text-red-400',
    glow: 'shadow-red-500/20',
    bar: 'from-red-500 to-rose-500',
    barW: 75,
    borderHover: 'hover:border-red-500/40',
  },
  {
    stat: '40+',
    label: 'hours wasted on generic advice',
    title: "One-size-fits-all tips that don't fit you",
    desc: 'What worked for someone else rarely applies to your profile, major, or target role.',
    accent: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    bar: 'from-amber-500 to-orange-500',
    barW: 62,
    borderHover: 'hover:border-amber-500/40',
  },
  {
    stat: '0',
    label: 'clear roadmap for most students',
    title: 'Scattered tools, no clear direction',
    desc: 'You juggle 5 apps and 3 spreadsheets and still feel lost about what to actually do next.',
    accent: 'text-slate-400',
    glow: 'shadow-slate-500/20',
    bar: 'from-slate-500 to-slate-600',
    barW: 40,
    borderHover: 'hover:border-slate-500/40',
  },
];

export default function ProblemSection() {
  return (
    <section className="w-full py-24 md:py-32 px-4 bg-slate-950 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-4">
            The Problem
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Students waste 40+ hours
            <br className="hidden md:block" />
            <span className="text-slate-400"> on career prep that leads nowhere</span>
          </h2>
        </motion.div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.stat}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.12 }}
              className={`relative rounded-2xl bg-slate-900 border border-slate-800 ${p.borderHover} p-7 overflow-hidden group transition-all duration-300 hover:shadow-xl ${p.glow}`}
            >
              {/* Background number watermark */}
              <span
                className={`absolute -top-4 -right-2 text-8xl font-black ${p.accent} opacity-[0.06] select-none pointer-events-none`}
              >
                {p.stat}
              </span>

              {/* Big stat */}
              <div className={`text-5xl font-black ${p.accent} mb-1 relative z-10`}>{p.stat}</div>
              <div className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mb-5 relative z-10">
                {p.label}
              </div>

              <h3 className="text-sm font-bold text-white mb-2 relative z-10">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed relative z-10">{p.desc}</p>

              {/* Animated progress bar */}
              <div className="mt-6 h-0.5 bg-slate-800 rounded-full overflow-hidden relative z-10">
                <motion.div
                  className={`h-full bg-gradient-to-r ${p.bar} rounded-full`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${p.barW}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: i * 0.15 + 0.3, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-sm text-slate-600 mt-12 tracking-wide"
        >
          There&apos;s a better way ↓
        </motion.p>
      </div>
    </section>
  );
}
