import React from 'react';
import { useLocation } from 'wouter';

const steps = [
  {
    title: 'INTERVIEW',
    emoji: '🎤',
    desc: 'Answer 5 recruiter-style questions with your mic, no typing needed.',
    link: '/features#interview'
  },
  {
    title: 'GET SCORED',
    emoji: '📊',
    desc: 'Receive a score across 8 dimensions, just like FAANG hiring teams.',
    link: '/features#scoring'
  },
  {
    title: 'IMPROVE',
    emoji: '🚀',
    desc: 'Follow a tailored 7-day plan that targets your biggest gaps.',
    link: '/features#plan'
  }
];

export default function ThreeStepProcess() {
  const [, setLocation] = useLocation();

  return (
    <section id="how" className="py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            The fastest path to interview confidence
          </h2>
          <p className="max-w-2xl mx-auto mt-4 text-base sm:text-lg" style={{ color: 'var(--text-secondary)', opacity: 0.9 }}>
            A simple 3-step flow that takes you from practice to progress.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <button
              key={step.title}
              className="card hover:shadow-lg"
              style={{ cursor: 'pointer' }}
              onClick={() => setLocation(step.link)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full" style={{ background: 'rgba(0, 212, 255, 0.2)' }}>
                    <span style={{ fontSize: '1.6rem' }}>{step.emoji}</span>
                  </div>
                  <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                </div>
                <span className="text-sm" style={{ color: 'var(--accent)' }}>
                  →
                </span>
              </div>
              <p className="mt-4 text-sm" style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
