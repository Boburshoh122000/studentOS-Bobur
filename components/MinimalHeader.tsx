'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';

function MagneticButton({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 100, damping: 20, mass: 0.1 });
  const y = useSpring(0, { stiffness: 100, damping: 20, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { height, width, left, top } = ref.current.getBoundingClientRect();
    const middleX = clientX - (left + width / 2);
    const middleY = clientY - (top + height / 2);
    x.set(middleX * 0.3);
    y.set(middleY * 0.3);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={reset}
      animate={{ x: x.get(), y: y.get() }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function MinimalHeader() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [lastYPos, setLastYPos] = useState(0);

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (y < 50) {
      setHidden(false);
    } else if (y > lastYPos) {
      setHidden(true); // scrolling down
    } else {
      setHidden(false); // scrolling up
    }
    setLastYPos(y);
  });

  return (
    <div className="fixed top-6 left-0 w-full flex justify-center z-50 pointer-events-none">
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: '-150%', opacity: 0 },
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100, damping: 20 }}
        className="pointer-events-auto bg-white/70 backdrop-blur-2xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-6 py-3 flex items-center justify-between w-[95%] max-w-5xl"
      >
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#0A0A0A] mr-4">StudentOS</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {['Product', 'Features', 'Pricing', 'Resources'].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(' ', '-')}`}
              className="text-sm font-medium text-gray-500 hover:text-[#0A0A0A] transition-colors"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <button className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-[#0A0A0A] transition-colors">
            GB EN <span className="text-[10px]">▼</span>
          </button>
          <Link
            to="/login"
            className="hidden sm:block text-sm font-medium text-gray-500 hover:text-[#0A0A0A] transition-colors"
          >
            Sign In
          </Link>
          <MagneticButton>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-full bg-[#4F46E5] text-white text-sm font-semibold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-[#4338ca] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all"
            >
              Get Started
            </Link>
          </MagneticButton>
        </div>
      </motion.nav>
    </div>
  );
}
