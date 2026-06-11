'use client';

import { Link } from 'react-router-dom';

/* ─── Footer Link Data ──────────────────────────────────── */
const columns = [
  {
    title: 'Product',
    links: [
      { label: 'CV Scanner', href: '/app/ats-checker' },
      { label: 'Learning Plan', href: '/app/learning-plan' },
      { label: 'Habit Tracker', href: '/app/habit-tracker' },
      { label: 'Plagiarism Check', href: '/app/plagiarism' },
    ],
  },
  {
    title: 'Features',
    links: [
      { label: 'Scholarships', href: '/app/scholarships' },
      { label: 'Career Tools', href: '/app/career-tools' },
      { label: 'Community', href: '/app/community' },
      { label: 'Analytics', href: '/app' },
    ],
  },
  {
    title: 'Pricing',
    links: [
      { label: 'Free Plan', href: '/signup/step-1' },
      { label: 'Credits', href: '/signin' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'About Us', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

/* ─── Social icons ─────────────────────────────────────── */
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconTiktok() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.01a8.16 8.16 0 004.77 1.52V7.07a4.85 4.85 0 01-1-.38z" />
    </svg>
  );
}

/* ─── Main Footer Component ─────────────────────────────── */
export default function MinimalFooter() {
  return (
    <footer className="relative w-full bg-white flex flex-col overflow-hidden mt-2">
      {/* ─── Links grid ─── */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-12 pb-8 flex-1">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <p className="text-sm text-gray-500 leading-relaxed max-w-[200px]">
              StudentOS is the platform that builds a thriving academic career — all in one place.
            </p>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title} className="flex flex-col gap-2.5">
              <span className="text-sm font-semibold text-[#111827] mb-1">{col.title}</span>
              {col.links.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-sm text-gray-400 hover:text-[#111827] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        {/* Social + copyright */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
          <span className="text-xs text-gray-400">© 2026 StudentOS. All rights reserved.</span>
          <div className="flex items-center gap-2">
            {[
              { Icon: IconInstagram, label: 'Instagram' },
              { Icon: IconX, label: 'X (Twitter)' },
              { Icon: IconTiktok, label: 'TikTok' },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-[#111827] hover:border-gray-300 transition-colors"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Huge brand name at bottom ─── */}
      <div className="w-full overflow-hidden select-none pointer-events-none">
        <p
          className="text-[clamp(80px,14vw,180px)] font-extrabold text-[#E85540] leading-none tracking-tight whitespace-nowrap text-center"
          aria-hidden="true"
        >
          StudentOS
        </p>
      </div>
    </footer>
  );
}
