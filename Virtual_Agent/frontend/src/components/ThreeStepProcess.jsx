import React from 'react';

const steps = [
  {
    title: '1. Start a Mock Interview',
    description: 'Answer 5 real recruiter-style questions using your mic (no typing needed).',
    emoji: '🎤'
  },
  {
    title: '2. Get Instant Feedback',
    description: 'Receive a scored report across communication, structure, depth, and confidence.',
    emoji: '📊'
  },
  {
    title: '3. Improve with a Plan',
    description: 'Follow a simple 7-day action plan tailored to your gaps.',
    emoji: '🚀'
  }
];

export default function ThreeStepProcess() {
  return (
    <section id="process" className="py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Practice Smarter in 3 Steps
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-base sm:text-lg" style={{ color: 'var(--text-secondary)', opacity: 0.9 }}>
            The fastest path to interview confidence: do it, see what to improve, then repeat.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.title} className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-center w-14 h-14 rounded-xl mb-4" style={{ background: 'rgba(44, 154, 255, 0.15)' }}>
                <span style={{ fontSize: '1.35rem' }}>{step.emoji}</span>
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {step.title}
              </h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
