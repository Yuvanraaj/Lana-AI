/**
 * WhyLanaUnique Component
 * Showcases Lana's unique differentiation points for landing page
 */

import React from 'react';
import Card from './Card';

export default function WhyLanaUnique() {
  const features = [
    {
      icon: '📊',
      title: 'Deep Interview Analytics',
      description: 'Get a comprehensive breakdown of your performance across multiple dimensions: communication, technical depth, problem-solving, confidence, and answer structure. See exactly where you stand and how to improve.',
      highlight: 'Real-time scoring from our AI interviewer',
    },
    {
      icon: '🎯',
      title: 'Role & JD-Aware Interviews',
      description: 'Questions and scoring perfectly tuned to your target role and company. Just paste the job description, and Lana customizes the entire interview to match real expectations.',
      highlight: 'Personalized to your exact goals',
    },
    {
      icon: '⭐',
      title: 'Structured Feedback Like Real Companies',
      description: 'Our rubric-based evaluation mirrors how actual hiring teams assess you. We detect STAR/PREP structure in your answers and highlight exactly what\'s missing—so you can fix it before the real interview.',
      highlight: 'Aligned with real hiring practices',
    },
    {
      icon: '📈',
      title: '7-Day Practice Plan',
      description: 'After every interview, get an auto-generated, personalized practice plan targeting your weak areas. Day-by-day tasks, tips, and focus areas to make real progress fast.',
      highlight: 'Actionable next steps, every time',
    },
  ];

  return (
    <section id="why-lana-unique" className="py-16 lg:py-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(44, 154, 255, 0.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>What Makes Lana Different</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Built for Faster, <br/>
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Smarter Interview Prep
            </span>
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '1.5rem auto 0' }}>
            Stop guessing. Get real-time insights that match how actual recruiters evaluate candidates.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
                border: '1px solid rgba(44, 154, 255, 0.15)',
                ':hover': {
                  borderColor: 'rgba(44, 154, 255, 0.3)',
                }
              }}
            >
              {/* Icon */}
              <div className="mb-4 flex items-center">
                <div 
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.2), rgba(0, 224, 255, 0.1))',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                  }}
                >
                  {feature.icon}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1rem', fontSize: '0.95rem' }}>
                {feature.description}
              </p>

              {/* Highlight */}
              <div 
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  display: 'inline-block',
                }}
              >
                <p style={{ color: '#22c55e', fontSize: '0.875rem', fontWeight: 500 }}>
                  ✓ {feature.highlight}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Outcomes Section */}
        <div className="mt-16 pt-16 border-t" style={{ borderColor: 'rgba(44, 154, 255, 0.1)' }}>
          <h3 className="text-2xl font-bold text-center mb-12" style={{ color: 'var(--text-primary)' }}>
            What You Get
          </h3>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                metric: '⏱️',
                desc: 'Complete a full mock interview in 30 minutes with structured feedback',
              },
              {
                metric: '📊',
                desc: 'Detailed breakdown across 5 critical evaluation dimensions',
              },
              {
                metric: '📋',
                desc: 'Personalized practice plan targeting your weak areas',
              },
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div 
                  style={{
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                  }}
                >
                  {item.metric}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
