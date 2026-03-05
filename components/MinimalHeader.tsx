'use client';

import React, { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent, useSpring, AnimatePresence } from 'framer-motion';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChevronDownIcon,
  Cog8ToothIcon,
  CpuChipIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  HomeIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
  UserGroupIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../src/contexts/AuthContext';

/* ─── Tools dropdown items ──────────────────────────────── */
const toolItems = [
  { label: 'ATS Resume Checker', icon: DocumentTextIcon, href: '/app/cv-ats' },
  { label: 'Plagiarism Check', icon: ShieldCheckIcon, href: '/app/plagiarism' },
  { label: 'Learning Plan', icon: CpuChipIcon, href: '/app/learning-plan' },
  { label: 'Habit Tracker', icon: CheckBadgeIcon, href: '/app/habit-tracker' },
];

/* ─── Nav links ─────────────────────────────────────────── */
const navLinks = [
  { label: 'About', href: '/about' },
  { label: 'Career Tracker', href: '/career-tracker' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

/* ─── Languages ─────────────────────────────────────────── */
const languages = [
  { code: 'EN', label: 'English' },
  { code: 'UZ', label: "O'zbekcha" },
  { code: 'RU', label: 'Русский' },
];

/* ─── Dropdown animation config ─────────────────────────── */
const dropdownVariants = {
  initial: { opacity: 0, y: 10, scale: 0.95 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 10, scale: 0.95 },
};

/* ─── Magnetic hover wrapper ────────────────────────────── */
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
    x.set((clientX - (left + width / 2)) * 0.3);
    y.set((clientY - (top + height / 2)) * 0.3);
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
      style={{ x, y }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main Header Component ─────────────────────────────── */
export default function MinimalHeader() {
  const { scrollY } = useScroll();
  const { pathname } = useLocation();
  const [hidden, setHidden] = useState(false);
  const [lastYPos, setLastYPos] = useState(0);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [activeLang, setActiveLang] = useState('EN');
  const [mobileOpen, setMobileOpen] = useState(false);
  const toolsTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const langTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const avatarTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Real auth state */
  const { isAuthenticated, user, logout } = useAuth();

  useMotionValueEvent(scrollY, 'change', (y) => {
    if (y < 50) {
      setHidden(false);
    } else if (y > lastYPos) {
      setHidden(true);
    } else {
      setHidden(false);
    }
    setLastYPos(y);
  });

  /* Hover intent helpers */
  const openTools = () => {
    if (toolsTimeout.current) clearTimeout(toolsTimeout.current);
    setToolsOpen(true);
  };
  const closeTools = () => {
    toolsTimeout.current = setTimeout(() => setToolsOpen(false), 150);
  };
  const openLang = () => {
    if (langTimeout.current) clearTimeout(langTimeout.current);
    setLangOpen(true);
  };
  const closeLang = () => {
    langTimeout.current = setTimeout(() => setLangOpen(false), 150);
  };
  const openAvatar = () => {
    if (avatarTimeout.current) clearTimeout(avatarTimeout.current);
    setAvatarOpen(true);
  };
  const closeAvatar = () => {
    avatarTimeout.current = setTimeout(() => setAvatarOpen(false), 150);
  };

  /* Get user initials for avatar */
  const getInitials = () => {
    if (user?.profile?.fullName) {
      return user.profile.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() ?? 'U';
  };

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
        className="pointer-events-auto bg-white/80 backdrop-blur-xl border border-gray-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-full px-6 py-3 flex items-center justify-between w-[95%] max-w-5xl"
      >
        {/* ─── Logo ─── */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-[#0A0A0A] mr-4">StudentOS</span>
        </Link>

        {/* ─── Center Navigation ─── */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {/* About */}
          <Link
            to={navLinks[0].href}
            className={`text-sm font-medium transition-colors relative ${
              pathname === navLinks[0].href
                ? 'text-[#0A0A0A] font-semibold'
                : 'text-gray-500 hover:text-[#0A0A0A]'
            }`}
          >
            {navLinks[0].label}
            {pathname === navLinks[0].href && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
            )}
          </Link>

          {/* Tools Dropdown */}
          <div className="relative" onMouseEnter={openTools} onMouseLeave={closeTools}>
            <button
              onClick={() => setToolsOpen(!toolsOpen)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-[#0A0A0A] transition-colors"
            >
              Tools
              <motion.span animate={{ rotate: toolsOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDownIcon className="w-3.5 h-3.5" />
              </motion.span>
            </button>

            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-2xl p-2 w-64 z-50"
                >
                  {toolItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.href}
                      onClick={() => setToolsOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700 font-medium cursor-pointer w-full"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-4 h-4 text-indigo-600" />
                      </div>
                      {item.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Remaining nav links */}
          {navLinks.slice(1).map((link) => (
            <Link
              key={link.label}
              to={link.href}
              className={`text-sm font-medium transition-colors relative ${
                pathname === link.href
                  ? 'text-[#0A0A0A] font-semibold'
                  : 'text-gray-500 hover:text-[#0A0A0A]'
              }`}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </Link>
          ))}
        </div>

        {/* ─── Right Side Actions ─── */}
        <div className="flex items-center gap-3">
          {/* Language Switcher - desktop only */}
          <div
            className="relative hidden md:block"
            onMouseEnter={openLang}
            onMouseLeave={closeLang}
          >
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-[#0A0A0A] transition-colors px-2 py-1.5 rounded-full hover:bg-gray-100/60"
            >
              <GlobeAltIcon className="w-3.5 h-3.5" />
              {activeLang}
              <ChevronDownIcon className="w-3 h-3" />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="absolute top-full right-0 mt-3 bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-xl p-1.5 w-44 z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setActiveLang(lang.code);
                        setLangOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        activeLang === lang.code
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 font-medium'
                      }`}
                    >
                      <span>{lang.label}</span>
                      <span className="text-xs text-gray-400">{lang.code}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Thin divider */}
          <div className="hidden sm:block w-px h-5 bg-gray-200/80" />

          {/* Conditional Auth / Avatar */}
          {isAuthenticated ? (
            /* ── Logged In: Avatar with Dropdown ── */
            <div className="relative" onMouseEnter={openAvatar} onMouseLeave={closeAvatar}>
              <button onClick={() => setAvatarOpen(!avatarOpen)} className="flex-shrink-0">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm shadow-md hover:shadow-lg transition-shadow ring-2 ring-white/50 cursor-pointer"
                >
                  {user?.profile?.avatarUrl ? (
                    <img
                      src={user.profile.avatarUrl}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-semibold">{getInitials()}</span>
                  )}
                </motion.div>
              </button>

              <AnimatePresence>
                {avatarOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                    className="absolute top-full right-0 mt-3 bg-white/90 backdrop-blur-xl border border-gray-100 shadow-[0_20px_40px_rgba(0,0,0,0.08)] rounded-xl p-1.5 w-48 z-50"
                  >
                    {/* User info */}
                    <div className="px-3 py-2 border-b border-gray-100 mb-1">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {user?.profile?.fullName ?? 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/app"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors w-full"
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <Link
                      to="/app/settings"
                      onClick={() => setAvatarOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors w-full"
                    >
                      <Cog8ToothIcon className="w-4 h-4" />
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setAvatarOpen(false);
                      }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 font-medium transition-colors w-full text-left"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Logged Out: Sign In + Get Started (desktop only) ── */
            <>
              <Link
                to="/signin"
                className="hidden md:block text-sm font-medium text-gray-500 hover:text-[#0A0A0A] transition-colors"
              >
                Sign In
              </Link>
              <div className="hidden md:block">
                <MagneticButton>
                  <Link
                    to="/signup/step-1"
                    className="inline-block px-5 py-2.5 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] transition-all"
                  >
                    Get Started
                  </Link>
                </MagneticButton>
              </div>
            </>
          )}
        </div>
      </motion.nav>

      {/* ─── Mobile Menu Overlay (slides up from bottom) ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="pointer-events-auto fixed bottom-16 left-0 w-full z-40 px-4 pb-2 md:hidden"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-gray-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-2xl p-5 flex flex-col gap-1.5 max-h-[70vh] overflow-y-auto">
              {/* Nav links */}
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <span className="ml-auto w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                  )}
                </Link>
              ))}

              {/* Tools section */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tools
                </p>
                {toolItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Language switcher for mobile */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Language
                </p>
                <div className="flex gap-2 px-4">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setActiveLang(lang.code)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeLang === lang.code
                          ? 'bg-indigo-50 text-indigo-600 font-semibold'
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {lang.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auth buttons */}
              {!isAuthenticated && (
                <div className="border-t border-gray-100 mt-2 pt-3 flex flex-col gap-2">
                  <Link
                    to="/signin"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/signup/step-1"
                    onClick={() => setMobileOpen(false)}
                    className="w-full text-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold shadow-md hover:bg-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Mobile Bottom Navigation Bar ─── */}
      <nav className="md:hidden pointer-events-auto fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-200/50 z-50 flex justify-around items-center px-2 pt-2 pb-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className={`flex flex-col items-center gap-0.5 min-w-[56px] transition-colors ${
            pathname === '/' ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <HomeIcon className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Home</span>
        </Link>
        <Link
          to="/blog"
          onClick={() => setMobileOpen(false)}
          className={`flex flex-col items-center gap-0.5 min-w-[56px] transition-colors ${
            pathname.startsWith('/blog') ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <DocumentTextIcon className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Blog</span>
        </Link>
        <Link
          to="/community"
          onClick={() => setMobileOpen(false)}
          className={`flex flex-col items-center gap-0.5 min-w-[56px] transition-colors ${
            pathname === '/community' ? 'text-indigo-600' : 'text-gray-400'
          }`}
        >
          <UserGroupIcon className="w-6 h-6" />
          <span className="text-[10px] font-semibold">Community</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`flex flex-col items-center gap-0.5 min-w-[56px] transition-colors ${
            mobileOpen ? 'text-indigo-600' : 'text-gray-400'
          }`}
          title="Menu"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          <span className="text-[10px] font-semibold">Menu</span>
        </button>
      </nav>
    </div>
  );
}
