import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'wouter';
import { RESUME_API_URL } from '../config';

// ─── Shared UI primitives ────────────────────────────────────────────────────

function GlassCard({ children, style = {} }) {
  return (
    <div style={{
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(24px)',
      border: '1px solid rgba(44, 154, 255, 0.1)',
      borderRadius: '1.25rem',
      padding: '1.5rem',
      ...style
    }}>
      {children}
    </div>
  );
}

function SectionHeader({ phase, title, subtitle }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.18em', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
        {phase}
      </div>
      <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff', margin: 0 }}>{title}</h2>
      {subtitle && <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0 0', fontSize: '0.88rem' }}>{subtitle}</p>}
    </div>
  );
}

function ScoreGauge({ label, value = 0, color = '#2c9aff', size = 'normal' }) {
  const pct = Math.min(Math.max(value, 0), 100);
  const r = 45;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const isHero = size === 'hero';
  const px = isHero ? 130 : 96;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: px, height: px }}>
        <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r} fill="none"
            stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${color})`, transition: 'stroke-dasharray 1.5s ease-out' }}
          />
        </svg>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <div style={{ fontSize: isHero ? '1.4rem' : '1rem', fontWeight: 800, color: '#fff' }}>{Math.round(pct)}%</div>
        </div>
      </div>
      <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>
        {label}
      </div>
    </div>
  );
}

function RoleBar({ role, score = 0 }) {
  const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: '0.875rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{role}</span>
        <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}>{Math.round(score)}%</span>
      </div>
      <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${score}%`, background: color,
          borderRadius: '3px', transition: 'width 1.5s ease-out',
          boxShadow: `0 0 6px ${color}`
        }} />
      </div>
    </div>
  );
}

function Divider() {
  return (
    <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(44,154,255,0.2), transparent)', margin: '2.5rem 0' }} />
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: '0.25rem',
      background: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(44, 154, 255, 0.1)',
      borderRadius: '0.75rem', padding: '0.3rem',
      width: 'fit-content'
    }}>
      {tabs.map(({ id, label }) => (
        <button
          key={id} onClick={() => onChange(id)}
          style={{
            padding: '0.55rem 1.2rem', borderRadius: '0.5rem', border: 'none',
            background: active === id ? 'rgba(44, 154, 255, 0.2)' : 'transparent',
            color: active === id ? 'var(--accent)' : 'var(--text-secondary)',
            fontWeight: active === id ? 700 : 500,
            cursor: 'pointer', fontSize: '0.88rem', transition: 'all 0.2s'
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function ResumeAnalyzerPage() {
  const [, navigate] = useLocation();

  // Tab state
  const [activeTab, setActiveTab] = useState('analyze');
  const [resourceTab, setResourceTab] = useState('courses');

  // Upload state
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  // Resources state
  const [courses, setCourses] = useState({});
  const [videos, setVideos] = useState({});
  const [guides, setGuides] = useState({});
  const [tips, setTips] = useState({ do: [], dont: [] });
  const [resourcesLoaded, setResourcesLoaded] = useState(false);

  // Admin state
  const [adminToken, setAdminToken] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoginError, setAdminLoginError] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [resumeRecords, setResumeRecords] = useState([]);
  const [adminError, setAdminError] = useState(null);
  const [filterEmail, setFilterEmail] = useState('');

  // User from localStorage
  const userId   = localStorage.getItem('userId')    || '';
  const userName = localStorage.getItem('userName')  || 'Professional Candidate';
  const userEmail = localStorage.getItem('userEmail') || '';
  const isVerified = !!userId && !userId.startsWith('guest');

  // ── Resources loading ──────────────────────────────────────────────────────

  useEffect(() => {
    if (activeTab === 'resources' && !resourcesLoaded) {
      loadResources();
    }
  }, [activeTab]);

  async function loadResources() {
    try {
      const [c, v, g, t] = await Promise.all([
        fetch(`${RESUME_API_URL}/courses`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`${RESUME_API_URL}/videos`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`${RESUME_API_URL}/guides`).then(r => r.ok ? r.json() : {}).catch(() => ({})),
        fetch(`${RESUME_API_URL}/tips`).then(r => r.ok ? r.json() : { do: [], dont: [] }).catch(() => ({ do: [], dont: [] })),
      ]);
      setCourses(c);
      setVideos(v);
      setGuides(g);
      setTips(t);
      setResourcesLoaded(true);
    } catch (e) {
      console.error('Failed to load resources:', e);
    }
  }

  // ── Admin ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (adminToken) loadAdminData();
  }, [adminToken]);

  const loadAdminData = useCallback(async () => {
    setAdminLoading(true);
    setAdminError(null);
    try {
      const headers = { Authorization: `Bearer ${adminToken}` };
      const [aRes, rRes] = await Promise.all([
        fetch(`${RESUME_API_URL}/admin/analytics`, { headers }),
        fetch(`${RESUME_API_URL}/admin/resumes?limit=100`, { headers }),
      ]);
      if (aRes.status === 401 || rRes.status === 401) {
        setAdminToken(null);
        setAdminError('Session expired. Please log in again.');
        return;
      }
      setAnalytics(await aRes.json());
      const rData = await rRes.json();
      setResumeRecords(rData.resumes || []);
    } catch (e) {
      setAdminError('Failed to load admin data. Ensure the Resume API server is running.');
    } finally {
      setAdminLoading(false);
    }
  }, [adminToken]);

  async function handleAdminLogin(e) {
    e.preventDefault();
    setAdminLoginError(null);
    setAdminLoading(true);
    try {
      const res = await fetch(`${RESUME_API_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      if (res.ok) {
        const data = await res.json();
        setAdminToken(data.access_token);
      } else {
        setAdminLoginError('Invalid credentials');
      }
    } catch {
      setAdminLoginError('Connection error — ensure the Resume API is running on port 8000');
    } finally {
      setAdminLoading(false);
    }
  }

  async function handleExportCSV() {
    try {
      const res = await fetch(`${RESUME_API_URL}/admin/export-csv`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `resumes_export_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Export failed:', e);
    }
  }

  // ── Upload & analysis ──────────────────────────────────────────────────────

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  }, []);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('user_name', userName);
      fd.append('email', userEmail || 'guest@example.com');
      fd.append('phone', 'Not Provided');
      if (userId) fd.append('user_id', userId);

      const res = await fetch(`${RESUME_API_URL}/upload-resume`, { method: 'POST', body: fd });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      setAnalysisResult(data.analysis);
    } catch (e) {
      setUploadError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  function resetAnalysis() {
    setAnalysisResult(null);
    setFile(null);
    setUploadError(null);
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Page header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <h1 style={{
              fontSize: '2rem', fontWeight: 900, margin: 0,
              background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              AI Resume Analyzer
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0', fontSize: '0.88rem' }}>
              Advanced NLP-powered analysis to optimize your professional profile
            </p>
          </div>
          <button
            onClick={() => navigate('/start')}
            style={{
              padding: '0.55rem 1.1rem', background: 'rgba(44,154,255,0.08)',
              border: '1px solid rgba(44,154,255,0.2)', borderRadius: '0.5rem',
              color: 'var(--accent)', fontWeight: 600, cursor: 'pointer', fontSize: '0.83rem',
              transition: 'all 0.2s', flexShrink: 0, marginTop: '0.25rem'
            }}
          >
            ← Back to Tools
          </button>
        </div>

        {/* Top-level tab bar */}
        <div style={{ marginBottom: '2rem' }}>
          <TabBar
            tabs={[{ id: 'analyze', label: 'Analyze Resume' }, { id: 'resources', label: 'Resources' }, { id: 'admin', label: 'Admin' }]}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            TAB: ANALYZE
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analyze' && (
          <>
            {!analysisResult ? (
              /* ── Upload form ── */
              <GlassCard>
                {/* User identity card */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.875rem 1.125rem',
                  background: 'rgba(44,154,255,0.04)',
                  border: '1px solid rgba(44,154,255,0.1)',
                  borderRadius: '0.75rem', marginBottom: '2rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                    <div style={{
                      width: '40px', height: '40px',
                      background: 'rgba(44,154,255,0.12)',
                      border: '1px solid rgba(44,154,255,0.25)',
                      borderRadius: '10px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.1rem'
                    }}>👤</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>{userName}</div>
                      {userEmail && <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{userEmail}</div>}
                    </div>
                  </div>
                  <div style={{
                    padding: '0.28rem 0.75rem', borderRadius: '6px',
                    fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em',
                    border: `1px solid ${isVerified ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    background: isVerified ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                    color: isVerified ? '#10b981' : '#ef4444'
                  }}>
                    {isVerified ? 'VERIFIED' : 'GUEST'}
                  </div>
                </div>

                {/* Drop zone */}
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: `2px dashed ${dragging ? 'var(--accent)' : 'rgba(44,154,255,0.25)'}`,
                    borderRadius: '1rem', padding: '3.5rem 2rem',
                    textAlign: 'center', cursor: 'pointer',
                    background: dragging ? 'rgba(44,154,255,0.04)' : 'transparent',
                    transition: 'all 0.2s', marginBottom: '1.5rem'
                  }}
                >
                  <input
                    ref={fileInputRef} type="file" accept=".pdf,.docx,.doc"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    style={{ display: 'none' }}
                  />
                  <div style={{ fontSize: '2.75rem', marginBottom: '0.875rem' }}>📤</div>
                  <div style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>
                    Drop your resume here or click to browse
                  </div>
                  <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>
                    Supports PDF and DOCX — max 10 MB
                  </div>
                </div>

                {/* Selected file */}
                {file && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.875rem 1.125rem',
                    background: 'rgba(16,185,129,0.04)',
                    border: '1px dashed rgba(16,185,129,0.3)',
                    borderRadius: '0.75rem', marginBottom: '1.5rem'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.88rem' }}>{file.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB — Ready for analysis
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setFile(null); }}
                      style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1, padding: '0.25rem' }}
                    >✕</button>
                  </div>
                )}

                {/* Error */}
                {uploadError && (
                  <div style={{
                    padding: '0.875rem 1.125rem',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    borderRadius: '0.75rem', color: '#fca5a5',
                    marginBottom: '1rem', fontSize: '0.88rem'
                  }}>
                    ✗ {uploadError}
                  </div>
                )}

                {/* Submit */}
                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  style={{
                    width: '100%', padding: '1rem',
                    borderRadius: '0.75rem', border: 'none',
                    background: file && !uploading
                      ? 'linear-gradient(90deg, var(--accent), var(--accent-2))'
                      : 'rgba(44,154,255,0.15)',
                    color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                    cursor: file && !uploading ? 'pointer' : 'not-allowed',
                    letterSpacing: '0.04em',
                    boxShadow: file && !uploading ? '0 0 20px rgba(44,154,255,0.25)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {uploading ? '🔄  Analyzing your resume…' : 'START RESUME ANALYSIS'}
                </button>

                {/* Footer badges */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1.5rem' }}>
                  {[['🔒', 'Encrypted'], ['⚡', 'AI-Powered'], ['📊', '5 Dimensions']].map(([icon, label]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                      {icon} {label}
                    </div>
                  ))}
                </div>
              </GlassCard>
            ) : (
              /* ── Analysis results ── */
              <>
                {/* Results toolbar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    Analysis complete for&nbsp;<span style={{ color: '#fff', fontWeight: 700 }}>{file?.name || 'your resume'}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.625rem' }}>
                    <button onClick={() => setActiveTab('resources')} style={smallBtn('#2c9aff')}>View Resources</button>
                    <button onClick={resetAnalysis} style={smallBtn('rgba(255,255,255,0.35)')}>Analyze Another</button>
                  </div>
                </div>

                {/* ── PHASE 01: EXECUTIVE INTELLIGENCE ── */}
                <SectionHeader phase="PHASE 01" title="Executive Intelligence" subtitle="Strategic performance metrics across all dimensions" />

                {/* Overall score hero */}
                <GlassCard style={{ marginBottom: '1.25rem', background: 'linear-gradient(135deg, rgba(44,154,255,0.07) 0%, rgba(0,224,255,0.03) 100%)', borderColor: 'rgba(44,154,255,0.18)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
                    <ScoreGauge label="Overall Score" value={analysisResult?.scores?.overall_score ?? 0} color="var(--accent)" size="hero" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                        OVERALL MARKET QUOTIENT
                      </div>
                      <p style={{ color: '#e2e8f0', fontSize: '0.95rem', lineHeight: 1.7, margin: 0 }}>
                        {analysisResult?.overall_strategy || 'Comprehensive market alignment based on semantic matching against industry benchmarks.'}
                      </p>
                    </div>
                  </div>
                </GlassCard>

                {/* Sub-score grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Skills Match',  key: 'skills_score',      color: '#10b981' },
                    { label: 'Experience',    key: 'experience_score',   color: '#818cf8' },
                    { label: 'Education',     key: 'education_score',    color: '#f59e0b' },
                    { label: 'Formatting',    key: 'formatting_score',   color: '#22d3ee' },
                  ].map(({ label, key, color }) => (
                    <GlassCard key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 1rem' }}>
                      <ScoreGauge label={label} value={analysisResult?.scores?.[key] ?? 0} color={color} />
                    </GlassCard>
                  ))}
                </div>

                <Divider />

                {/* ── PHASE 02: OPTIMIZATION PROTOCOL ── */}
                <SectionHeader phase="PHASE 02" title="Optimization Protocol" subtitle="Critical adjustments and ATS compliance standards" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  {/* Priority changes */}
                  <GlassCard>
                    <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⚠️ Priority Adjustments</div>
                    {(analysisResult?.priority_changes || []).slice(0, 4).map((item, i) => {
                      const text = typeof item === 'object' ? item.change : item;
                      const why  = typeof item === 'object' ? item.why   : null;
                      const how  = typeof item === 'object' ? item.how   : null;
                      return (
                        <div key={i} style={{ padding: '0.875rem', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.14)', borderRadius: '0.75rem', marginBottom: '0.625rem' }}>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.88rem', marginBottom: why || how ? '0.4rem' : 0 }}>{text}</div>
                          {why && <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}><b>WHY:</b> {why}</div>}
                          {how && <div style={{ color: '#22d3ee', fontSize: '0.78rem', marginTop: '0.2rem' }}><b>HOW:</b> {how}</div>}
                        </div>
                      );
                    })}
                    {!(analysisResult?.priority_changes?.length) && <EmptyMsg>No priority changes identified.</EmptyMsg>}
                  </GlassCard>

                  {/* ATS tips */}
                  <GlassCard>
                    <div style={{ color: '#22d3ee', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>⚙️ ATS & Compliance</div>
                    {(analysisResult?.ats_optimization || []).slice(0, 4).map((tip, i) => (
                      <div key={i} style={{ display: 'flex', gap: '0.875rem', marginBottom: '0.875rem', padding: '0.75rem', background: 'rgba(34,211,238,0.03)', borderRadius: '0.625rem' }}>
                        <div style={{ color: '#22d3ee', fontWeight: 800, minWidth: '22px', fontSize: '0.9rem' }}>0{i + 1}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>{tip}</div>
                      </div>
                    ))}
                    {!(analysisResult?.ats_optimization?.length) && <EmptyMsg>No ATS optimizations identified.</EmptyMsg>}
                  </GlassCard>
                </div>

                {/* Quick wins */}
                {!!(analysisResult?.quick_wins?.length) && (
                  <GlassCard style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '0.875rem' }}>⚡ Quick Wins</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                      {analysisResult.quick_wins.map((w, i) => {
                        const text   = typeof w === 'object' ? (w.improvement ?? w.change ?? JSON.stringify(w)) : w;
                        const impact = typeof w === 'object' ? w.impact : null;
                        return (
                          <div key={i} style={{ padding: '0.65rem 0.9rem', background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.18)', borderRadius: '0.5rem' }}>
                            <div style={{ color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>{text}</div>
                            {impact && <div style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{impact}</div>}
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                )}

                <Divider />

                {/* ── PHASE 03: PROFESSIONAL ASSETS ── */}
                <SectionHeader phase="PHASE 03" title="Professional Assets" subtitle="Verified strengths and quantifiable impact metrics" />
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  <GlassCard>
                    <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '1rem' }}>💎 Core Strengths</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                      {(analysisResult?.strengths || []).slice(0, 6).map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.75rem', background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)', borderRadius: '0.625rem' }}>
                          <div style={{ color: '#10b981', fontWeight: 900, fontSize: '0.75rem', background: 'rgba(16,185,129,0.1)', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</div>
                          <div style={{ color: '#fff', fontSize: '0.83rem' }}>{s}</div>
                        </div>
                      ))}
                      {!(analysisResult?.strengths?.length) && <EmptyMsg>No strengths identified.</EmptyMsg>}
                    </div>
                  </GlassCard>
                  <GlassCard>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '1rem' }}>📈 Metrics to Add</div>
                    {(analysisResult?.metrics_to_add || []).slice(0, 4).map((m, i) => (
                      <div key={i} style={{ padding: '0.75rem', background: 'rgba(44,154,255,0.04)', border: '1px solid rgba(44,154,255,0.1)', borderRadius: '0.625rem', marginBottom: '0.625rem', color: '#fff', fontSize: '0.83rem', lineHeight: 1.5 }}>{m}</div>
                    ))}
                    {!(analysisResult?.metrics_to_add?.length) && <EmptyMsg>No metric suggestions.</EmptyMsg>}
                  </GlassCard>
                </div>

                {/* Weaknesses */}
                {!!(analysisResult?.weaknesses?.length) && (
                  <GlassCard style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 700, marginBottom: '0.875rem' }}>⚠️ Areas for Improvement</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                      {analysisResult.weaknesses.slice(0, 6).map((w, i) => (
                        <span key={i} style={{ padding: '0.4rem 0.875rem', background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.18)', borderRadius: '0.5rem', color: '#f59e0b', fontSize: '0.83rem' }}>{w}</span>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <Divider />

                {/* ── PHASE 04: KEYWORD INTELLIGENCE ── */}
                <SectionHeader phase="PHASE 04" title="Keyword & Vector Intelligence" subtitle="Technical semantic analysis and keyword density" />

                {/* Skills cloud */}
                <GlassCard style={{ marginBottom: '1.25rem' }}>
                  <div style={{ textAlign: 'center', fontSize: '0.68rem', color: 'var(--text-secondary)', letterSpacing: '0.12em', marginBottom: '1.25rem' }}>
                    DETECTED SKILLS & KEYWORDS
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', justifyContent: 'center' }}>
                    {[...new Set([
                      ...(analysisResult?.skills_to_emphasize || []),
                      ...(analysisResult?.extracted_skills || []),
                    ])].slice(0, 24).map((kw, i) => (
                      <span key={i} style={{ padding: '0.38rem 0.85rem', background: 'rgba(44,154,255,0.09)', border: '1px solid rgba(44,154,255,0.2)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.83rem', fontWeight: 600 }}>
                        {kw}
                      </span>
                    ))}
                    {!([...(analysisResult?.skills_to_emphasize || []), ...(analysisResult?.extracted_skills || [])]).length && (
                      <EmptyMsg>No keywords extracted.</EmptyMsg>
                    )}
                  </div>
                </GlassCard>

                {/* Missing keywords */}
                {!!(analysisResult?.missing_keywords?.length) && (
                  <GlassCard style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '1rem' }}>🚫 Missing Critical Keywords</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.625rem' }}>
                      {analysisResult.missing_keywords.slice(0, 9).map((kw, i) => {
                        const word = typeof kw === 'object' ? kw.keyword : kw;
                        return (
                          <div key={i} style={{ padding: '0.5rem', textAlign: 'center', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.5rem', color: '#fca5a5', fontSize: '0.83rem', fontWeight: 600 }}>
                            {word}
                          </div>
                        );
                      })}
                    </div>
                  </GlassCard>
                )}

                {/* Extracted keywords */}
                {!!(analysisResult?.keywords?.length) && (
                  <GlassCard style={{ marginBottom: '1.25rem' }}>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.875rem' }}>🔍 Extracted Keywords</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {analysisResult.keywords.slice(0, 20).map((kw, i) => (
                        <span key={i} style={{ padding: '0.3rem 0.65rem', background: 'rgba(44,154,255,0.06)', border: '1px solid rgba(44,154,255,0.13)', borderRadius: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{kw}</span>
                      ))}
                    </div>
                  </GlassCard>
                )}

                <Divider />

                {/* ── PHASE 05: STRATEGIC CAREER PLANNING ── */}
                <SectionHeader phase="PHASE 05" title="Strategic Career Planning" subtitle="Market alignment and trajectory projections" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
                  {/* Role alignment */}
                  <GlassCard style={{ background: 'rgba(44,154,255,0.04)', borderColor: 'rgba(44,154,255,0.18)' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--accent-2)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.4rem' }}>TARGET ROLE ALIGNMENT</div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                      {analysisResult?.role_specific_advice?.target_role || analysisResult?.predicted_roles?.[0]?.role || 'Not Specified'}
                    </div>

                    {[
                      ['MARKET VALUE',  analysisResult?.role_specific_advice?.market_alignment || 'Aligned'],
                      ['SKILLS GAP',    analysisResult?.role_specific_advice?.required_skills_gap || 'None identified'],
                    ].map(([lbl, val]) => (
                      <React.Fragment key={lbl}>
                        <div style={{ height: '1px', background: 'rgba(44,154,255,0.08)', margin: '0.75rem 0' }} />
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700 }}>{lbl}</div>
                        <div style={{ color: '#fff', fontSize: '0.88rem', marginTop: '0.2rem', marginBottom: '0.25rem' }}>{val}</div>
                      </React.Fragment>
                    ))}

                    {!!(analysisResult?.role_specific_advice?.comparable_roles?.length) && (
                      <>
                        <div style={{ height: '1px', background: 'rgba(44,154,255,0.08)', margin: '0.75rem 0' }} />
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '0.5rem' }}>COMPARABLE PATHS</div>
                        {analysisResult.role_specific_advice.comparable_roles.slice(0, 3).map((r, i) => (
                          <div key={i} style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', marginBottom: '0.2rem' }}>→ {r}</div>
                        ))}
                      </>
                    )}
                  </GlassCard>

                  {/* Role match bars */}
                  <GlassCard>
                    <div style={{ fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Predicted Role Match
                    </div>
                    {(analysisResult?.predicted_roles || []).map((r, i) => (
                      <RoleBar key={i} role={r.role} score={r.match_score} />
                    ))}
                    {!(analysisResult?.predicted_roles?.length) && <EmptyMsg>No role predictions available.</EmptyMsg>}
                  </GlassCard>
                </div>

                {/* Certifications */}
                {!!(analysisResult?.certifications_recommendations?.length) && (
                  <GlassCard>
                    <div style={{ color: '#818cf8', fontWeight: 700, marginBottom: '1rem' }}>🎓 Recommended Certifications</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem' }}>
                      {analysisResult.certifications_recommendations.map((cert, i) => (
                        <span key={i} style={{ padding: '0.4rem 0.875rem', background: 'rgba(129,140,248,0.09)', border: '1px solid rgba(129,140,248,0.22)', borderRadius: '0.5rem', color: '#c7d2fe', fontSize: '0.83rem' }}>{cert}</span>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: RESOURCES
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'resources' && (
          <>
            {/* Personalization banner */}
            <div style={{
              padding: '0.875rem 1.25rem',
              background: analysisResult ? 'rgba(16,185,129,0.06)' : 'rgba(44,154,255,0.04)',
              border: `1px solid ${analysisResult ? 'rgba(16,185,129,0.18)' : 'rgba(44,154,255,0.12)'}`,
              borderRadius: '0.75rem', marginBottom: '1.75rem',
              color: analysisResult ? '#10b981' : 'var(--text-secondary)',
              fontSize: '0.88rem', fontWeight: analysisResult ? 600 : 400
            }}>
              {analysisResult
                ? 'Resources personalized based on your resume analysis.'
                : 'Analyze your resume first to get personalized recommendations.'}
            </div>

            {/* Resource sub-tabs */}
            <div style={{ marginBottom: '1.75rem' }}>
              <TabBar
                tabs={[{ id: 'courses', label: 'Courses' }, { id: 'videos', label: 'Videos' }, { id: 'guides', label: 'Guides' }, { id: 'tips', label: 'Tips' }]}
                active={resourceTab}
                onChange={setResourceTab}
              />
            </div>

            {/* Courses */}
            {resourceTab === 'courses' && (
              Object.keys(courses).length === 0
                ? <EmptyMsg>Loading courses…</EmptyMsg>
                : Object.entries(courses).map(([category, platforms]) => (
                  <div key={category} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#fff', fontWeight: 700, marginBottom: '0.875rem', fontSize: '0.95rem' }}>{category}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '0.625rem' }}>
                      {Object.entries(platforms).map(([platform, url]) => (
                        <a
                          key={platform} href={url} target="_blank" rel="noopener noreferrer"
                          style={{ display: 'block', padding: '1rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(44,154,255,0.1)', borderRadius: '0.75rem', textDecoration: 'none', transition: 'border-color 0.2s' }}
                        >
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.83rem', marginBottom: '0.4rem' }}>{platform}</div>
                          <div style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>Explore →</div>
                        </a>
                      ))}
                    </div>
                  </div>
                ))
            )}

            {/* Videos */}
            {resourceTab === 'videos' && (
              Object.keys(videos).length === 0
                ? <EmptyMsg>Loading videos…</EmptyMsg>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    {Object.entries(videos).map(([topic, url]) => (
                      <a
                        key={topic} href={url} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'block', padding: '1rem 1.125rem', background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(44,154,255,0.1)', borderRadius: '0.75rem', textDecoration: 'none' }}
                      >
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.83rem', marginBottom: '0.4rem' }}>{topic}</div>
                        <div style={{ color: 'var(--accent)', fontSize: '0.78rem' }}>Watch →</div>
                      </a>
                    ))}
                  </div>
                )
            )}

            {/* Guides */}
            {resourceTab === 'guides' && (
              Object.keys(guides).length === 0
                ? <EmptyMsg>Loading guides…</EmptyMsg>
                : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {Object.entries(guides).map(([title, guide]) => (
                      <GlassCard key={title}>
                        <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.88rem', marginBottom: '0.4rem' }}>{title}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', lineHeight: 1.5, marginBottom: '0.625rem' }}>
                          {typeof guide === 'object' ? guide.description : guide}
                        </div>
                        {Array.isArray(guide?.tags) && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                            {guide.tags.map((tag, i) => (
                              <span key={i} style={{ padding: '0.2rem 0.5rem', background: 'rgba(44,154,255,0.08)', border: '1px solid rgba(44,154,255,0.18)', borderRadius: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.7rem' }}>{tag}</span>
                            ))}
                          </div>
                        )}
                      </GlassCard>
                    ))}
                  </div>
                )
            )}

            {/* Tips */}
            {resourceTab === 'tips' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                <GlassCard>
                  <div style={{ color: '#10b981', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>✅ Do This</div>
                  {(tips.do || []).map((tip, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.65rem 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(44,154,255,0.06)' : 'none' }}>
                      <span style={{ color: '#10b981', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{tip}</span>
                    </div>
                  ))}
                  {!tips.do?.length && <EmptyMsg>Loading tips…</EmptyMsg>}
                </GlassCard>
                <GlassCard>
                  <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '1rem', fontSize: '0.95rem' }}>❌ Avoid This</div>
                  {(tips.dont || []).map((tip, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.625rem', padding: '0.65rem 0', borderBottom: i < arr.length - 1 ? '1px solid rgba(44,154,255,0.06)' : 'none' }}>
                      <span style={{ color: '#ef4444', fontWeight: 700, flexShrink: 0 }}>✗</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{tip}</span>
                    </div>
                  ))}
                  {!tips.dont?.length && <EmptyMsg>Loading tips…</EmptyMsg>}
                </GlassCard>
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            TAB: ADMIN
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'admin' && (
          !adminToken ? (
            /* Admin login */
            <div style={{ maxWidth: '420px', margin: '0 auto' }}>
              <GlassCard>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔐</div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>Admin Dashboard</h2>
                  <p style={{ color: 'var(--text-secondary)', margin: '0.4rem 0 0', fontSize: '0.88rem' }}>
                    Sign in to access analytics and resume records
                  </p>
                </div>

                <form onSubmit={handleAdminLogin}>
                  {[
                    { label: 'EMAIL ADDRESS', type: 'email', value: adminEmail, onChange: e => setAdminEmail(e.target.value), placeholder: 'admin@example.com' },
                    { label: 'PASSWORD',      type: 'password', value: adminPassword, onChange: e => setAdminPassword(e.target.value), placeholder: '••••••••' },
                  ].map(({ label, type, value, onChange, placeholder }) => (
                    <div key={label} style={{ marginBottom: '1.25rem' }}>
                      <label style={{ display: 'block', color: '#e8f0fe', fontWeight: 700, fontSize: '0.72rem', marginBottom: '0.45rem', letterSpacing: '0.06em' }}>{label}</label>
                      <input
                        type={type} value={value} onChange={onChange} placeholder={placeholder} required
                        style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(44,154,255,0.04)', border: '1px solid rgba(44,154,255,0.18)', borderRadius: '0.75rem', color: '#e8f0fe', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}

                  {adminLoginError && (
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.625rem', color: '#fca5a5', fontSize: '0.83rem', marginBottom: '1rem' }}>
                      ✗ {adminLoginError}
                    </div>
                  )}

                  <button
                    type="submit" disabled={adminLoading}
                    style={{ width: '100%', padding: '1rem', background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', border: 'none', borderRadius: '0.75rem', color: '#fff', fontWeight: 700, fontSize: '0.95rem', cursor: adminLoading ? 'not-allowed' : 'pointer', letterSpacing: '0.05em' }}
                  >
                    {adminLoading ? 'Signing in…' : 'SIGN IN'}
                  </button>
                </form>
              </GlassCard>
            </div>
          ) : (
            /* Admin dashboard */
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ color: '#fff', fontWeight: 800, margin: 0, fontSize: '1.35rem' }}>Analytics Dashboard</h2>
                <div style={{ display: 'flex', gap: '0.625rem' }}>
                  <button onClick={loadAdminData} style={smallBtn('#2c9aff')}>Refresh</button>
                  <button onClick={() => setAdminToken(null)} style={smallBtn('#ef4444')}>Logout</button>
                </div>
              </div>

              {adminLoading && <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem 0' }}>Loading analytics…</div>}
              {adminError  && <div style={{ color: '#ef4444', padding: '0.875rem 1.125rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.88rem' }}>{adminError}</div>}

              {analytics && (
                <>
                  {/* KPI row */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                    {[
                      { label: 'Total Resumes',  value: analytics?.stats?.total_resumes ?? 0 },
                      { label: 'Average Score',  value: `${(analytics?.stats?.average_score ?? 0).toFixed(1)}` },
                      { label: 'Highest Score',  value: `${(analytics?.stats?.highest_score ?? 0).toFixed(1)}` },
                      { label: 'Unique Users',   value: analytics?.stats?.total_users ?? 0 },
                    ].map(({ label, value }) => (
                      <GlassCard key={label} style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.4rem' }}>{value}</div>
                        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
                      </GlassCard>
                    ))}
                  </div>

                  {/* Top roles */}
                  {!!(analytics?.top_roles?.length) && (
                    <GlassCard style={{ marginBottom: '2rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff', marginBottom: '1.25rem', fontSize: '0.95rem' }}>Top Predicted Roles</div>
                      {analytics.top_roles.slice(0, 6).map((r, i) => (
                        <RoleBar key={i} role={r.role_name} score={Math.min((r.count / Math.max(analytics.stats?.total_resumes || 1, 1)) * 100, 100)} />
                      ))}
                    </GlassCard>
                  )}
                </>
              )}

              {/* Records table */}
              {!!resumeRecords.length && (
                <GlassCard>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem' }}>
                      Resume Records <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>({resumeRecords.length})</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
                      <input
                        placeholder="Filter by email…" value={filterEmail}
                        onChange={e => setFilterEmail(e.target.value)}
                        style={{ padding: '0.4rem 0.75rem', background: 'rgba(44,154,255,0.04)', border: '1px solid rgba(44,154,255,0.18)', borderRadius: '0.5rem', color: '#fff', fontSize: '0.8rem', outline: 'none', width: '180px' }}
                      />
                      <button onClick={handleExportCSV} style={{ padding: '0.4rem 0.875rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '0.5rem', color: '#10b981', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        Export CSV
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.81rem' }}>
                      <thead>
                        <tr>
                          {['ID', 'Name', 'Email', 'Score', 'City', 'Country', 'Upload Date'].map(h => (
                            <th key={h} style={{ padding: '0.625rem 0.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontWeight: 700, borderBottom: '1px solid rgba(44,154,255,0.08)', fontSize: '0.7rem', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resumeRecords
                          .filter(r => !filterEmail || r.email?.toLowerCase().includes(filterEmail.toLowerCase()))
                          .map((r, i) => (
                            <tr key={r.id ?? i} style={{ borderBottom: '1px solid rgba(44,154,255,0.04)' }}>
                              <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)' }}>{r.id}</td>
                              <td style={{ padding: '0.55rem 0.5rem', color: '#fff', fontWeight: 500 }}>{r.user_name}</td>
                              <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)' }}>{r.email}</td>
                              <td style={{ padding: '0.55rem 0.5rem' }}>
                                <span style={{ color: (r.score ?? 0) >= 70 ? '#10b981' : (r.score ?? 0) >= 40 ? '#f59e0b' : '#ef4444', fontWeight: 700 }}>
                                  {(r.score ?? 0).toFixed(1)}
                                </span>
                              </td>
                              <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)' }}>{r.city || '—'}</td>
                              <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)' }}>{r.country || '—'}</td>
                              <td style={{ padding: '0.55rem 0.5rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                                {r.upload_date ? new Date(r.upload_date).toLocaleDateString() : '—'}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              )}
            </>
          )
        )}

      </div>
    </div>
  );
}

// ─── Micro-helpers ────────────────────────────────────────────────────────────

function EmptyMsg({ children }) {
  return <p style={{ color: 'var(--text-secondary)', fontSize: '0.83rem', margin: 0 }}>{children}</p>;
}

function smallBtn(accentColor) {
  return {
    padding: '0.45rem 0.9rem',
    background: `rgba(${hexToRgb(accentColor)}, 0.08)`,
    border: `1px solid rgba(${hexToRgb(accentColor)}, 0.22)`,
    borderRadius: '0.5rem', color: accentColor,
    fontWeight: 600, cursor: 'pointer', fontSize: '0.82rem', transition: 'all 0.2s'
  };
}

function hexToRgb(hex) {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return '255,255,255';
  if (hex === '#2c9aff') return '44,154,255';
  if (hex === '#ef4444') return '239,68,68';
  if (hex === '#10b981') return '16,185,129';
  return '255,255,255';
}
