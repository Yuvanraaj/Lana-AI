import React from 'react';

const logos = [
  { name: 'Amazon', color: '#FF9900' },
  { name: 'Google', color: '#4285F4' },
  { name: 'Microsoft', color: '#F65314' },
  { name: 'Meta', color: '#1877F2' },
  { name: 'Apple', color: '#A2AAAD' },
  { name: 'LinkedIn', color: '#0A66C2' }
];

export default function SocialProof() {
  return (
    <section id="social-proof" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Trusted by 5,000+ engineers preparing for top tech interviews
          </h2>
          <p className="mt-4 text-base sm:text-lg" style={{ color: 'var(--text-secondary)', maxWidth: 660, margin: '0 auto' }}>
            “Improved my interview confidence in just 2 weeks.”
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 mb-10">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center rounded-2xl px-6 py-4"
              style={{
                width: 152,
                height: 72,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.04)'
              }}
            >
              <span style={{ fontSize: '1.1rem', fontWeight: 700, color: logo.color }}>
                {logo.name}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '1.2rem' }}>⭐⭐⭐⭐⭐</span>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
              4.8/5 (200+ reviews)
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem' }}>
            “Feels like practicing with an actual recruiter — fast, fair, and deeply actionable.”
          </div>
        </div>
      </div>
    </section>
  );
}
