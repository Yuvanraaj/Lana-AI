import React from 'react';

const logos = [
  { name: 'Google', color: '#4285F4' },
  { name: 'Amazon', color: '#FF9900' },
  { name: 'Meta', color: '#1877F2' },
  { name: 'Microsoft', color: '#F65314' }
];

export default function SocialProof() {
  return (
    <section id="social-proof" className="py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
            Trusted by interviewers at
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {logos.map((logo) => (
            <div
              key={logo.name}
              className="flex items-center justify-center rounded-xl px-6 py-4 shadow-sm"
              style={{
                width: 140,
                height: 80,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)'
              }}
            >
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: logo.color }}>
                {logo.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
