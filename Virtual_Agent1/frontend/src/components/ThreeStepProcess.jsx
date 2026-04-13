import React from 'react';
import { useLocation } from 'wouter';

const steps = [
  {
    title: 'Practice with AI',
    emoji: '🤘',
    desc: 'Simulate real interviews with an AI agent that adapts to your responses and challenges you like a real recruiter.',
    link: '/features#ai-practice'
  },
  {
    title: 'Get Instant, Actionable Feedback',
    emoji: '⚡',
    desc: 'Receive detailed, unbiased feedback on your answers—instantly. Know exactly what you did well and what to improve, across communication, structure, and technical depth.',
    link: '/features#feedback'
  },
  {
    title: 'Track Progress & Build Confidence',
    emoji: '📈',
    desc: 'See your growth over time, target your weak spots, and walk into your next interview with real confidence.',
    link: '/features#progress'
  }
];

export default function ThreeStepProcess() {
  const [, setLocation] = useLocation();

  return (
    <section id="how" className="py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            The fastest path to interview confidence
          </h2>
          <p className="max-w-2xl mx-auto mt-6 text-lg sm:text-xl" style={{ color: 'var(--text-secondary)' }}>
            A simple 3-step flow that takes you from practice to progress.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <button
              key={step.title}
              className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              style={{
                cursor: 'pointer',
                padding: '2rem',
                borderRadius: '1rem',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(2, 132, 199, 0.05))',
                textAlign: 'left'
              }}
              onClick={() => setLocation(step.link)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    minWidth: '3rem',
                    borderRadius: '50%',
                    background: 'rgba(0, 212, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                  }}>
                    {step.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: 'white' }}>
                      {step.title}
                    </h3>
                  </div>
                </div>
                <span style={{ color: 'var(--accent)', fontSize: '1.5rem', fontWeight: 300, marginLeft: '1rem' }}>
                  →
                </span>
              </div>
              <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
