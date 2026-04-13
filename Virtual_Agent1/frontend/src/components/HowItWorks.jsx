import React from 'react';

export default function HowItWorks() {
  return (
    <section id="how" className="py-20" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>
            How it works
          </h2>
          <p className="mt-4 text-base sm:text-lg mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: 680 }}>
            It takes less than 10 minutes to run a full mock interview, get scored, and know exactly what to work on next.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: '1',
              title: 'Start the mock interview',
              desc: 'Answer recruiter-style questions out loud, just like a real interview—it listens and scores automatically.',
            },
            {
              step: '2',
              title: 'Receive structured feedback',
              desc: 'Get a report that highlights strengths and weaknesses across 8 scoring dimensions.',
            },
            {
              step: '3',
              title: 'Follow your improvement plan',
              desc: 'Use the tailored next steps to revise answers, practice again, and track your progress.',
            }
          ].map((item) => (
            <div key={item.step} className="rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>
              <div className="flex items-center justify-center w-14 h-14 rounded-full mb-4" style={{ background: 'rgba(44, 154, 255, 0.15)' }}>
                <span className="text-xl font-bold" style={{ color: 'var(--accent)' }}>{item.step}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
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
