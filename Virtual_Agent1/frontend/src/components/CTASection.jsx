import React from 'react';
import { useLocation } from 'wouter';
import { getCtaVariant } from './useCtaVariant';
import { trackEvent } from '../utils/eventTracker';

export default function CTASection() {
  const [, setLocation] = useLocation();
  const ctaText = getCtaVariant();

  const handleClick = () => {
    trackEvent('cta_click', { variant: ctaText, location: 'cta' });
    setLocation('/start');
  };

  return (
    <section id="cta" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Ready to level up for your next interview?
        </h2>
        <p className="mt-4 text-base sm:text-lg mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: 660 }}>
          Start a mock interview now and get a detailed score report with an actionable plan—no guesswork.
        </p>

        <button
          onClick={handleClick}
          className="mt-10 px-10 py-4 rounded-full font-semibold text-lg"
          style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
            color: 'white',
            boxShadow: '0 22px 45px rgba(44, 154, 255, 0.25)',
            transition: 'transform 0.2s ease'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          {ctaText}
        </button>
      </div>
    </section>
  );
}
