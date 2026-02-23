'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Twitter, Linkedin, Globe } from 'lucide-react';
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
  displayOrder: number;
}

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
              const socials = [
                member.socialTwitter && {
                  href: member.socialTwitter,
                  icon: Twitter,
                  label: 'Twitter',
                },
                member.socialLinkedin && {
                  href: member.socialLinkedin,
                  icon: Linkedin,
                  label: 'LinkedIn',
                },
                member.socialWebsite && {
                  href: member.socialWebsite,
                  icon: Globe,
                  label: 'Website',
                },
              ].filter(Boolean) as { href: string; icon: React.ElementType; label: string }[];

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
                            <social.icon size={16} strokeWidth={2} />
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
