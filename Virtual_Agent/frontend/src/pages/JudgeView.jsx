import React from 'react';
import WhyLanaUnique from '../components/WhyLanaUnique';
import UnderTheHood from '../components/UnderTheHood';

export default function JudgeView() {
  return (
    <div className="min-h-screen text-[var(--text-primary)]" style={{ background: 'var(--bg-primary)' }}>
      <main>
        <WhyLanaUnique />
        <UnderTheHood />
      </main>
    </div>
  );
}
