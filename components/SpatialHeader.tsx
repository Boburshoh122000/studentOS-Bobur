'use client';

import React, { useRef, useState } from 'react';
import { motion, useSpring } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

function Magnetic({ children }: { children: React.ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

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
      style={{
        x,
        y,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </motion.div>
  );
}

const NAV_LINKS = [
  { name: 'Home', path: '/' },
  { name: 'Solutions', path: '/#solutions' },
  { name: 'Pricing', path: '/#pricing' },
  { name: 'About', path: '/about' },
];

export default function SpatialHeader() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname === '/' ? 'Home' : 'About'); // Basic active logic for demo

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-2xl"
    >
      <div className="flex items-center justify-between px-6 py-3 rounded-full bg-[#050505]/40 backdrop-blur-2xl border border-white/10 shadow-[0_0_40px_-10px_rgba(0,240,255,0.1)]">
        {/* Logo */}
        <Link to="/">
          <Magnetic>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#00F0FF] to-[#8A2BE2] shadow-[0_0_20px_rgba(0,240,255,0.4)]" />
              <span
                className="text-white font-semibold tracking-tight text-lg"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                StudentOS
              </span>
            </div>
          </Magnetic>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((link) => {
            const isActive = activeTab === link.name;
            return (
              <Magnetic key={link.name}>
                <Link
                  to={link.path}
                  onClick={() => setActiveTab(link.name)}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {link.name}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-pill"
                      className="absolute inset-0 bg-white/5 rounded-full border border-white/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="active-nav-dot"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              </Magnetic>
            );
          })}
        </nav>

        {/* CTA */}
        <div className="flex items-center">
          <Magnetic>
            <Link
              to="/signup"
              className="relative overflow-hidden group px-5 py-2 rounded-full bg-white/5 border border-white/10 hover:border-[#00F0FF]/50 transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/20 to-[#8A2BE2]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
              <span
                className="relative text-white text-sm font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Dashboard
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </motion.header>
  );
}
