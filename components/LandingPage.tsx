import { NavigationProps } from '../types';
import MinimalHeader from './MinimalHeader';
import TrustlineHero from './TrustlineHero';
import TrustedMarquee from './TrustedMarquee';
import MinimalCoreTools from './MinimalCoreTools';
import MinimalPricing from './MinimalPricing';
import MinimalFooter from './MinimalFooter';

export default function LandingPage({ navigateTo: _navigateTo }: NavigationProps) {
  return (
    <div className="min-h-screen font-sans text-[#0A0A0A] antialiased relative selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* Phase 1: Foundation */}
      <MinimalHeader />

      {/* 
        The main content Wrapper must have a solid background (bg-white) and relative z-10
        so that it slides UP over the cinematic fixed Footer underneath.
      */}
      <main className="relative z-10 w-full flex flex-col items-center bg-white mb-[700px] md:mb-[600px] shadow-[0_20px_80px_rgba(0,0,0,0.15)] rounded-b-[3rem] overflow-hidden">
        {/* Phase 1: Trustline Hero */}
        <TrustlineHero />

        {/* Phase 2: Trusted Marquee */}
        <TrustedMarquee />

        {/* Phase 3: Core Tools & Pricing */}
        <MinimalCoreTools />
        <MinimalPricing />
      </main>

      {/* Phase 4: Parallax Footer */}
      <MinimalFooter />
    </div>
  );
}
