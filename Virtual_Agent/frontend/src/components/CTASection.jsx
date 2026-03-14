import React from 'react';
import { useLocation } from 'wouter';
import Button from './Button';

export default function CTASection() {
  const [, setLocation] = useLocation();

  const handleStartDemo = () => {
    setLocation('/start');
  };

  return (
    <section id="cta" className="py-20 lg:py-28" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div style={{
          textAlign: 'center',
          padding: '3rem 2rem',
          borderRadius: '1.5rem',
          background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.15), rgba(0, 224, 255, 0.08))',
          border: '2px solid rgba(44, 154, 255, 0.3)',
        }}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
            Stop Guessing.
            <br/>
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Start Getting Real Feedback.
            </span>
          </h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '1.5rem auto', lineHeight: '1.6' }}>
            Take a free mock interview right now. Get scored like a real recruiter would score you. See your improvement areas. Get your 7-day plan.
          </p>

          <Button
            size="lg"
            onClick={handleStartDemo}
            className="accent-btn font-bold px-12 py-4 h-auto text-lg mb-4"
          >
            Start Your Free Interview Now
          </Button>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem' }}>
            No signup required. Takes ~8 minutes. You'll get a PDF report with actionable feedback.
          </p>
        </div>

        {/* Trust/Social Proof */}
        <div className="mt-12 text-center">
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            Used by engineers and students preparing for roles at:
          </p>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            {[
              { name: 'Amazon', emoji: '🟠' },
              { name: 'Google', emoji: '🔵' },
              { name: 'Microsoft', emoji: '🟦' },
              { name: 'Meta', emoji: '🔵' },
              { name: 'Apple', emoji: '🍎' },
              { name: 'LinkedIn', emoji: '🔵' }
            ].map((company, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(44, 154, 255, 0.08)',
                  border: '1px solid rgba(44, 154, 255, 0.15)',
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{company.emoji}</span> {company.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
