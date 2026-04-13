import React from 'react';

export default function SolutionSection() {
  return (
    <section id="solution" className="py-20" style={{ background: 'var(--bg-secondary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Practice with an AI coach that thinks like a recruiter
          </h2>
          <p className="mt-4 text-base sm:text-lg mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: 680 }}>
            Lana simulates real interview conditions, scores your answers in real time, and gives you a clear roadmap so you can improve faster than practicing alone.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'Interview-style questions',
              desc: 'Get a personalized set of questions that adapt as you answer, just like a hiring manager would.',
            },
            {
              title: 'AI scoring & feedback',
              desc: 'Receive a breakdown of where you excel and what to improve across communication, structure, and technical depth.',
            },
            {
              title: 'Actionable next steps',
              desc: 'Follow a short playbook after each session to make progress on your most meaningful gaps.',
            }
          ].map((item) => (
            <div key={item.title} className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
                {item.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
