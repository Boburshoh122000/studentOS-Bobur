import { NavigationProps } from '../types';
import MinimalHeader from './MinimalHeader';
import TrustlineHero from './TrustlineHero';
import MinimalCoreTools from './MinimalCoreTools';
import MinimalPricing from './MinimalPricing';
import MinimalFooter from './MinimalFooter';
import ProblemSection from './landing/ProblemSection';
import FeatureShowcase from './landing/FeatureShowcase';
import HowItWorks from './landing/HowItWorks';
import FinalCTA from './landing/FinalCTA';

export default function LandingPage({ navigateTo: _navigateTo }: NavigationProps) {
  return (
    <div className="min-h-screen font-sans text-[#0A0A0A] antialiased relative selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      <MinimalHeader />

      {/*
        The main content Wrapper must have a solid background (bg-white) and relative z-10
        so that it slides UP over the cinematic fixed Footer underneath.
      */}
      <main className="relative z-10 w-full flex flex-col items-center bg-white mb-[700px] md:mb-[600px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] rounded-b-[3rem] overflow-hidden">
        <TrustlineHero />
        <ProblemSection />
        <FeatureShowcase />
        <MinimalCoreTools />
        <HowItWorks />
        <MinimalPricing />
        <FinalCTA />
      </main>

      <MinimalFooter />
    </div>
  );
}
