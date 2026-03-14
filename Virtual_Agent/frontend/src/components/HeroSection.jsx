import React from 'react';
import { useLocation } from 'wouter';
import Button from './Button';

export default function HeroSection() {
  const [, setLocation] = useLocation();

  const handleStartDemo = () => {
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
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full" style={{ background: 'rgba(44, 154, 255, 0.1)' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
          <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>Built by engineers who've aced big tech interviews</span>
        </div>

        {/* Main Headline - Strong Value Prop */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black leading-tight mb-6" style={{ color: 'var(--text-primary)' }}>
          Ace Your Interview in Minutes,
          <br />
          <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent))', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Not Months
          </span>
        </h1>

        {/* Sub-headline - Clear Promise */}
        <p className="text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto mb-4 leading-relaxed" style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
          Meet Lana: Your 24/7 AI interview coach that interviews you, scores you like real recruiters do,<br /> and gives you a personalized roadmap to get hired.
        </p>

        {/* Pain → Value */}
        <p className="text-base sm:text-lg max-w-3xl mx-auto mb-12 leading-relaxed" style={{ color: 'var(--text-secondary)', opacity: 0.85 }}>
          Stop practicing blind. Get instant, structured feedback across 8 dimensions—communication, technical depth, STAR structure, confidence, ATS alignment, and more. Then follow your custom 7-day improvement plan.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={handleStartDemo}
            className="accent-btn font-bold px-10 py-4 h-auto text-lg w-full sm:w-auto"
          >
            Start Free Interview →
          </Button>
          
          <button
            onClick={() => {
              document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              padding: '1rem 2.5rem',
              borderRadius: '0.5rem',
              border: '2px solid var(--accent)',
              color: 'var(--accent)',
              background: 'transparent',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(44, 154, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'transparent';
            }}
            className="w-full sm:w-auto"
          >
            See How It Works
          </button>
        </div>

        {/* Trust Signals */}
        <div className="mt-16 pt-12 border-t" style={{ borderColor: 'rgba(44, 154, 255, 0.2)' }}>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                8 min
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Complete interview with feedback
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                32% avg
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Score improvement (1st to 2nd interview)
              </div>
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                200+
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Dynamically generated questions
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
