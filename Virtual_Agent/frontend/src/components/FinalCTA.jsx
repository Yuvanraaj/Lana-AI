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
    <section id="final-cta" className="py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Stop practicing blind.
          <br />
          Start getting real feedback.
        </h2>

        <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-secondary)', maxWidth: 680, margin: '0 auto' }}>
          Take your first interview right now. No signup, no credit card. Just honest feedback that actually matches how FAANG recruiters score.
        </p>

        <button
          className="glow-btn mt-10"
          style={{
            padding: '18px 32px',
            borderRadius: '999px',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            color: 'white',
            fontSize: '1.05rem',
            fontWeight: 700
          }}
          onClick={handleStart}
        >
          Start Your Free Interview Now
        </button>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto text-left" style={{ color: 'var(--text-secondary)' }}>
          <div>
            <p>✓ 99.8% uptime (runs 24/7)</p>
            <p>✓ Sub-10ms latency (feels real-time)</p>
          </div>
          <div>
            <p>✓ 200+ dynamically generated questions</p>
            <p>✓ FAANG-aligned scoring rubric</p>
          </div>
        </div>

        <p className="mt-10 text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
          Your progress saves automatically. Come back anytime to continue improving.
        </p>
      </div>
    </section>
  );
}
