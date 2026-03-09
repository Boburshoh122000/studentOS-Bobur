'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { teamApi } from '../src/services/api';

/* ─── Types ──────────────────────────────────────────────── */
interface TeamMember {
  id: string;
  fullName: string;
  role: string;
  avatarUrl: string | null;
  socialLinkedin: string | null;
  socialTwitter: string | null;
  socialWebsite: string | null;
  socialInstagram: string | null;
  socialTelegram: string | null;
  socialGithub: string | null;
  displayOrder: number;
}

/* ─── Social platform icon map ───────────────────────────── */
const SOCIAL_ICONS: {
  key: keyof TeamMember;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    key: 'socialLinkedin',
    label: 'LinkedIn',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    key: 'socialInstagram',
    label: 'Instagram',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z" />
      </svg>
    ),
  },
  {
    key: 'socialTelegram',
    label: 'Telegram',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    key: 'socialTwitter',
    label: 'Twitter / X',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
      </svg>
    ),
  },
  {
    key: 'socialGithub',
    label: 'GitHub',
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
  },
  {
    key: 'socialWebsite',
    label: 'Website',
    icon: (
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
];

/* ─── Fallback placeholder data ──────────────────────────── */
const placeholderMembers: TeamMember[] = [
  {
    id: '1',
    fullName: 'Michael Scott',
    role: 'Co-Founder, Chief Architect',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=750&fit=crop&crop=face',
    socialLinkedin: '#',
    socialTwitter: '#',
    socialWebsite: null,
    socialInstagram: null,
    socialTelegram: null,
    socialGithub: null,
    displayOrder: 1,
  },
  {
    id: '2',
    fullName: 'Chandler Rigs',
    role: 'Co-Founder, Architect',
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&h=750&fit=crop&crop=face',
    socialLinkedin: '#',
    socialTwitter: '#',
    socialWebsite: null,
    socialInstagram: null,
    socialTelegram: null,
    socialGithub: null,
    displayOrder: 2,
  },
  {
    id: '3',
    fullName: 'Isabella Rodriguez',
    role: 'Architect',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=750&fit=crop&crop=face',
    socialLinkedin: '#',
    socialTwitter: '#',
    socialWebsite: null,
    socialInstagram: null,
    socialTelegram: null,
    socialGithub: null,
    displayOrder: 3,
  },
  {
    id: '4',
    fullName: 'Ava Wilson',
    role: '3D Artist',
    avatarUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&h=750&fit=crop&crop=face',
    socialLinkedin: '#',
    socialTwitter: null,
    socialWebsite: '#',
    socialInstagram: null,
    socialTelegram: null,
    socialGithub: null,
    displayOrder: 4,
  },
];

/* ─── Animation variants ─────────────────────────────────── */
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] },
  },
};

/* ─── Main Component ─────────────────────────────────────── */
export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const { data } = await teamApi.list();
        const fetched = data as TeamMember[] | undefined;
        if (fetched && fetched.length > 0) {
          setMembers(fetched.sort((a, b) => a.displayOrder - b.displayOrder));
        } else {
          setMembers(placeholderMembers);
        }
      } catch {
        setMembers(placeholderMembers);
      }
      setLoading(false);
    };
    fetchTeam();
  }, []);

  return (
    <section className="w-full bg-white dark:bg-[#0A0A0A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* ── Section Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-sm font-semibold text-indigo-600 tracking-widest uppercase">
            Our People
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white tracking-tight mt-3 leading-tight">
            Meet the Team
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-4 text-lg max-w-xl leading-relaxed">
            A passionate group of builders, designers, and dreamers working to transcend the
            conventional.
          </p>
        </motion.div>

        {/* ── Loading skeletons ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] rounded-xl bg-gray-100 dark:bg-gray-800" />
                <div className="mt-4 h-5 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
                <div className="mt-2 h-4 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
              </div>
            ))}
          </div>
        ) : (
          /* ── Team Grid ── */
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {members.map((member) => {
              const socials = SOCIAL_ICONS.map((s) => {
                const val = member[s.key];
                if (!val) return null;
                return { href: val as string, icon: s.icon, label: s.label };
              }).filter(Boolean) as { href: string; icon: React.ReactNode; label: string }[];

              return (
                <motion.div key={member.id} variants={cardVariants} className="group">
                  {/* ── Portrait with bottom social overlay ── */}
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 group">
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.fullName}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-900/30 dark:to-indigo-800/10">
                        <span className="text-5xl font-bold text-indigo-300 dark:text-indigo-600 select-none">
                          {member.fullName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}

                    {/* Bottom gradient overlay */}
                    {socials.length > 0 && (
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    )}

                    {/* Social icons pinned to bottom-left inside image */}
                    {socials.length > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-4 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        {socials.map((social) => (
                          <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={social.label}
                            className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm text-gray-800 flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
                          >
                            {social.icon}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Name ── */}
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-4 leading-snug">
                    {member.fullName}
                  </h3>

                  {/* ── Role ── */}
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-mono tracking-tight mt-1">
                    {member.role}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
