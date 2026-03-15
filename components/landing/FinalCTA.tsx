import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function FinalCTA() {
  return (
    <section className="w-full py-20 md:py-28 px-4 bg-white">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-4">
            Your career won't wait.{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Neither should you.
            </span>
          </h2>
          <p className="text-lg text-slate-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of students who are already building better CVs, finding scholarships,
            and landing opportunities — for free.
          </p>
          <Link
            to="/signup/step-1"
            className="inline-block px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200"
          >
            Get Started — It's Free
          </Link>
          <p className="mt-4 text-sm text-slate-400">No credit card required • Takes 2 minutes</p>
        </motion.div>
      </div>
    </section>
  );
}
