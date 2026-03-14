import React from 'react';

export default function PainSection() {
  const painPoints = [
    {
      icon: '😰',
      title: 'Interview Anxiety Without Real Feedback',
      description: 'You practice alone. You think you sound good. Then real interviewers say your answers lacked structure or technical depth. You\'re back to square one.',
      iconColor: 'text-red-500',
      impact: 'Result: Lost offers. Wasted months.'
    },
    {
      icon: '🎲',
      title: 'Guessing What "Good" Looks Like',
      description: "LeetCode covers algorithms. YouTube covers concepts. But nobody tells you: am I communicating well? Do I follow STAR format? Am I hitting the company's keywords?",
      iconColor: 'text-yellow-500',
      impact: 'Result: Inconsistent performance. No clear improvement path.'
    },
    {
      icon: '⏸️',
      title: 'Slow Feedback Loop',
      description: 'Real interviews are 1-2 per month. Mock interviews with humans cost $50+ each. By the time you know what to fix, weeks have passed.',
      iconColor: 'text-blue-500',
      impact: 'Result: Slow iteration. Interview window closes.'
    }
  ];

  return (
    <section id="pain" className="py-16 lg:py-24" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            The Struggle Is Real
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '1rem auto 0' }}>
            Here's what you're probably experiencing right now:
          </p>
          <div style={{ height: 6, width: 120, margin: '1.5rem auto 0', borderRadius: 4, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))' }} />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <div 
              key={index}
              className="rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(255,0,0,0.08), rgba(255,100,100,0.04))',
                border: '1px solid rgba(255,100,100,0.15)',
                padding: '1.5rem'
              }}
            >
              <div className="mb-4 flex items-center justify-between">
                <div style={{ fontSize: '2.5rem' }}>{point.icon}</div>
                <div style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'white',
                  background: 'rgba(239, 68, 68, 0.8)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '0.25rem'
                }}>
                  THE PAIN
                </div>
              </div>
              
              <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                {point.title}
              </h3>
              
              <p className="leading-relaxed mb-4" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                {point.description}
              </p>

              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                borderLeft: '3px solid rgba(239, 68, 68, 0.5)',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                fontWeight: 500,
                lineHeight: '1.5'
              }}>
                {point.impact}
              </div>
            </div>
          ))}
        </div>

        {/* Bridge statement */}
        <div style={{
          marginTop: '4rem',
          padding: '2rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.1), rgba(0, 224, 255, 0.05))',
          border: '2px solid var(--accent)',
          textAlign: 'center'
        }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600 }}>
            What if you had real-time feedback from an AI that understands how actual recruiters score candidates?
          </p>
        </div>
      </div>
    </section>
  );
}
