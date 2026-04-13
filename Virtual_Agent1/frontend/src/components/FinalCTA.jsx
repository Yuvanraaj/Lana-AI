import React from 'react';
import { useLocation } from 'wouter';
import { getCtaVariant } from './useCtaVariant';
import { trackEvent } from '../utils/eventTracker';

export default function FinalCTA() {
  const [, setLocation] = useLocation();
  const ctaText = getCtaVariant();

  const handleStart = () => {
    trackEvent('cta_click', { variant: ctaText, location: 'final' });
    setLocation('/start');
  };

  return (
    <section id="final-cta" className="py-24 lg:py-32" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
          Stop practicing blind.
          <br />
          Start getting real feedback.
        </h2>

        <p className="mt-6 text-lg sm:text-xl" style={{ color: 'var(--text-secondary)', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
          Take your first interview right now. No signup, no credit card. Just honest feedback that actually matches how top tech companies evaluate candidates.
        </p>

        <button
          className="glow-btn mt-12"
          style={{
            padding: '18px 40px',
            borderRadius: '50px',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: 700
          }}
          onClick={handleStart}
        >
          Start Your Free Interview Now
        </button>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto text-left" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <p style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>✓ 99.8% uptime (runs 24/7)</p>
            <p style={{ fontSize: '1rem' }}>✓ Sub-10ms latency (feels real-time)</p>
          </div>
          <div>
            <p style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>✓ 200+ dynamically generated questions</p>
            <p style={{ fontSize: '1rem' }}>✓ Industry-aligned scoring rubric</p>
          </div>
        </div>

        <p className="mt-12 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Your progress saves automatically. Come back anytime to continue improving.
        </p>
      </div>
    </section>
  );
}
