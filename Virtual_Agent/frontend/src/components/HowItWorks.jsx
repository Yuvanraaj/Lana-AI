import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Upload & Analyze',
      description: 'Paste your resume and target job description. Our ATS analyzer extracts keywords and competencies.',
      icon: '📄',
      details: 'Resume parsed in < 5 seconds'
    },
    {
      number: '2',
      title: 'Select Your Role',
      description: 'Pick from 200+ job roles or enter custom. Lana calibrates questions to match real expectations.',
      icon: '🎯',
      details: 'Personalized question bank loaded'
    },
    {
      number: '3',
      title: 'Mock Interview',
      description: 'Have a real-time conversation with our AI interviewer using voice or text. Real recruiter behavior.',
      icon: '🎤',
      details: 'Average session: 8 minutes'
    },
    {
      number: '4',
      title: 'Structured Feedback',
      description: 'Get scored across 8 dimensions: clarity, technical depth, STAR structure, confidence, ATS alignment, and more.',
      icon: '📊',
      details: 'Rubric-based like real hiring teams'
    },
    {
      number: '5',
      title: 'Practice Plan',
      description: 'Auto-generated 7-day improvement roadmap with daily micro-tasks and targeted exercises.',
      icon: '🗺️',
      details: 'Reproducible improvement path'
    },
    {
      number: '6',
      title: 'Track Progress',
      description: 'Run multiple interviews, see your improvement trajectory. Export PDF reports for LinkedIn/portfolio.',
      icon: '📈',
      details: 'Side-by-side comparison mode'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 lg:py-28" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(44, 154, 255, 0.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>From Resume to Confidence</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Your Interview Journey,
            <br />
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Broken Into 6 Powerful Steps
            </span>
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '1.5rem auto 0' }}>
            From the first question to actionable insights—complete in under 15 minutes.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Desktop: Horizontal steps */}
          <div className="hidden md:grid md:grid-cols-6 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center relative">
                {/* Connector line (hidden on last) */}
                {idx < steps.length - 1 && (
                  <div
                    className="absolute top-16 left-1/2 w-full h-1 -ml-24"
                    style={{
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                      opacity: 0.3,
                      zIndex: 0
                    }}
                  />
                )}

                {/* Circle with number */}
                <div
                  className="relative z-10 w-20 h-20 rounded-full flex items-center justify-center font-bold text-lg mb-4"
                  style={{
                    background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.2), rgba(0, 224, 255, 0.1))',
                    border: '2px solid var(--accent)',
                    color: 'var(--accent)',
                  }}
                >
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-3xl mb-3">{step.icon}</div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                    {step.description}
                  </p>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--accent)',
                    fontWeight: 500,
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(44, 154, 255, 0.05)'
                  }}>
                    {step.details}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Vertical timeline */}
          <div className="md:hidden space-y-8">
            {steps.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                {/* Timeline line and dot */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base"
                    style={{
                      background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.2), rgba(0, 224, 255, 0.1))',
                      border: '2px solid var(--accent)',
                      color: 'var(--accent)',
                    }}
                  >
                    {step.number}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className="w-0.5 h-20"
                      style={{
                        background: 'linear-gradient(180deg, var(--accent), transparent)',
                        opacity: 0.3,
                      }}
                    />
                  )}
                </div>

                {/* Content */}
                <div className="pt-1 pb-4">
                  <div className="text-2xl mb-2">{step.icon}</div>
                  <h3 className="font-semibold text-base mb-2" style={{ color: 'var(--text-primary)' }}>
                    {step.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                    {step.description}
                  </p>
                  <div style={{
                    fontSize: '0.75rem',
                    color: 'var(--accent)',
                    fontWeight: 500,
                    padding: '0.4rem 0.6rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(44, 154, 255, 0.05)',
                    display: 'inline-block'
                  }}>
                    {step.details}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
