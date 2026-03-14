import React from 'react';

export default function SolutionSection() {
  const features = [
    {
      icon: '🎤',
      title: 'Real-Time Voice Interview',
      description: 'Have a natural conversation with our AI interviewer. Sounds and behaves like a senior engineer conducting a real interview.',
      benefit: 'Builds realistic muscle memory'
    },
    {
      icon: '📊',
      title: '8-Dimension Scoring',
      description: 'Get scored on: Communication clarity, technical depth, problem-solving, STAR structure, confidence, ATS keyword match, follow-up handling, and more.',
      benefit: 'Exactly what recruiters measure'
    },
    {
      icon: '💡',
      title: 'Instant Detailed Feedback',
      description: 'Not just a score. See specific strengths, gaps, exact phrases to improve, and what went missing.',
      benefit: 'Know exactly what to fix'
    },
    {
      icon: '🗺️',
      title: '7-Day Personalized Plan',
      description: 'Get a day-by-day roadmap targeting your weak areas. Practice tasks, micro-lessons, and focus points—all auto-generated.',
      benefit: 'Clear, reproducible improvement'
    },
    {
      icon: '📈',
      title: 'Track Your Progress',
      description: 'Run multiple interviews. See your score trajectory across all 8 dimensions. Export beautiful PDF reports.',
      benefit: 'Prove improvement to yourself'
    },
    {
      icon: '⚡',
      title: 'Fast. Really Fast.',
      description: 'Start to finish in ~8 minutes per interview. Try 5 interviews in a day if you want. No waiting for human feedback.',
      benefit: '32% faster iteration'
    }
  ];

  return (
    <section id="solution" className="py-16 lg:py-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: 500 }}>The Complete Solution</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Everything You Need to Land Your Next Role
          </h2>
          <div style={{ height: 6, width: 120, margin: '1.5rem auto 0', borderRadius: 4, background: 'linear-gradient(90deg, #10b981, #34d399)' }} />
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px', margin: '1.5rem auto 0' }}>
            All-in-one interview prep: realistic practice + professional scoring + actionable feedback + improvement planning.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(52, 211, 153, 0.04))',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
                {feature.icon}
              </div>
              
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              
              <p className="leading-relaxed mb-3" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {feature.description}
              </p>

              <div style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '0.375rem',
                background: 'rgba(16, 185, 129, 0.1)',
                borderLeft: '3px solid #10b981',
                fontSize: '0.85rem',
                color: '#10b981',
                fontWeight: 500
              }}>
                ✓ {feature.benefit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
