import React, { useEffect } from 'react';
import HeroSection from './HeroSection';
import PainSection from './PainSection';
import ThreeStepProcess from './ThreeStepProcess';
import FinalCTA from './FinalCTA';

export default function LandingPage() {
  // Enable smooth scrolling for the entire page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="min-h-screen text-[var(--text-primary)]" style={{ background: 'var(--bg-primary)' }}>
      <main>
        <HeroSection />
        <PainSection />
        <ThreeStepProcess />
        <FinalCTA />
      </main>
    </div>
  );
}
