import React from 'react';
import { useLocation } from 'wouter';
import { getCtaVariant } from './useCtaVariant';
import { trackEvent } from '../utils/eventTracker';

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const ctaText = getCtaVariant();

  const handleStart = () => {
    trackEvent('cta_click', { variant: ctaText, location: 'hero' });
    setLocation('/start');
  };

  const handleSeeHow = () => {
    trackEvent('cta_click', { variant: 'see_how', location: 'hero' });
    document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative flex items-center justify-center"
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, rgba(0, 212, 255, 0.18), transparent 55%), var(--bg-primary)',
        color: 'var(--text-primary)'
      }}
    >
      <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-15%',
            width: '620px',
            height: '620px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.14), transparent 70%)',
            opacity: 0.65
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40%',
            left: '-20%',
            width: '720px',
            height: '720px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 195, 255, 0.12), transparent 70%)',
            opacity: 0.5
          }}
        />
      </div>

      <div className="relative w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center gap-6">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight" style={{ color: 'var(--text-primary)' }}>
            Ace Your Interview in <span style={{ color: 'var(--accent)' }}>Minutes</span>,<br />
            <span style={{ color: 'var(--accent)' }}>Not Months</span>
          </h1>

          <p className="max-w-3xl text-lg sm:text-xl" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Meet Lana: Your 24/7 AI interview coach that interviews you, scores you like real recruiters do, and gives you a personalized roadmap to get hired.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStart}
              className="glow-btn"
              style={{
                padding: '16px 32px',
                borderRadius: '50px',
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                color: 'white',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Start Free Interview →
            </button>

            <button
              onClick={handleSeeHow}
              className="text-sm font-semibold"
              style={{
                color: 'rgba(255,255,255,0.88)',
                textDecoration: 'underline',
                textUnderlineOffset: '6px'
              }}
            >
              See How It Works
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl">
            {[
              { value: '8 min', label: 'Complete interview with feedback' },
              { value: '32% avg', label: 'Score improvement (1st to 2nd)' },
              { value: '200+', label: 'Dynamically generated questions' }
            ].map((item) => (
              <div key={item.label} style={{
                padding: '1.5rem',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '1rem',
                background: 'rgba(0, 212, 255, 0.05)'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white' }}>{item.value}</div>
                <p className="mt-2" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.95rem' }}>
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
