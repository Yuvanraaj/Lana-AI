import React from 'react';
import UnderTheHood from '../components/UnderTheHood';

export default function JudgeView() {
  return (
    <div className="min-h-screen text-[var(--text-primary)]" style={{ background: 'var(--bg-primary)' }}>
      <main>
        <UnderTheHood />
      </main>
    </div>
  );
}
