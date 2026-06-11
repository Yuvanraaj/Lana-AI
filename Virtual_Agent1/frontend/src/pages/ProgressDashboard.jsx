import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

// ─────────────────────────────────────────────────────────────────────────────
// HARDCODED DATA — Yuvanraaj C / SDE
// ─────────────────────────────────────────────────────────────────────────────
const HARDCODED_USER = { name: 'Yuvanraaj C', role: 'SDE', target: 90 };

const SESSIONS = [
  { id: 1,  date: '2025-12-15', role: 'SDE', type: 'Virtual Agent', duration: 18, score: 62, comm: 60, tech: 58, struct: 65, conf: 63, topic: 'Arrays & Strings' },
  { id: 2,  date: '2025-12-28', role: 'SDE', type: 'AI Chatbot',    duration: 14, score: 65, comm: 63, tech: 62, struct: 67, conf: 68, topic: 'Behavioral HR' },
  { id: 3,  date: '2026-01-10', role: 'SDE', type: 'Virtual Agent', duration: 22, score: 67, comm: 65, tech: 65, struct: 70, conf: 68, topic: 'Linked Lists' },
  { id: 4,  date: '2026-01-22', role: 'SDE', type: 'Virtual Agent', duration: 25, score: 70, comm: 68, tech: 68, struct: 72, conf: 72, topic: 'System Design Intro' },
  { id: 5,  date: '2026-02-05', role: 'SDE', type: 'AI Chatbot',    duration: 16, score: 72, comm: 70, tech: 70, struct: 74, conf: 74, topic: 'Trees & Graphs' },
  { id: 6,  date: '2026-02-18', role: 'SDE', type: 'Virtual Agent', duration: 28, score: 69, comm: 67, tech: 72, struct: 70, conf: 67, topic: 'System Design (LLD)' },
  { id: 7,  date: '2026-03-04', role: 'SDE', type: 'Virtual Agent', duration: 30, score: 74, comm: 72, tech: 73, struct: 75, conf: 76, topic: 'DP & Recursion' },
  { id: 8,  date: '2026-03-20', role: 'SDE', type: 'AI Chatbot',    duration: 18, score: 76, comm: 74, tech: 75, struct: 78, conf: 77, topic: 'Behavioral STAR' },
  { id: 9,  date: '2026-04-05', role: 'SDE', type: 'Virtual Agent', duration: 35, score: 78, comm: 76, tech: 78, struct: 79, conf: 79, topic: 'System Design (HLD)' },
  { id: 10, date: '2026-04-22', role: 'SDE', type: 'Virtual Agent', duration: 32, score: 80, comm: 78, tech: 80, struct: 82, conf: 80, topic: 'DSA Mixed Round' },
  { id: 11, date: '2026-05-10', role: 'SDE', type: 'Virtual Agent', duration: 38, score: 82, comm: 80, tech: 82, struct: 84, conf: 82, topic: 'Full SDE Round Sim' },
  { id: 12, date: '2026-05-30', role: 'SDE', type: 'Virtual Agent', duration: 40, score: 84, comm: 82, tech: 85, struct: 85, conf: 84, topic: 'Mock Final Interview' },
];

const CURRENT      = SESSIONS[SESSIONS.length - 1];
const AVG          = Math.round(SESSIONS.reduce((s, x) => s + x.score, 0) / SESSIONS.length * 10) / 10;
const BEST         = Math.max(...SESSIONS.map(s => s.score));
const STREAK       = 4;
const SKILLS_NOW   = { comm: CURRENT.comm, tech: CURRENT.tech, struct: CURRENT.struct, conf: CURRENT.conf };
const SKILLS_BENCH = { comm: 80, tech: 88, struct: 82, conf: 78 };

const TOPIC_COVERAGE = [
  { name: 'DSA & Algorithms',   pct: 78 },
  { name: 'System Design',      pct: 65 },
  { name: 'Behavioral (HR)',    pct: 72 },
  { name: 'Resume & Intro',     pct: 85 },
  { name: 'Dynamic Programming',pct: 55 },
  { name: 'Database Design',    pct: 40 },
];

const STRENGTHS = [
  'Excellent code readability and clean naming conventions',
  'Strong problem decomposition for complex DS questions',
  'Articulate and structured communication in behavioral rounds',
  'Consistent and accurate time complexity analysis',
];

const WEAKNESSES = [
  'System Design depth — caching, sharding, scalability need work',
  'Dynamic Programming — pattern recognition is still slow',
  'Database query optimization is under-practiced',
  'Tends to skip edge-case handling under time pressure',
];

// ─────────────────────────────────────────────────────────────────────────────
// COLOR HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function scoreColor(v) {
  if (v >= 80) return '#a855f7';
  if (v >= 70) return '#3b82f6';
  if (v >= 60) return '#06b6d4';
  return '#ef4444';
}
function scoreGrad(v) {
  if (v >= 80) return ['#a855f7', '#6366f1'];
  if (v >= 70) return ['#3b82f6', '#06b6d4'];
  if (v >= 60) return ['#06b6d4', '#22c55e'];
  return ['#ef4444', '#f97316'];
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED CIRCULAR GAUGE
// ─────────────────────────────────────────────────────────────────────────────
function CircularGauge({ label, value, max = 100, size = 130 }) {
  const [animated, setAnimated] = useState(0);
  const r      = size / 2 - 10;
  const circ   = 2 * Math.PI * r;
  const color  = scoreColor(value);
  const [c1, c2] = scoreGrad(value);
  const gradId = `cg-${label.replace(/[\s&]/g, '')}`;

  useEffect(() => {
    let raf;
    let start = null;
    const dur = 1300;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimated(Math.round(ease * value));
      if (p < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const filled = (animated / max) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c1} />
            <stop offset="100%" stopColor={c2} />
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
          strokeDashoffset={circ * 0.25}
          style={{ filter: `drop-shadow(0 0 7px ${color}99)` }}
        />
        <text x={size/2} y={size/2 - 5} textAnchor="middle" fill="white" fontSize="21" fontWeight="800">{animated}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">/{max}</text>
      </svg>
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 600, textAlign: 'center', lineHeight: '1.3' }}>{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG RADAR CHART
// ─────────────────────────────────────────────────────────────────────────────
function RadarChart({ data, benchmark, size = 300 }) {
  const cx = size / 2, cy = size / 2;
  const maxR = size / 2 - 44;
  const dims = ['Communication', 'Technical\nDepth', 'Structure', 'Confidence'];
  const keys = ['comm', 'tech', 'struct', 'conf'];
  const N    = dims.length;

  function polar(angle, r) {
    const rad = (angle - 90) * (Math.PI / 180);
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  function polyStr(pts) { return pts.map(p => p.join(',')).join(' '); }

  const userPts  = keys.map((k, i) => polar((360/N)*i, (data[k]      / 100) * maxR));
  const benchPts = keys.map((k, i) => polar((360/N)*i, (benchmark[k] / 100) * maxR));

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {/* Grid rings */}
      {[20, 40, 60, 80, 100].map(pct => (
        <polygon key={pct}
          points={polyStr(keys.map((_, i) => polar((360/N)*i, (pct/100)*maxR)))}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      ))}
      {/* Axes */}
      {keys.map((_, i) => {
        const [x2, y2] = polar((360/N)*i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={x2} y2={y2} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
      })}
      {/* Benchmark area */}
      <polygon points={polyStr(benchPts)}
        fill="rgba(99,102,241,0.1)" stroke="rgba(99,102,241,0.45)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* User area */}
      <polygon points={polyStr(userPts)}
        fill="rgba(168,85,247,0.22)" stroke="rgba(168,85,247,0.9)" strokeWidth="2.5"
        style={{ filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.5))' }} />
      {/* User dots */}
      {userPts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="5" fill="#a855f7" stroke="white" strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.9))' }} />
      ))}
      {/* Ring labels */}
      {[40, 60, 80].map(v => {
        const [x, y] = polar(0, (v/100)*maxR);
        return <text key={v} x={x+4} y={y+4} fill="rgba(255,255,255,0.25)" fontSize="9">{v}</text>;
      })}
      {/* Axis labels */}
      {dims.map((d, i) => {
        const [x, y] = polar((360/N)*i, maxR + 26);
        const lines = d.split('\n');
        return (
          <text key={i} x={x} y={y - (lines.length - 1) * 6} textAnchor="middle"
            fill="rgba(255,255,255,0.8)" fontSize="11" fontWeight="600">
            {lines.map((l, li) => <tspan key={li} x={x} dy={li === 0 ? 0 : 13}>{l}</tspan>)}
          </text>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG MULTI-LINE CHART
// ─────────────────────────────────────────────────────────────────────────────
function MultiLineChart({ sessions, height = 260 }) {
  const W = 680, H = height;
  const padL = 38, padR = 16, padT = 16, padB = 48;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const xStep  = chartW / (sessions.length - 1);

  const lines = [
    { key: 'score', label: 'Overall',  color: '#a855f7', width: 2.5 },
    { key: 'comm',  label: 'Comm',     color: '#3b82f6', width: 1.8 },
    { key: 'tech',  label: 'Tech',     color: '#06b6d4', width: 1.8 },
    { key: 'conf',  label: 'Conf',     color: '#10b981', width: 1.8 },
  ];

  function pathD(key) {
    return sessions.map((s, i) => {
      const x = padL + i * xStep;
      const y = padT + chartH - (s[key] / 100) * chartH;
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }

  const yTicks = [40, 60, 80, 100];

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', minWidth: '360px', height: 'auto' }}>
        {/* Grid */}
        {yTicks.map(v => {
          const y = padT + chartH - (v/100) * chartH;
          return (
            <g key={v}>
              <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={padL-5} y={y+4} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="10">{v}</text>
            </g>
          );
        })}
        {/* X labels — every other if dense */}
        {sessions.map((s, i) => {
          if (sessions.length > 8 && i % 2 !== 0) return null;
          const x = padL + i * xStep;
          const lbl = new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return <text key={i} x={x} y={H-6} textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10">{lbl}</text>;
        })}
        {/* Lines */}
        {lines.map(({ key, color, width }) => (
          <path key={key} d={pathD(key)} fill="none" stroke={color} strokeWidth={width}
            strokeLinecap="round" strokeLinejoin="round"
            style={{ filter: `drop-shadow(0 0 3px ${color}55)` }} />
        ))}
        {/* Dots — overall only */}
        {sessions.map((s, i) => {
          const x = padL + i * xStep;
          const y = padT + chartH - (s.score/100) * chartH;
          return <circle key={i} cx={x} cy={y} r="4.5" fill="#a855f7" stroke="white" strokeWidth="1.5"
            style={{ filter: 'drop-shadow(0 0 4px rgba(168,85,247,0.9))' }} />;
        })}
        {/* Legend */}
        {lines.map(({ label, color }, i) => (
          <g key={i} transform={`translate(${padL + i * 95}, ${H - 2})`}>
            <line x1="0" y1="-9" x2="14" y2="-9" stroke={color} strokeWidth="2.5" />
            <circle cx="7" cy="-9" r="3" fill={color} />
            <text x="18" y="-5" fill="rgba(255,255,255,0.55)" fontSize="10">{label}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ANIMATED PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
function AnimBar({ value, max = 100, color, height = 10 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(value), 120);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <div style={{ height: `${height}px`, background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${(w/max)*100}%`,
        background: color, borderRadius: '999px',
        transition: 'width 1.3s cubic-bezier(0.4,0,0.2,1)',
        boxShadow: `0 0 10px ${color}77`,
      }} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MINI SPARKLINE
// ─────────────────────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#a855f7', w = 80, h = 28 }) {
  if (data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data);
  const range = mx - mn || 1;
  const pts = data.map((v, i) => `${(i/(data.length-1))*w},${h - ((v-mn)/range)*h}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MONTHLY HEATMAP STRIP
// ─────────────────────────────────────────────────────────────────────────────
function SessionHeatmap({ sessions }) {
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const grouped = {};
  months.forEach(m => { grouped[m] = []; });
  sessions.forEach(s => {
    const m = new Date(s.date).toLocaleDateString('en-US', { month: 'short' });
    if (grouped[m]) grouped[m].push(s.score);
  });
  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      {months.map(m => {
        const scores = grouped[m];
        const avg  = scores.length ? Math.round(scores.reduce((a, b) => a+b, 0) / scores.length) : null;
        const [c1, c2] = avg ? scoreGrad(avg) : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'];
        return (
          <div key={m} style={{
            flex: '1 1 80px',
            background: avg ? `linear-gradient(135deg, ${c1}33, ${c2}22)` : 'rgba(255,255,255,0.03)',
            border: `1px solid ${avg ? scoreColor(avg)+'40' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.3rem' }}>{m}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: avg ? scoreColor(avg) : 'rgba(255,255,255,0.18)' }}>{avg ?? '—'}</div>
            <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>{scores.length} session{scores.length !== 1 ? 's' : ''}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CARD STYLE
// ─────────────────────────────────────────────────────────────────────────────
const cardStyle = (extra = {}) => ({
  background: 'linear-gradient(135deg, rgba(30,41,59,0.85), rgba(15,23,42,0.65))',
  border: '1px solid rgba(59,130,246,0.14)',
  borderRadius: '1rem',
  padding: '1.5rem',
  backdropFilter: 'blur(8px)',
  ...extra,
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function ProgressDashboard() {
  const [, navigate]      = useLocation();
  const userId            = localStorage.getItem('userId');
  const [activeTab, setActiveTab] = useState('overview');
  const [hoveredRow, setHoveredRow] = useState(null);

  useEffect(() => {
    if (!userId) navigate('/login');
  }, [userId, navigate]);

  const improvement  = CURRENT.score - SESSIONS[0].score;
  const last3Avg     = Math.round(SESSIONS.slice(-3).reduce((s, x) => s + x.score, 0) / 3);

  const TABS = [
    { id: 'overview', label: '📊 Overview'  },
    { id: 'timeline', label: '📈 Timeline'  },
    { id: 'skills',   label: '🎯 Skills'    },
    { id: 'deepdive', label: '🔬 Deep Dive' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #09101f 0%, #0f172a 45%, #180d2e 100%)',
      color: '#f1f5f9', minHeight: '100vh', padding: '1.5rem 1rem',
      fontFamily: 'system-ui,-apple-system,sans-serif',
    }}>
      {/* Background glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-8%',  width: '480px', height: '480px', background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-8%', width: '580px', height: '580px', background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

        {/* BACK */}
        <div style={{ marginBottom: '1.25rem' }}>
          <button onClick={() => navigate('/start')} style={{
            padding: '0.5rem 1.1rem', background: 'rgba(59,130,246,0.1)', color: '#60a5fa',
            border: '1px solid rgba(59,130,246,0.25)', borderRadius: '0.5rem',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
          }}>← Back to Home</button>
        </div>

        {/* HEADER */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.14), rgba(59,130,246,0.09))',
          border: '1px solid rgba(168,85,247,0.28)', borderRadius: '1.25rem',
          padding: '1.75rem 2rem', marginBottom: '2rem',
          boxShadow: '0 8px 32px rgba(168,85,247,0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
            <div>
              <h1 style={{
                fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem',
                background: 'linear-gradient(135deg, #e0d7ff, #a855f7)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>📊 Interview Progress Dashboard</h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                Welcome back, <strong style={{ color: '#e0d7ff' }}>{HARDCODED_USER.name}</strong> — targeting <strong style={{ color: '#a855f7' }}>{HARDCODED_USER.role}</strong> roles
              </p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                Tracking 4 dimensions: Communication · Technical Depth · Structure · Confidence
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, auto)', gap: '0.75rem' }}>
              {[
                { label: 'Sessions',    val: SESSIONS.length, icon: '🎤' },
                { label: 'Avg Score',   val: AVG,             icon: '📈' },
                { label: 'Best Score',  val: BEST,            icon: '🏅' },
                { label: 'Improved',    val: `+${improvement}`, icon: '⬆️' },
              ].map(({ label, val, icon }) => (
                <div key={label} style={{
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0.75rem', padding: '0.75rem 1rem', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '1.25rem' }}>{icon}</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7' }}>{val}</div>
                  <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.38)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TAB BAR */}
        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '0.7rem 1.4rem',
              background:   activeTab === t.id ? 'rgba(168,85,247,0.14)' : 'transparent',
              color:        activeTab === t.id ? '#c084fc' : 'rgba(255,255,255,0.45)',
              border: 'none',
              borderBottom: activeTab === t.id ? '2px solid #a855f7' : '2px solid transparent',
              cursor: 'pointer', fontWeight: activeTab === t.id ? 700 : 500,
              fontSize: '0.95rem', transition: 'all 0.22s', borderRadius: '0.5rem 0.5rem 0 0',
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════════════════════════════
            OVERVIEW
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Circular gauges */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1.75rem', color: '#c084fc' }}>
                🎯 Current Dimension Scores — Session 12 (Latest)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '2rem', justifyItems: 'center' }}>
                <CircularGauge label="Communication"   value={SKILLS_NOW.comm}   />
                <CircularGauge label="Technical Depth" value={SKILLS_NOW.tech}   />
                <CircularGauge label="Structure"       value={SKILLS_NOW.struct} />
                <CircularGauge label="Confidence"      value={SKILLS_NOW.conf}   />
                <CircularGauge label="Overall Score"   value={CURRENT.score}  size={140} />
              </div>
            </div>

            {/* KPI cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Total Interviews', value: SESSIONS.length, suffix: ' sessions', icon: '🎤',  trend: '+4 this month' },
                { label: 'Overall Average',  value: AVG,             suffix: ' / 100',    icon: '📈',  trend: `↑ +${improvement} since start` },
                { label: 'Personal Best',    value: BEST,            suffix: ' / 100',    icon: '🏅',  trend: 'Session 12' },
                { label: 'Last 3 Avg',       value: last3Avg,        suffix: ' / 100',    icon: '🔥',  trend: '🔥 On a hot streak!' },
                { label: 'Practice Streak',  value: STREAK,          suffix: ' sessions', icon: '⚡',  trend: 'Keep going!' },
                { label: 'Target Score',     value: HARDCODED_USER.target, suffix: ' / 100', icon: '🎯', trend: `${HARDCODED_USER.target - CURRENT.score} pts to goal` },
              ].map(({ label, value, suffix, icon, trend }) => (
                <div key={label}
                  style={{ ...cardStyle({ padding: '1.2rem', textAlign: 'center', cursor: 'default', transition: 'transform 0.2s, box-shadow 0.2s' }) }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(168,85,247,0.15)'; }}
                  onMouseOut={e  => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>{icon}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginBottom: '0.4rem' }}>{label}</div>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#a855f7' }}>
                    {value}<span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>{suffix}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#10b981', marginTop: '0.3rem' }}>{trend}</div>
                </div>
              ))}
            </div>

            {/* Trend chart + radar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
              <div style={cardStyle()}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#c084fc' }}>📈 Score Trend (All Sessions)</h3>
                <MultiLineChart sessions={SESSIONS} height={230} />
              </div>
              <div style={{ ...cardStyle(), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#c084fc', alignSelf: 'flex-start' }}>🕸️ Skill Radar</h3>
                <RadarChart data={SKILLS_NOW} benchmark={SKILLS_BENCH} size={280} />
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '16px', height: '3px', background: '#a855f7', borderRadius: '2px' }} />
                    <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.55)' }}>You</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ width: '16px', height: '0', borderTop: '2px dashed rgba(99,102,241,0.6)' }} />
                    <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.55)' }}>SDE Benchmark</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#c084fc' }}>🚀 Quick Actions</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '0.75rem' }}>
                {[
                  { label: '🎤 Mock Interview', sub: 'SDE Full Round',  to: '/agent',         c: '#a855f7' },
                  { label: '💬 AI Chatbot',      sub: 'Q&A Practice',   to: '/chatbot',       c: '#06b6d4' },
                  { label: '📄 Resume Scan',     sub: 'ATS Scoring',    to: '/resume-parse',  c: '#10b981' },
                  { label: '💻 Code Practice',   sub: 'DSA Problems',   to: '/code-practice', c: '#f59e0b' },
                ].map(({ label, sub, to, c }) => (
                  <button key={label} onClick={() => navigate(to)} style={{
                    padding: '1rem', background: `${c}18`,
                    border: `1px solid ${c}33`, borderRadius: '0.75rem',
                    color: c, fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                    textAlign: 'left', transition: 'all 0.2s',
                  }}
                  onMouseOver={e => { e.currentTarget.style.background = `${c}28`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={e  => { e.currentTarget.style.background = `${c}18`; e.currentTarget.style.transform = ''; }}>
                    {label}<br /><span style={{ fontSize: '0.73rem', color: 'rgba(255,255,255,0.45)', fontWeight: 400 }}>{sub}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TIMELINE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'timeline' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Full chart */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#c084fc' }}>
                📈 All 12 Sessions — Score Progression by Dimension
              </h3>
              <MultiLineChart sessions={SESSIONS} height={290} />
            </div>

            {/* Monthly heatmap */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: '#c084fc' }}>📅 Monthly Average Scores</h3>
              <SessionHeatmap sessions={SESSIONS} />
            </div>

            {/* Session table */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(15,23,42,0.92), rgba(30,41,59,0.75))',
              border: '1px solid rgba(168,85,247,0.2)', borderRadius: '1rem', overflow: 'hidden',
            }}>
              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#c084fc' }}>
                  📋 Complete Session History ({SESSIONS.length} sessions)
                </h3>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.87rem' }}>
                  <thead>
                    <tr style={{ background: 'rgba(168,85,247,0.08)', borderBottom: '1px solid rgba(168,85,247,0.12)' }}>
                      {['#', 'Date', 'Topic', 'Type', 'Dur', 'Comm', 'Tech', 'Struct', 'Conf', 'Overall'].map(h => (
                        <th key={h} style={{ padding: '0.85rem 0.7rem', textAlign: h === '#' ? 'center' : 'left', color: '#c084fc', fontWeight: 700, fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...SESSIONS].reverse().map((s, idx) => {
                      const isHov = hoveredRow === s.id;
                      return (
                        <tr key={s.id}
                          onMouseOver={() => setHoveredRow(s.id)}
                          onMouseOut={() => setHoveredRow(null)}
                          style={{
                            background: isHov ? 'rgba(168,85,247,0.09)' : idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.18s',
                          }}>
                          <td style={{ padding: '0.8rem 0.7rem', textAlign: 'center', color: 'rgba(255,255,255,0.28)', fontSize: '0.78rem' }}>{SESSIONS.length - idx}</td>
                          <td style={{ padding: '0.8rem 0.7rem', color: '#fff', fontWeight: 500, whiteSpace: 'nowrap' }}>
                            {new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', color: 'rgba(255,255,255,0.72)' }}>{s.topic}</td>
                          <td style={{ padding: '0.8rem 0.7rem' }}>
                            <span style={{
                              padding: '0.18rem 0.55rem', borderRadius: '999px', fontSize: '0.73rem', fontWeight: 600,
                              background: s.type === 'Virtual Agent' ? 'rgba(168,85,247,0.2)' : 'rgba(6,182,212,0.2)',
                              color:      s.type === 'Virtual Agent' ? '#c084fc' : '#06b6d4',
                            }}>{s.type === 'Virtual Agent' ? '🤖 Agent' : '💬 Chat'}</span>
                          </td>
                          <td style={{ padding: '0.8rem 0.7rem', color: 'rgba(255,255,255,0.55)' }}>{s.duration}m</td>
                          {[s.comm, s.tech, s.struct, s.conf].map((v, i) => (
                            <td key={i} style={{ padding: '0.8rem 0.7rem' }}>
                              <span style={{ color: scoreColor(v), fontWeight: 700 }}>{v}</span>
                            </td>
                          ))}
                          <td style={{ padding: '0.8rem 0.7rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{
                                padding: '0.28rem 0.65rem', borderRadius: '0.4rem',
                                background: `${scoreColor(s.score)}22`, color: scoreColor(s.score),
                                fontWeight: 800, fontSize: '0.9rem',
                              }}>{s.score}</span>
                              <Sparkline
                                data={SESSIONS.slice(0, SESSIONS.findIndex(x => x.id === s.id) + 1).map(x => x.score)}
                                color={scoreColor(s.score)} w={48} h={22} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            SKILLS
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'skills' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Radar + comparison */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
              <div style={{ ...cardStyle(), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem', color: '#c084fc', alignSelf: 'flex-start' }}>
                  🕸️ You vs SDE Benchmark
                </h3>
                <RadarChart data={SKILLS_NOW} benchmark={SKILLS_BENCH} size={310} />
                <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '18px', height: '3px', background: '#a855f7', borderRadius: '2px' }} />
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>Your Skills</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '18px', height: '0', borderTop: '2px dashed rgba(99,102,241,0.65)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.55)' }}>SDE Target</span>
                  </div>
                </div>
              </div>

              <div style={cardStyle()}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#c084fc' }}>📊 Dimension vs Target</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.6rem' }}>
                  {[
                    { label: 'Communication',    you: SKILLS_NOW.comm,   target: SKILLS_BENCH.comm   },
                    { label: 'Technical Depth',  you: SKILLS_NOW.tech,   target: SKILLS_BENCH.tech   },
                    { label: 'Structure',        you: SKILLS_NOW.struct, target: SKILLS_BENCH.struct },
                    { label: 'Confidence',       you: SKILLS_NOW.conf,   target: SKILLS_BENCH.conf   },
                  ].map(({ label, you, target }) => {
                    const [c] = scoreGrad(you);
                    const gap = target - you;
                    return (
                      <div key={label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{label}</span>
                          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.88rem', color: scoreColor(you), fontWeight: 800 }}>You: {you}</span>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.38)' }}>Target: {target}</span>
                            {gap > 0
                              ? <span style={{ fontSize: '0.73rem', color: '#f59e0b', background: 'rgba(245,158,11,0.14)', padding: '0.12rem 0.38rem', borderRadius: '4px' }}>−{gap}</span>
                              : <span style={{ fontSize: '0.73rem', color: '#10b981', background: 'rgba(16,185,129,0.14)', padding: '0.12rem 0.38rem', borderRadius: '4px' }}>✓ Met</span>
                            }
                          </div>
                        </div>
                        <AnimBar value={you} color={c} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Per-dimension sparkline cards */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', color: '#c084fc' }}>
                📉 Dimension Trends — All 12 Sessions
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem' }}>
                {[
                  { label: 'Communication',   key: 'comm',   color: '#3b82f6' },
                  { label: 'Technical Depth', key: 'tech',   color: '#06b6d4' },
                  { label: 'Structure',       key: 'struct', color: '#a855f7' },
                  { label: 'Confidence',      key: 'conf',   color: '#10b981' },
                ].map(({ label, key, color }) => {
                  const vals  = SESSIONS.map(s => s[key]);
                  const first = vals[0], last = vals[vals.length - 1];
                  return (
                    <div key={key} style={{
                      background: `${color}0e`, border: `1px solid ${color}22`,
                      borderRadius: '0.85rem', padding: '1.1rem',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{label}</span>
                        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>↑ +{last - first}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.85rem' }}>
                        <div>
                          <div style={{ fontSize: '1.9rem', fontWeight: 900, color, lineHeight: 1 }}>{last}</div>
                          <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.2rem' }}>current</div>
                        </div>
                        <Sparkline data={vals} color={color} w={100} h={42} />
                      </div>
                      <div style={{ marginTop: '0.75rem' }}>
                        <AnimBar value={last} color={color} height={8} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.45rem', fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>
                        <span>Start: {first}</span><span>Best: {Math.max(...vals)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Full multi-line chart */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#c084fc' }}>📊 Overall Score Progression</h3>
              <MultiLineChart sessions={SESSIONS} height={270} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            DEEP DIVE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === 'deepdive' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* AI Insight banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(239,68,68,0.07))',
              border: '1.5px solid rgba(245,158,11,0.35)', borderRadius: '1rem', padding: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ fontSize: '2rem', flexShrink: 0 }}>🔍</div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fbbf24', marginBottom: '0.5rem' }}>AI Insight of the Week</h3>
                  <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.65', fontSize: '0.95rem' }}>
                    You've improved <strong style={{ color: '#fbbf24' }}>+22 points</strong> overall across 6 months — remarkable consistency.
                    <strong style={{ color: '#fbbf24' }}> Technical Depth</strong> had the biggest jump (+27 pts), especially after Session 9 (System Design HLD).
                    Your current gap vs SDE benchmark is largest in <strong style={{ color: '#f87171' }}>Technical Depth (−3)</strong> and <strong style={{ color: '#f87171' }}>DP coverage (55%)</strong>.
                    Focus the next 2 sessions on <em>caching strategies, database sharding, and DP pattern recognition</em> to hit all targets.
                  </p>
                </div>
              </div>
            </div>

            {/* Topic coverage + dimension deep dive */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>

              <div style={cardStyle()}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#c084fc' }}>📚 Topic Coverage</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
                  {TOPIC_COVERAGE.map(({ name, pct }) => {
                    const [c] = scoreGrad(pct);
                    return (
                      <div key={name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                          <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{name}</span>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, padding: '0.12rem 0.45rem', borderRadius: '4px', background: `${c}22`, color: c }}>{pct}%</span>
                        </div>
                        <AnimBar value={pct} color={c} height={9} />
                      </div>
                    );
                  })}
                </div>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.32)', marginTop: '1rem' }}>
                  💡 Database Design (40%) and DP (55%) need the most attention
                </p>
              </div>

              <div style={cardStyle()}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: '#c084fc' }}>🧠 Dimension Deep Dive</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                  {[
                    { dim: 'Communication',   score: SKILLS_NOW.comm,   bench: SKILLS_BENCH.comm,   detail: 'Clarity 87 · Fluency 80 · Listening 79',        color: '#3b82f6' },
                    { dim: 'Technical Depth', score: SKILLS_NOW.tech,   bench: SKILLS_BENCH.tech,   detail: 'Accuracy 88 · Optimization 82 · Breadth 84',     color: '#06b6d4' },
                    { dim: 'Structure',       score: SKILLS_NOW.struct, bench: SKILLS_BENCH.struct, detail: 'STAR format 90 · Intro 85 · Wrap-up 80',          color: '#a855f7' },
                    { dim: 'Confidence',      score: SKILLS_NOW.conf,   bench: SKILLS_BENCH.conf,   detail: 'Tone 85 · Pacing 82 · Delivery 84',              color: '#10b981' },
                  ].map(({ dim, score, bench, detail, color }) => {
                    const gap = bench - score;
                    return (
                      <div key={dim} style={{
                        background: `${color}0d`, border: `1px solid ${color}20`,
                        borderRadius: '0.7rem', padding: '0.95rem',
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', color }}>{dim}</span>
                          <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center' }}>
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color }}>{score}</span>
                            {gap > 0
                              ? <span style={{ fontSize: '0.7rem', color: '#f59e0b', background: 'rgba(245,158,11,0.14)', padding: '0.1rem 0.32rem', borderRadius: '3px' }}>−{gap} to target</span>
                              : <span style={{ fontSize: '0.7rem', color: '#10b981', background: 'rgba(16,185,129,0.14)', padding: '0.1rem 0.32rem', borderRadius: '3px' }}>✓ Target met</span>
                            }
                          </div>
                        </div>
                        <AnimBar value={score} color={color} height={8} />
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.32)', marginTop: '0.5rem' }}>{detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '1.5rem' }}>
              <div style={{ ...cardStyle({ border: '1px solid rgba(16,185,129,0.2)' }) }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#10b981' }}>✅ Top Strengths</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {STRENGTHS.map((s, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.12)',
                      borderRadius: '0.6rem', padding: '0.75rem',
                    }}>
                      <span style={{ color: '#10b981', flexShrink: 0, marginTop: '1px' }}>✨</span>
                      <span style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.45' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ ...cardStyle({ border: '1px solid rgba(239,68,68,0.2)' }) }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#f87171' }}>⚡ Areas to Improve</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                  {WEAKNESSES.map((w, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                      background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)',
                      borderRadius: '0.6rem', padding: '0.75rem',
                    }}>
                      <span style={{ color: '#f87171', flexShrink: 0, marginTop: '1px' }}>⚡</span>
                      <span style={{ fontSize: '0.87rem', color: 'rgba(255,255,255,0.8)', lineHeight: '1.45' }}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Day-of-week heatmap */}
            <div style={cardStyle()}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#c084fc' }}>
                📅 Practice Pattern — Avg Score by Day of Week
              </h3>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day, di) => {
                  const daySessions = SESSIONS.filter(s => new Date(s.date).getDay() === di);
                  const avg = daySessions.length ? Math.round(daySessions.reduce((a,b) => a + b.score, 0) / daySessions.length) : null;
                  const [c1, c2] = avg ? scoreGrad(avg) : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)'];
                  return (
                    <div key={day} style={{
                      flex: '1 1 68px',
                      background: avg ? `linear-gradient(135deg, ${c1}28, ${c2}18)` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${avg ? scoreColor(avg)+'35' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '0.75rem', padding: '0.85rem', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.42)', marginBottom: '0.3rem' }}>{day}</div>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: avg ? scoreColor(avg) : 'rgba(255,255,255,0.15)' }}>{avg ?? '—'}</div>
                      <div style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.28)', marginTop: '0.2rem' }}>{daySessions.length} session{daySessions.length !== 1 ? 's' : ''}</div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.32)', marginTop: '1rem' }}>
                💡 You perform best on <strong style={{ color: '#a855f7' }}>weekends</strong>. Try adding a midweek Thursday session to improve consistency.
              </p>
            </div>

            {/* Recommended next action */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.14), rgba(168,85,247,0.08))',
              border: '1.5px solid rgba(59,130,246,0.3)', borderRadius: '1rem', padding: '1.5rem',
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.75rem' }}>🎯 Recommended Next Action</h3>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: '1.65', marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                Based on your last 3 sessions, <strong style={{ color: '#a855f7' }}>Technical Depth</strong> is 3 points below the SDE benchmark.
                Run a focused <strong style={{ color: '#60a5fa' }}>30-min System Design + DP mock session</strong> next.
                You're at 84/90 — just one strong session away from hitting your personal target!
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => navigate('/agent')} style={{
                  padding: '0.7rem 1.4rem',
                  background: 'linear-gradient(135deg, #a855f7, #6366f1)',
                  color: 'white', border: 'none', borderRadius: '0.5rem',
                  fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem',
                  boxShadow: '0 4px 14px rgba(168,85,247,0.35)',
                }}>🎤 Start Mock Interview</button>
                <button onClick={() => navigate('/chatbot')} style={{
                  padding: '0.7rem 1.4rem', background: 'transparent',
                  color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)',
                  borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}>💬 System Design Q&A</button>
                <button onClick={() => navigate('/code-practice')} style={{
                  padding: '0.7rem 1.4rem', background: 'transparent',
                  color: '#06b6d4', border: '1px solid rgba(6,182,212,0.4)',
                  borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
                }}>💻 DP Problems</button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
