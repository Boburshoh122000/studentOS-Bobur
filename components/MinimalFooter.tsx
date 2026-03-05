'use client';

import React, { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { Instagram, Linkedin, Twitter } from 'lucide-react';
import Logo from './ui/Logo';

/* ─── Footer Link Data ──────────────────────────────────── */
const linkColumns = [
  {
    title: 'Tools',
    links: ['CV Scanner', 'Plagiarism Check', 'Learning Plans', 'Habit Tracker'],
  },
  {
    title: 'Company',
    links: ['About Us', 'Pricing (Credits)', 'Contact', 'Careers'],
  },
  {
    title: 'Legal',
    links: ['Privacy Policy', 'Terms of Service'],
  },
];

/* ─── Animation config ──────────────────────────────────── */
const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1.0];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: smoothEase } },
};

/* ─── Magnetic Hover Button ─────────────────────────────── */
function MagneticButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMouse = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const x = (e.clientX - rect.left - rect.width / 2) * 0.3;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.3;
    setPos({ x, y });
  };

  const reset = () => setPos({ x: 0, y: 0 });

  return (
    <motion.button
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className={className}
    >
      {children}
    </motion.button>
  );
}

/* ─── Social Icon with Hover Bounce ─────────────────────── */
function SocialIcon({
  icon: Icon,
  label,
}: {
  icon: React.FC<{ className?: string }>;
  label: string;
}) {
  return (
    <motion.a
      href="#"
      aria-label={label}
      whileHover={{ scale: 1.2, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-colors"
    >
      <Icon className="w-4 h-4" />
    </motion.a>
  );
}

/* ─── Main Footer Component ─────────────────────────────── */
export default function MinimalFooter() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const linksRef = useRef<HTMLDivElement>(null);
  const ctaInView = useInView(ctaRef, { once: true, margin: '-50px' });
  const linksInView = useInView(linksRef, { once: true, margin: '-50px' });

  return (
    <footer className="fixed bottom-0 left-0 w-full h-[700px] md:h-[600px] bg-[#0A0A0A] text-white -z-20 flex flex-col justify-between pt-16 pb-8 px-4 md:px-8">
      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 1: MASSIVE CTA                      */}
      {/* ═══════════════════════════════════════════ */}
      <div ref={ctaRef} className="w-full max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: smoothEase }}
          className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
        >
          Ready to ace your
          <br />
          academic life?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2, ease: smoothEase }}
          className="text-gray-400 max-w-2xl mx-auto mt-6 text-lg leading-relaxed"
        >
          Join thousands of students using StudentOS to optimize their CVs, track habits, and manage
          their credits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={ctaInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: smoothEase }}
          className="mt-10"
        >
          <MagneticButton className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-full text-white font-semibold text-base transition-colors shadow-lg shadow-indigo-500/25 inline-flex items-center gap-2">
            Get Started with Free Credits
            <ArrowRightIcon className="w-4 h-4" />
          </MagneticButton>
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 2: LINKS GRID                       */}
      {/* ═══════════════════════════════════════════ */}
      <motion.div
        ref={linksRef}
        variants={staggerContainer}
        initial="hidden"
        animate={linksInView ? 'visible' : 'hidden'}
        className="w-full max-w-6xl mx-auto border-t border-white/10 pt-10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">
          {/* Column 1: Brand */}
          <motion.div variants={fadeUp} className="col-span-2 md:col-span-1">
            <Logo iconSize="w-9 h-9" textSize="text-2xl" textColor="text-white" />
            <p className="text-gray-500 mt-3 text-sm leading-relaxed max-w-[220px]">
              The operating system for your academic future. Build, track, and succeed.
            </p>
          </motion.div>

          {/* Columns 2-4: Links */}
          {linkColumns.map((col) => (
            <motion.div key={col.title} variants={fadeUp} className="flex flex-col gap-3">
              <span className="text-white font-semibold text-sm mb-1">{col.title}</span>
              {col.links.map((link) => (
                <a
                  key={link}
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors text-sm"
                >
                  {link}
                </a>
              ))}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════ */}
      {/* SECTION 3: BOTTOM BAR                       */}
      {/* ═══════════════════════════════════════════ */}
      <div className="w-full max-w-6xl mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-xs text-gray-500">© 2026 StudentOS. All rights reserved.</span>
        <div className="flex items-center gap-3">
          <SocialIcon icon={Twitter} label="Twitter" />
          <SocialIcon icon={Instagram} label="Instagram" />
          <SocialIcon icon={Linkedin} label="LinkedIn" />
        </div>
      </div>
    </footer>
  );
}
