import React, { useEffect, useState } from 'react';

export default function DemoPreview() {
  const [animatedScores, setAnimatedScores] = useState({
    communication: 0,
    technicalDepth: 0,
    problemSolving: 0,
    confidence: 0,
    starStructure: 0,
    atsAlignment: 0
  });

  useEffect(() => {
    // Animate score bars on mount
    const targets = {
      communication: 4.2,
      technicalDepth: 3.8,
      problemSolving: 4.1,
      confidence: 3.9,
      starStructure: 4.0,
      atsAlignment: 4.3
    };

    let current = { ...animatedScores };
    const interval = setInterval(() => {
      let done = true;
      Object.keys(current).forEach(key => {
        if (current[key] < targets[key]) {
          current[key] = Math.min(current[key] + 0.15, targets[key]);
          done = false;
        }
      });
      setAnimatedScores({ ...current });
      if (done) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const scoreItems = [
    { label: 'Communication', score: animatedScores.communication, max: 5, feedback: 'Clear articulation with good pacing' },
    { label: 'Technical Depth', score: animatedScores.technicalDepth, max: 5, feedback: 'Solid fundamentals, missing edge cases' },
    { label: 'Problem-Solving', score: animatedScores.problemSolving, max: 5, feedback: 'Good approach, could optimize further' },
    { label: 'Confidence & Poise', score: animatedScores.confidence, max: 5, feedback: 'Confident delivery with minor hesitations' },
    { label: 'STAR/PREP Structure', score: animatedScores.starStructure, max: 5, feedback: 'Well-organized response flow' },
    { label: 'ATS Keyword Match', score: animatedScores.atsAlignment, max: 5, feedback: '86% match with JD keywords' }
  ];

  return (
    <section id="demo-preview" className="py-20 lg:py-28" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full" style={{ background: 'rgba(44, 154, 255, 0.1)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>Real-World Example</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
            What You Get After One Interview
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '650px', margin: '1.5rem auto 0' }}>
            This is an actual feedback report from a candidate practicing a Senior SWE role at Amazon.
          </p>
        </div>

        {/* Main Demo Card */}
        <div className="rounded-2xl overflow-hidden" style={{
          background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
          border: '1px solid rgba(44, 154, 255, 0.15)',
          padding: '2.5rem'
        }}>
          {/* Top Header with Summary */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8 pb-8 border-b" style={{ borderColor: 'rgba(44, 154, 255, 0.15)' }}>
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Interview Analysis Report
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Senior Software Engineer @ Amazon <span style={{ color: 'var(--accent)' }}>• March 12, 2026</span>
              </p>
            </div>
            
            {/* Overall Score Circle */}
            <div style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.2), rgba(0, 224, 255, 0.1))',
              border: '3px solid var(--accent)',
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                4.0
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Overall Score
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--accent)', marginTop: '0.5rem' }}>
                ⭐ On Track
              </div>
            </div>
          </div>

          {/* Scoring Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {scoreItems.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <label style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>
                    {item.label}
                  </label>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '1.1rem' }}>
                    {item.score.toFixed(1)}/{item.max}
                  </span>
                </div>
                
                {/* Score bar */}
                <div style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.1)',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${(item.score / item.max) * 100}%`,
                      background: item.score >= 4 ? 'linear-gradient(90deg, #10b981, #34d399)' : item.score >= 3.5 ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : 'linear-gradient(90deg, #ef4444, #f87171)',
                      transition: 'width 0.5s ease-out'
                    }}
                  />
                </div>
                
                {/* Feedback */}
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                  {item.feedback}
                </p>
              </div>
            ))}
          </div>

          {/* Improvement Suggestions */}
          <div style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            marginBottom: '2rem'
          }}>
            <h4 style={{ color: '#ef4444', fontWeight: 600, marginBottom: '0.75rem', fontSize: '0.95rem' }}>
              🎯 Top 3 Areas for Improvement
            </h4>
            <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Technical Depth:</strong> Add more data structure trade-offs analysis (3.8 → 4.4 potential)
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong>Problem-Solving:</strong> Discuss optimization strategies earlier in explanation (4.1 → 4.5+)
              </li>
              <li>
                <strong>Confidence:</strong> Practice responses with clear confidence markers and less filler words (3.9 → 4.5+)
              </li>
            </ul>
          </div>

          {/* Your 7-Day Plan */}
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem', fontSize: '1rem' }}>
              📋 Your Personalized 7-Day Improvement Plan
            </h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { day: 'Day 1', task: 'Watch: System Design Fundamentals' },
                { day: 'Day 2', task: 'Practice: 2 technical questions with edge cases' },
                { day: 'Day 3', task: 'Record: Mock STAR scenarios' },
                { day: 'Day 4', task: 'Focus: Trade-offs discussion' },
                { day: 'Day 5', task: 'Live: Practice with feedback' },
                { day: 'Day 6', task: 'Mock: Full interview dry-run' },
                { day: 'Day 7', task: 'Review: Compare progress vs. Day 1' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'rgba(44, 154, 255, 0.06)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    {item.day}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: '1.4' }}>
                    {item.task}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics Banner */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.5rem' }}>
              32%
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Average improvement in candidates' first to second interview
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            background: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
              8 min
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Time to complete a full mock interview and get structured feedback
            </div>
          </div>

          <div style={{
            padding: '1.5rem',
            borderRadius: '0.75rem',
            background: 'rgba(168, 85, 247, 0.1)',
            border: '1px solid rgba(168, 85, 247, 0.2)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#a855f7', marginBottom: '0.5rem' }}>
              94%
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Report generation accuracy in matching real rubrics used by FAANG companies
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
