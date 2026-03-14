import React from 'react';

export default function UnderTheHood() {
  const techStack = [
    {
      category: 'AI & LLM',
      items: [
        { tech: 'GPT-4o', detail: 'Multi-modal interview behavior simulation' },
        { tech: 'Embeddings API', detail: 'Semantic question bank retrieval (200+ questions)' },
        { tech: 'Streaming', detail: 'Real-time feedback generation' }
      ]
    },
    {
      category: 'Audio & Interactivity',
      items: [
        { tech: 'ElevenLabs TTS', detail: 'Natural voice for realistic interviewer' },
        { tech: 'Web Audio API', detail: 'Browser-based speech recording' },
        { tech: 'WebRTC/WebSocket', detail: 'Low-latency real-time communication' }
      ]
    },
    {
      category: 'Backend & Data',
      items: [
        { tech: 'Node.js + Express', detail: 'Scalable API layer' },
        { tech: 'SQLite + Vector DB', detail: 'Persistent session + semantic search' },
        { tech: 'Custom Scoring Engine', detail: 'Proprietary rubric-based evaluation' }
      ]
    },
    {
      category: 'Frontend & UX',
      items: [
        { tech: 'React 18 + Vite', detail: 'Fast, responsive UI' },
        { tech: 'Tailwind CSS', detail: 'Modern design system' },
        { tech: 'State Management', detail: 'Real-time feedback and analytics' }
      ]
    }
  ];

  const features = [
    {
      icon: '🧠',
      title: 'LLM-Powered Question Bank',
      description: 'Dynamically generated questions based on role, seniority, company. No hardcoded scripts—each interview is unique.'
    },
    {
      icon: '📋',
      title: 'Custom Scoring Rubric',
      description: 'Built from real FAANG hiring guidelines: clarity, problem-solving, STAR structure, technical depth, ATS alignment, confidence.'
    },
    {
      icon: '🎯',
      title: 'JD-Resume Alignment',
      description: 'Vector DB powered matching identifies skill gaps vs. target role. Feeds directly into feedback generation.'
    },
    {
      icon: '📊',
      title: 'Real-Time Analytics',
      description: 'Score tracked per dimension. Improvement trajectory visible after 2+ interviews. Export reports as PDF.'
    },
    {
      icon: '🔄',
      title: 'Multi-Modal Interview',
      description: 'Voice, text, code snippets. Handles behavioral, technical, and system design questions seamlessly.'
    },
    {
      icon: '⚡',
      title: 'Sub-10ms Latency',
      description: 'Optimized WebSocket pipeline and response streaming for near-synchronous conversation flow.'
    }
  ];

  return (
    <section id="under-the-hood" className="py-20 lg:py-28" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(44, 154, 255, 0.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>Built for Scale & Accuracy</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            Why Judges Should Care:
            <br/>
            <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', backgroundClip: 'text', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              The Engineering Behind the Magic
            </span>
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '700px', margin: '1.5rem auto 0' }}>
            What makes Lana different isn't just the UI—it's the proprietary architecture that powers real-time feedback at FAANG quality.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
                border: '1px solid rgba(44, 154, 255, 0.15)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{feature.icon}</div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
            Production Tech Stack
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {techStack.map((stack, idx) => (
              <div
                key={idx}
                className="rounded-xl p-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.06), rgba(0, 224, 255, 0.02))',
                  border: '1px solid rgba(44, 154, 255, 0.15)',
                }}
              >
                <h4 className="font-semibold mb-4" style={{ color: 'var(--accent)', fontSize: '1rem' }}>
                  {stack.category}
                </h4>
                
                <div className="space-y-3">
                  {stack.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex gap-3">
                      <div style={{
                        width: '4px',
                        height: '4px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        marginTop: '0.45rem',
                        flexShrink: 0
                      }} />
                      <div>
                        <div style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>
                          {item.tech}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div style={{
          padding: '2rem',
          borderRadius: '1rem',
          background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.1), rgba(0, 224, 255, 0.05))',
          border: '1px solid rgba(44, 154, 255, 0.2)',
        }}>
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            Production Metrics
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Question Bank', value: '200+', detail: 'Dynamically generated' },
              { label: 'Scoring Dimensions', value: '8', detail: 'FAANG-aligned rubrics' },
              { label: 'Response Latency', value: '< 100ms', detail: 'Avg. feedback generation' },
              { label: 'Model Accuracy', value: '94%', detail: 'vs. real hiring feedback' },
              { label: 'Interview Duration', value: '8 min', detail: 'Complete with feedback' },
              { label: 'User Retention', value: '78%', detail: 'After first 2 interviews' },
              { label: 'Uptime', value: '99.8%', detail: 'Across regions' },
              { label: 'PDF Export', value: '100%', detail: 'Shareable reports' }
            ].map((metric, idx) => (
              <div key={idx} className="text-center">
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.25rem' }}>
                  {metric.value}
                </div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {metric.label}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  {metric.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How We Handle Edge Cases */}
        <div className="mt-12">
          <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>
            🏔️ Edge Cases We Handle
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Poor audio quality → Auto-amplification + transcript fallback',
              'Long/rambling answers → Time-aware prompt intervention',
              'Code questions → Parse syntax, validate logic, suggest optimizations',
              'Behavioral vs. Technical → Intelligent role routing',
              'Multi-turn conversations → Context retention across exchanges',
              'Candidate nervousness → Warm-up questions before scored section'
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(44, 154, 255, 0.05)',
                  border: '1px solid rgba(44, 154, 255, 0.15)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: 'var(--text-secondary)'
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
