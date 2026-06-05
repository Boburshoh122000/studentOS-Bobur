import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  /** Any text or JSX to reveal */
  children: ReactNode;
  /** Extra delay in seconds (stagger children by passing increments) */
  delay?: number;
  /** Tailwind classes forwarded to the wrapper */
  className?: string;
  /** Offset from viewport edge before trigger fires (default "-80px") */
  margin?: string;
}

/**
 * Wraps any content in a blur→focus + opacity reveal triggered by scroll.
 * Uses framer-motion whileInView so it fires once when the element enters
 * the viewport. Safe to use on headings, paragraphs, or card wrappers.
 */
export default function ScrollReveal({
  children,
  delay = 0,
  className = '',
  margin = '-80px',
}: ScrollRevealProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(10px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin }}
      transition={{
        duration: 0.75,
        delay,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
