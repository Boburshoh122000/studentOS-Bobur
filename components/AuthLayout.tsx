import React from 'react';
import { Link } from 'react-router-dom';
import ToolCard from './ToolCard';
import Logo from './ui/Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  footerText?: string;
  footerLinkText?: string;
  footerLinkTo?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLinkText,
  footerLinkTo,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Left Panel - Minimalist Form */}
      <div className="w-full lg:w-[45%] min-h-screen lg:h-screen lg:overflow-y-auto flex flex-col justify-between relative z-20 bg-white border-r border-slate-100">
        {/* Top Section - Logo */}
        <div className="p-8">
          <Link to="/" className="w-fit block group">
            <Logo
              iconSize="w-10 h-10"
              textSize="text-xl"
              textColor="text-slate-900 group-hover:text-blue-600 transition-colors"
            />
          </Link>
        </div>

        {/* Middle Section - Form Content (Centered) */}
        <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">{title}</h1>
            {subtitle && <p className="text-slate-500 text-sm mb-8">{subtitle}</p>}

            {children}

            {footerText && footerLinkText && footerLinkTo && (
              <p className="text-center text-sm text-slate-500 mt-8">
                {footerText}{' '}
                <Link
                  to={footerLinkTo}
                  className="text-blue-600 font-semibold hover:text-blue-700 hover:underline"
                >
                  {footerLinkText}
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section - Footer */}
        <div className="p-8 text-center">
          <p className="text-xs text-slate-400">Terms • Privacy Policy • © 2026 StudentOS</p>
        </div>
      </div>

      {/* Right Panel - Vibrant 3D Tilted Infinite Scroll */}
      <div className="hidden lg:flex lg:w-[55%] h-screen relative overflow-hidden items-center justify-center perspective-1000">
        {/* Vibrant Mesh Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-200/40 via-transparent to-transparent" />

        {/* Gradient Overlay for Fade Effect */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-indigo-100/80 via-transparent to-purple-100/80 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-pink-100 to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-indigo-100 to-transparent z-10 pointer-events-none" />

        {/* Tilted Scroll Container */}
        <div
          className="flex gap-6 transform -rotate-12 scale-110 h-[150%] -translate-y-[10%]"
          style={{ perspective: '1000px' }}
        >
          {/* Column 1 - Scroll Up */}
          <div className="flex flex-col gap-6 animate-marquee-up-slow">
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-indigo-500"
            />
            <ToolCard
              type="plagiarism"
              title="Originality Check"
              subtitle="Verify Authenticity"
              color="bg-red-500"
            />
            {/* Duplicate for infinite loop */}
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-indigo-500"
            />
            <ToolCard
              type="plagiarism"
              title="Originality Check"
              subtitle="Verify Authenticity"
              color="bg-red-500"
            />
          </div>

          {/* Column 2 - Scroll Down */}
          <div className="flex flex-col gap-6 animate-marquee-down">
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-indigo-500"
            />
            <ToolCard
              type="plagiarism"
              title="Originality Check"
              subtitle="Verify Authenticity"
              color="bg-red-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
            {/* Duplicate for infinite loop */}
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-indigo-500"
            />
            <ToolCard
              type="plagiarism"
              title="Originality Check"
              subtitle="Verify Authenticity"
              color="bg-red-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
          </div>

          {/* Column 3 - Scroll Up */}
          <div className="flex flex-col gap-6 animate-marquee-up-fast">
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-indigo-500"
            />
            <ToolCard
              type="plagiarism"
              title="Originality Check"
              subtitle="Verify Authenticity"
              color="bg-red-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
            {/* Duplicate for infinite loop */}
            <ToolCard
              type="job"
              title="Smart Job Finder"
              subtitle="Personalized Matches"
              color="bg-blue-500"
            />
            <ToolCard
              type="scholarship"
              title="Grant Hunter"
              subtitle="Find Funding"
              color="bg-yellow-500"
            />
            <ToolCard
              type="presentation"
              title="Slide Deck AI"
              subtitle="Instant Presentations"
              color="bg-indigo-500"
            />
            <ToolCard
              type="plagiarism"
              title="Originality Check"
              subtitle="Verify Authenticity"
              color="bg-red-500"
            />
            <ToolCard
              type="cv"
              title="AI CV Builder"
              subtitle="ATS Optimized Resumes"
              color="bg-green-500"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee-up {
            0% { transform: translateY(0); }
            100% { transform: translateY(-50%); }
        }
        @keyframes marquee-down {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0); }
        }
        .animate-marquee-up-slow {
            animation: marquee-up 60s linear infinite;
        }
        .animate-marquee-down {
            animation: marquee-down 50s linear infinite;
        }
        .animate-marquee-up-fast {
            animation: marquee-up 45s linear infinite;
        }
        .perspective-1000 {
            perspective: 1000px;
        }
      `}</style>
    </div>
  );
}
