import React from 'react';
import { useLocation } from 'wouter';
import { getCtaVariant } from './useCtaVariant';
import { trackEvent } from '../utils/eventTracker';

export default function FinalCTA() {
  const [, setLocation] = useLocation();
  const ctaText = getCtaVariant();

  const handleStart = () => {
    trackEvent('cta_click', { variant: ctaText, location: 'footer' });
    setLocation('/start');
  };

  return (
    <section id="final-cta" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
          Ready to stop guessing and start improving?
        </h2>
        <p className="mx-auto text-base sm:text-lg mb-10" style={{ color: 'var(--text-secondary)', opacity: 0.9 }}>
          Jump straight into a full mock interview, get your report, and follow a clear improvement plan.
        </p>

        <button
          onClick={handleStart}
          className="px-10 py-4 rounded-full font-semibold text-lg"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            color: 'white',
            boxShadow: '0 20px 40px rgba(44, 154, 255, 0.25)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {ctaText}
        </button>

        <p className="mt-6 text-sm" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
          No credit card required. Work at your pace — your progress is saved automatically.
        </p>
      </div>
    </section>
  );
}
