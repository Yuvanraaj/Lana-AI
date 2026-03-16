import React from 'react';

export default function PainSection() {
  const painPoints = [
    {
      icon: '�',
      title: 'Interview Anxiety Without Real Feedback',
      subtitle: 'You think you sound good, but interviews say otherwise.',
      description: 'You rehearse answers alone, then get told your responses lacked structure or depth. It feels like starting over every single time.'
    },
    {
      icon: '🎲',
      title: 'No One Tells You What "Good" Looks Like',
      subtitle: 'You follow tutorials, but not the scorecard.',
      description: 'Algorithms and concepts are only half the story — interviewers care about communication, frameworks, and demonstrating impact.'
    },
    {
      icon: '⏱️',
      title: 'Slow Feedback = Stagnant Growth',
      subtitle: 'Weeks pass before you know what to improve.',
      description: 'Mock interviews are expensive and infrequent. By the time feedback arrives, the window has already closed.'
    }
  ];

  return (
    <section id="pain" className="py-20 lg:py-28" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
            The Struggle Is Real
          </h2>
          <p className="mt-6 mx-auto max-w-2xl text-lg sm:text-xl" style={{ color: 'var(--text-secondary)' }}>
            Most candidates miss out not because of lack of skill, but because of hidden habits and blind spots. Uncover yours and unlock your true potential.
          </p>
          <div className="mt-8 flex items-center justify-center">
            <div style={{ height: '4px', width: '96px', borderRadius: '2px', background: 'linear-gradient(90deg, var(--accent), #8b5cf6, #ec4899)' }} />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {painPoints.map((point, index) => (
            <article
              key={index}
              className="relative overflow-hidden rounded-3xl border border-white/10 p-8 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #1e3a8a 0%, #6366f1 50%, #7c3aed 100%)'
              }}
            >
              <div className="relative z-10 flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 shadow-sm flex-shrink-0">
                  <span style={{ fontSize: '1.8rem' }}>{point.icon}</span>
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold" style={{ color: 'white' }}>
                    {point.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    {point.subtitle}
                  </p>
                </div>
              </div>

              <p className="mt-6 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
