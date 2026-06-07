import { NavigationProps } from '../types';
import MinimalHeader from './MinimalHeader';
import Hero from './Hero';
import CoreSolutions from './CoreSolutions';
import FeaturesSection from './landing/FeaturesSection';
import Integrations from './landing/Integrations';
import TestimonialsSection from './landing/TestimonialsSection';
import MinimalCoreTools from './MinimalCoreTools';
import MinimalPricing from './MinimalPricing';
import MinimalFooter from './MinimalFooter';

export default function LandingPage({ navigateTo: _navigateTo }: NavigationProps) {
  return (
    <div className="min-h-screen font-sans text-[#0A0A0A] antialiased bg-[#f0f0f5] overflow-x-hidden">
      <MinimalHeader />

      <main className="relative w-full flex flex-col items-center bg-white mb-[600px] md:mb-[520px] shadow-[0_20px_80px_rgba(0,0,0,0.12)] rounded-b-[2.5rem] overflow-hidden">
        {/* 1 ── Hero */}
        <Hero />

        {/* 2 ── Core Solutions */}
        <CoreSolutions />

        {/* 3 ── Built for everyone */}
        <FeaturesSection />

        {/* 4 ── Integrations */}
        <Integrations />

        {/* 5 ── Testimonials */}
        <TestimonialsSection />

        {/* 6 ── Core Tools */}
        <MinimalCoreTools />

        {/* 7 ── Pricing */}
        <MinimalPricing />
      </main>

      <MinimalFooter />
    </div>
  );
}
