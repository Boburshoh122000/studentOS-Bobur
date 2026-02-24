import React from 'react';
import { motion } from 'framer-motion';

/**
 * 3-Dot Bouncing Loader using Framer Motion.
 *
 * @param fullScreen  If true, centers in full viewport height. Default true.
 */
export function GlobalLoader({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center w-full ${
        fullScreen ? 'min-h-screen bg-[#f6f6f8] dark:bg-[#111421]' : 'min-h-[40vh]'
      }`}
    >
      {/* Light Circular Background */}
      <div className="w-20 h-20 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-blue-500 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.15, // Staggers the bounce to create the wave
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default GlobalLoader;
