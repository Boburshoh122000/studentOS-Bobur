import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'I rewrote my CV with StudentOS and got 3 interview calls in one week. The ATS checker alone was worth it — I had no idea my old CV was scoring 32%.',
    name: 'Aziza M.',
    university: 'Westminster International University',
    initials: 'AM',
    color: 'bg-indigo-500',
  },
  {
    quote:
      'The learning plan feature helped me structure my prep for internship season. I went from zero offers to two competing offers in a single semester.',
    name: 'Jasur K.',
    university: 'INHA University Tashkent',
    initials: 'JK',
    color: 'bg-emerald-500',
  },
  {
    quote:
      'Plagiarism checker saved me from submitting an essay that had accidental similarity. The dashboard makes it so easy to track everything in one place.',
    name: 'Sofia L.',
    university: 'Turin Polytechnic University',
    initials: 'SL',
    color: 'bg-violet-500',
  },
];

export default function TestimonialsSection() {
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
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-4">
            Student stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Students who leveled up</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col gap-4"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <svg key={s} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed flex-1">"{t.quote}"</p>

              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div
                  className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.university}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
