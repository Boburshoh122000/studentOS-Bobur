'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { BoltIcon, CheckIcon, CpuChipIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';

/* ─── Credit Packages Data ──────────────────────────────── */
const packages = [
  {
    name: 'Starter Pack',
    credits: 50,
    price: 5,
    badge: null,
    highlighted: false,
    features: [
      '50 one-time credits',
      'Use any tool, any time',
      'Credits never expire',
      'Basic support',
    ],
    cta: 'Buy Starter',
  },
  {
    name: 'Popular Pack',
    credits: 250,
    price: 20,
    badge: 'BEST VALUE',
    highlighted: true,
    features: [
      '250 one-time credits',
      'Use any tool, any time',
      'Credits never expire',
      'Priority support',
      'Bonus: 25 free credits',
    ],
    cta: 'Buy Popular Pack',
  },
  {
    name: 'Power Pack',
    credits: 1000,
    price: 50,
    badge: null,
    highlighted: false,
    features: [
      '1,000 one-time credits',
      'Use any tool, any time',
      'Credits never expire',
      'Priority support',
      'Bulk discount applied',
    ],
    cta: 'Buy Power Pack',
  },
];

/* ─── Credit Explainer Data ─────────────────────────────── */
const explainers = [
  {
    icon: DocumentTextIcon,
    label: '1 Credit',
    desc: '1 AI Resume Scan',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: CpuChipIcon,
    label: '5 Credits',
    desc: 'Generate Learning Plan',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: ShieldCheckIcon,
    label: '2 Credits',
    desc: 'Plagiarism Check',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
];

/* ─── Animation Variants ────────────────────────────────── */
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const wordVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: smoothEase },
  }),
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.3 + i * 0.15, duration: 0.6, ease: smoothEase },
  }),
};

const explainerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.18, duration: 0.5, ease: smoothEase },
  }),
};

/* ─── Main Component ────────────────────────────────────── */
export default function MinimalPricing() {
  const sectionRef = useRef<HTMLElement>(null);
  const explainerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '-100px' });
  const explainerInView = useInView(explainerRef, { once: true, margin: '-80px' });

  const headingWords = 'Simple, flexible credit pricing.'.split(' ');

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="w-full bg-white py-24 md:py-32 px-6 border-t border-gray-100 font-sans"
    >
      {/* ════════════════════════════════════════════ */}
      {/* SECTION 1: HEADER                           */}
      {/* ════════════════════════════════════════════ */}
      <div className="max-w-3xl mx-auto text-center mb-20">
        {/* Animated heading — word by word */}
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1] flex flex-wrap justify-center gap-x-3 gap-y-1">
          {headingWords.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              variants={wordVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6, ease: smoothEase }}
          className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mt-6 leading-relaxed"
        >
          No monthly subscriptions. Purchase credits once and use them whenever you need tools like
          CV Scanner or AI&nbsp;Check.
        </motion.p>
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 2: CREDIT PACKAGES                  */}
      {/* ════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-28">
        {packages.map((pkg, i) => (
          <motion.div
            key={pkg.name}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            whileHover={{ y: -12, transition: { type: 'spring', stiffness: 300, damping: 24 } }}
            className={`
                            relative bg-white rounded-3xl p-8 flex flex-col cursor-pointer transition-shadow duration-300
                            ${
                              pkg.highlighted
                                ? 'border-2 border-indigo-600 shadow-xl shadow-indigo-500/15 ring-1 ring-indigo-600/10'
                                : 'border border-gray-100 shadow-sm hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/20'
                            }
                        `}
          >
            {/* Badge */}
            {pkg.badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: -10 }}
                animate={inView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ delay: 0.8, type: 'spring', stiffness: 200, damping: 15 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold tracking-widest uppercase px-5 py-1.5 rounded-full shadow-lg shadow-indigo-500/30"
              >
                {pkg.badge}
              </motion.div>
            )}

            {/* Package Name */}
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">{pkg.name}</h3>
            <p className="text-sm text-gray-400 mb-6">{pkg.credits.toLocaleString()} credits</p>

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-gray-400 text-2xl font-medium">$</span>
              <span className="text-5xl font-extrabold text-indigo-600 tracking-tighter">
                {pkg.price}
              </span>
              <span className="text-gray-400 text-sm font-medium ml-1">one-time</span>
            </div>

            {/* Features */}
            <ul className="space-y-3.5 mb-10 flex-1">
              {pkg.features.map((feature, fi) => (
                <li key={fi} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckIcon className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`
                                w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-200
                                ${
                                  pkg.highlighted
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25'
                                    : 'bg-gray-50 border border-gray-200 text-gray-900 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-lg hover:shadow-indigo-500/20'
                                }
                            `}
            >
              {pkg.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>

      {/* ════════════════════════════════════════════ */}
      {/* SECTION 3: WHAT ARE CREDITS? EXPLAINER       */}
      {/* ════════════════════════════════════════════ */}
      <div ref={explainerRef} className="max-w-4xl mx-auto">
        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          animate={explainerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: smoothEase }}
          className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight text-center mb-4"
        >
          What are credits?
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={explainerInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-gray-500 text-center mb-12 max-w-xl mx-auto"
        >
          Credits are your universal currency inside StudentOS. Spend them on any tool, anytime.
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {explainers.map((item, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={explainerVariants}
              initial="hidden"
              animate={explainerInView ? 'visible' : 'hidden'}
              whileHover={{ y: -6, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 cursor-default"
            >
              <div
                className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
              >
                <item.icon className={`w-7 h-7 ${item.color}`} />
              </div>
              <p className="text-xl font-bold text-indigo-600 mb-1">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={explainerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.5, ease: smoothEase }}
          className="text-center mt-14"
        >
          <div className="inline-flex items-center gap-2 text-sm text-gray-400">
            <SparklesIcon className="w-4 h-4 text-indigo-500" />
            <span>
              New users get <strong className="text-indigo-600">10 free credits</strong> to try any
              tool.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
