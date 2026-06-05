import { useScroll, useTransform, motion } from 'framer-motion';
import { NavigationProps } from '../types';
import MinimalHeader from './MinimalHeader';
import TrustlineHero from './TrustlineHero';
import MinimalCoreTools from './MinimalCoreTools';
import MinimalPricing from './MinimalPricing';
import MinimalFooter from './MinimalFooter';
import ProblemSection from './landing/ProblemSection';
import FeatureShowcase from './landing/FeatureShowcase';
import FeaturesSection from './landing/FeaturesSection';
import Integrations from './landing/Integrations';
import TestimonialsSection from './landing/TestimonialsSection';
import HowItWorks from './landing/HowItWorks';
import FinalCTA from './landing/FinalCTA';

export default function LandingPage({ navigateTo: _navigateTo }: NavigationProps) {
  /* ── Parallax: background blobs scroll slower than page content ── */
  const { scrollYProgress } = useScroll();
  const blob1Y = useTransform(scrollYProgress, [0, 1], ['0%', '-40%']);
  const blob2Y = useTransform(scrollYProgress, [0, 1], ['0%', '-20%']);
  const blob3Y = useTransform(scrollYProgress, [0, 1], ['0%', '-55%']);

  return (
    <div className="min-h-screen font-sans text-[#0A0A0A] antialiased relative selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* ── Parallax decorative blobs (behind everything) ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          style={{ y: blob1Y }}
          className="absolute top-[10%] left-[5%] w-[500px] h-[500px] rounded-full bg-violet-200/25 blur-3xl"
        />
        <motion.div
          style={{ y: blob2Y }}
          className="absolute top-[35%] right-[8%] w-[400px] h-[400px] rounded-full bg-indigo-200/20 blur-3xl"
        />
        <motion.div
          style={{ y: blob3Y }}
          className="absolute top-[65%] left-[20%] w-[350px] h-[350px] rounded-full bg-emerald-100/20 blur-3xl"
        />
      </div>

      <MinimalHeader />

      {/*
        Main content has a solid bg-white and z-10 so it slides UP over the
        fixed footer underneath. The parallax blobs show through the hero
        (which has a semi-transparent bg-[#F8FAFC]) but are hidden under
        the white solid sections.
      */}
      <main className="relative z-10 w-full flex flex-col items-center bg-white mb-[700px] md:mb-[600px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] rounded-b-[3rem] overflow-hidden">
        {/* 1 ── Hero */}
        <TrustlineHero />

        {/* 2 ── Problem */}
        <ProblemSection />

        {/* 3 ── Features (tool grid) */}
        <FeatureShowcase />

        {/* 4 ── Features (built-for-students section with live charts) */}
        <FeaturesSection />

        {/* 5 ── Integrations */}
        <Integrations />

        {/* 6 ── Testimonials */}
        <TestimonialsSection />

        {/* 7 ── How it works */}
        <HowItWorks />

        {/* 8 ── Core tools */}
        <MinimalCoreTools />

        {/* 9 ── Pricing */}
        <MinimalPricing />

        {/* 10 ── Final CTA */}
        <FinalCTA />
      </main>

      <MinimalFooter />
    </div>
  );
}
