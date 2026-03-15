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

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(44, 154, 255, 0.15) 0%, transparent 70%)',
          opacity: 0.5
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 224, 255, 0.1) 0%, transparent 70%)',
          opacity: 0.4
        }} />
      </div>

      <div className="relative max-w-5xl mx-auto text-center z-10">
        {/* Main Headline (2 lines) */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
          Practice interviews with AI-powered scoring
          <br />
          Get real feedback in 8 minutes
        </h1>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
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

          <button
            onClick={() => {
              document.getElementById('pain')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-10 py-4 rounded-full font-semibold text-lg"
            style={{
              background: 'transparent',
              border: '2px solid rgba(255,255,255,0.2)',
              color: 'var(--text-secondary)',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
          >
            See how it works
          </button>
        </div>

        <p className="mt-10 text-sm sm:text-base max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>
          No installs. No subscriptions. Just one mock interview that gives you an actionable report you can act on today.
        </p>
      </div>
    </section>
  );
}
