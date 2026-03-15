import React, { useEffect } from 'react';
import HeroSection from './HeroSection';
<<<<<<< HEAD
import PainStat from './PainStat';
import SocialProof from './SocialProof';
import SampleOutput from './SampleOutput';
import ThreeStepProcess from './ThreeStepProcess';
import FinalCTA from './FinalCTA';
=======
import PainStat from './PainStat';
import SocialProof from './SocialProof';
import SampleOutput from './SampleOutput';
import ThreeStepProcess from './ThreeStepProcess';
import FinalCTA from './FinalCTA';
>>>>>>> origin/development

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
<<<<<<< HEAD
        <PainStat />
        <SocialProof />
        <SampleOutput />
        <ThreeStepProcess />
        <FinalCTA />
=======
        <PainStat />
        <SocialProof />
        <SampleOutput />
        <ThreeStepProcess />
        <FinalCTA />
>>>>>>> origin/development
      </main>
    </div>
  );
}
