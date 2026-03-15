import React from 'react';

export default function PainStat() {
  return (
    <section id="pain" className="py-24" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
          72% of candidates never get clear, actionable interview feedback
        </h2>
        <p className="max-w-2xl mx-auto text-base sm:text-lg" style={{ color: 'var(--text-secondary)', opacity: 0.9 }}>
          Most practice tools tell you “good” or “bad.” Lana gives you a full breakdown of what to fix, why it matters, and exactly how to get better.
        </p>
      </div>
    </section>
  );
}
