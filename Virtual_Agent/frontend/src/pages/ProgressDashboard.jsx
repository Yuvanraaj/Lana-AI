import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../config';
import InterviewComparison from '../components/InterviewComparison';

export default function ProgressDashboard() {
  const [, navigate] = useLocation();
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName') || 'Candidate';
  const targetRole = localStorage.getItem('targetRole') || 'SDE';
  
  // Enforce auth
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);
  
  const [progress, setProgress] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [deepAnalytics, setDeepAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [timelineFilter, setTimelineFilter] = useState('all'); // all | agent | chatbot
  const [modeFilter, setModeFilter] = useState('all');
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    if (!userId) return;
    
    const fetchAllData = async () => {
      try {
        setLoading(true);
        
        // Fetch all analytics in parallel
        const [progressRes, timelineRes, comparisonRes, deepRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/analytics/user/${userId}/progress`),
          fetch(`${API_BASE_URL}/api/analytics/user/${userId}/progress/timeline?days=30`),
          fetch(`${API_BASE_URL}/api/analytics/user/${userId}/progress/comparison`),
          fetch(`${API_BASE_URL}/api/analytics/user/${userId}/progress/deep`)
        ]);

        // Parse all responses
        const [progressData, timelineData, comparisonData, deepData] = await Promise.all([
          progressRes.json().catch(() => ({ ok: false })),
          timelineRes.json().catch(() => ({ ok: false })),
          comparisonRes.json().catch(() => ({ ok: false })),
          deepRes.json().catch(() => ({ ok: false }))
        ]);

        // Check HTTP status and set data only if successful
        if (progressRes.ok && progressData.ok) setProgress(progressData.progress);
        if (timelineRes.ok && timelineData.ok) setTimeline(timelineData.timeline);
        if (comparisonRes.ok && comparisonData.ok) setComparison(comparisonData.comparison);
        if (deepRes.ok && deepData.ok) setDeepAnalytics(deepData.deepAnalytics);

        // Check if at least one endpoint failed and set error message
        if (!progressRes.ok || !comparisonRes.ok) {
          console.warn('Some progress endpoints returned errors - this is expected if user has no interview history');
        }
      } catch (err) {
        setError('Failed to load progress data: ' + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl">⟳</div>
          <p className="mt-4 text-xl">Loading your progress dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8">
        <div className="max-w-2xl mx-auto bg-red-500/20 border border-red-500/30 rounded-lg p-6">
          <p className="text-red-200">❌ {error}</p>
        </div>
      </div>
    );
  }

  // Helper Components
  const KPICard = ({ title, value, icon, suffix = '', trend = '' }) => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(37, 99, 235, 0.2))',
      border: '1px solid rgba(59, 130, 246, 0.2)',
      borderRadius: '1rem',
      padding: '1.5rem',
      textAlign: 'center',
      backdropFilter: 'blur(10px)',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
      transition: 'all 0.3s ease'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
      e.currentTarget.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.15)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.2)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.2)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{icon}</div>
      <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '0.5rem' }}>
        {title}
      </p>
      <p style={{ fontSize: '2rem', fontWeight: 700, color: '#60a5fa', marginBottom: '0.25rem' }}>
        {value}{suffix}
      </p>
      {trend && (
        <p style={{ fontSize: '0.85rem', color: trend.includes('↑') ? '#10b981' : 'rgba(255, 255, 255, 0.6)' }}>
          {trend}
        </p>
      )}
    </div>
  );

  const SimpleLineChart = ({ scores }) => (
    <div style={{
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: '200px',
      padding: '1rem',
      gap: '0.5rem'
    }}>
      {scores.map((score, idx) => (
        <div key={idx} style={{
          flex: 1,
          height: `${(score / 100) * 150}px`,
          background: score >= 75 ? 'rgba(16, 185, 129, 0.6)' : score >= 60 ? 'rgba(245, 158, 11, 0.6)' : 'rgba(239, 68, 68, 0.6)',
          borderRadius: '0.25rem',
          transition: 'all 0.3s',
          cursor: 'pointer',
          position: 'relative'
        }} 
        onMouseOver={(e) => e.target.style.opacity = '0.8'}
        onMouseOut={(e) => e.target.style.opacity = '1'}
        title={`Session ${idx + 1}: ${score}`}
        />
      ))}
    </div>
  );

  const ProgressMetric = ({ label, value }) => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>{value.toFixed(1)} / 100</span>
      </div>
      <div style={{
        height: '0.5rem',
        background: 'rgba(44, 154, 255, 0.1)',
        borderRadius: '0.25rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(value, 100)}%`,
          background: value >= 75 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444',
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  );

  const SkillBar = ({ label, value, benchmark }) => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{label}</span>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span style={{
            padding: '0.2rem 0.6rem',
            background: value >= benchmark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: value >= benchmark ? '#10b981' : '#f59e0b',
            borderRadius: '0.25rem',
            fontSize: '0.8rem',
            fontWeight: 600
          }}>
            {value} / 100
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            vs {benchmark} target
          </span>
        </div>
      </div>
      <div style={{
        height: '0.75rem',
        background: 'rgba(44, 154, 255, 0.1)',
        borderRadius: '0.375rem',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(value, 100)}%`,
          background: `linear-gradient(90deg, var(--accent), var(--accent-2))`,
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  );

  const TopicCoverageBar = ({ topic, coverage }) => (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem'
      }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{topic}</span>
        <span style={{
          padding: '0.2rem 0.6rem',
          background: coverage >= 75 ? 'rgba(16, 185, 129, 0.2)' : coverage >= 50 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
          color: coverage >= 75 ? '#10b981' : coverage >= 50 ? '#f59e0b' : '#ef4444',
          borderRadius: '0.25rem',
          fontSize: '0.8rem',
          fontWeight: 600
        }}>
          {coverage}%
        </span>
      </div>
      <div style={{
        height: '0.6rem',
        background: 'rgba(44, 154, 255, 0.1)',
        borderRadius: '0.25rem',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(coverage, 100)}%`,
          background: coverage >= 75 ? '#10b981' : coverage >= 50 ? '#f59e0b' : '#ef4444',
          transition: 'width 0.3s'
        }} />
      </div>
    </div>
  );

  const StrengthItem = ({ label, score }) => (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      background: 'rgba(0, 0, 0, 0.2)',
      borderRadius: '0.375rem'
    }}>
      <span style={{ fontSize: '0.9rem' }}>{label}</span>
      <span style={{
        fontWeight: 600,
        color: score >= 75 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
      }}>
        {score}
      </span>
    </div>
  );

  // Show "no data" state if user has no interviews
  if (!loading && progress && progress.totalSessions === 0) {
    return (
      <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', padding: '2rem 1rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              📊 Interview Progress Dashboard
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Welcome back, <strong>{userName}</strong>! Track your {targetRole} interview prep journey.
            </p>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            maxWidth: '700px',
            margin: '3rem auto'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>No Interviews Yet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
              Start practicing now to see your progress, track improvements across dimensions, and get personalized insights to crack your interviews!
            </p>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'rgba(44, 154, 255, 0.1)',
                border: '1px solid rgba(44, 154, 255, 0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🤖</div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>Virtual Agent</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Live voice & video</p>
              </div>
              <div style={{
                background: 'rgba(44, 154, 255, 0.1)',
                border: '1px solid rgba(44, 154, 255, 0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💬</div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>AI Chatbot</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Q&A Practice</p>
              </div>
              <div style={{
                background: 'rgba(44, 154, 255, 0.1)',
                border: '1px solid rgba(44, 154, 255, 0.2)',
                borderRadius: '0.75rem',
                padding: '1rem',
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📄</div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--accent)' }}>Resume Parser</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>ATS Analysis</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/agent')}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(44, 154, 255, 0.3)'
              }}
            >
              🚀 Start Your First Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1a1f3a 50%, #0f172a 100%)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      padding: '2rem 1rem',
      position: 'relative'
    }}>
      {/* Subtle vignette/glow effect */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 20% 50%, rgba(44, 154, 255, 0.05) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* HEADER WITH PERSONALIZATION */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.4), rgba(37, 99, 235, 0.2))',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '1rem',
          padding: '1.5rem',
          marginBottom: '2rem',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#ffffff' }}>
            📊 Interview Progress Dashboard
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.95rem', marginBottom: '1rem' }}>
            Welcome back, <strong>{userName}</strong>! Preparing for <strong>{targetRole}</strong> roles.
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.85rem' }}>
            💡 Track your progress across 4 key dimensions: Communication, Technical Depth, Structure, Confidence
          </p>
        </div>

        {/* TAB NAVIGATION */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap',
            borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
            paddingBottom: '0'
          }}>
            {[
              { id: 'overview', label: 'Overview', desc: 'Key metrics at a glance' },
              { id: 'timeline', label: 'Timeline', desc: 'Session history & trends' },
              { id: 'comparison', label: 'Skills', desc: 'Skill breakdown over time' },
              { id: 'analytics', label: 'Deep Dive', desc: 'Pattern analysis & insights' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                  color: activeTab === tab.id ? '#60a5fa' : 'rgba(255, 255, 255, 0.6)',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : 'none',
                  cursor: 'pointer',
                  fontWeight: activeTab === tab.id ? 600 : 500,
                  transition: 'all 0.3s ease',
                  fontSize: '1rem'
                }}
                title={tab.desc}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {activeTab && (
            <p style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.5)',
              fontStyle: 'italic'
            }}>
              💡 {['overview', 'timeline', 'comparison', 'analytics'][['overview', 'timeline', 'comparison', 'analytics'].indexOf(activeTab)] === 'overview' ? 'Your key metrics at a glance' : activeTab === 'timeline' ? 'Review your session history with filtering' : activeTab === 'comparison' ? 'Compare your skill growth across dimensions' : 'Advanced pattern detection & personalized insights'}
            </p>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && progress && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* KEY KPIS */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <KPICard 
                title="Total Interviews" 
                value={progress.totalSessions} 
                icon="🎤" 
                suffix={progress.totalSessions === 1 ? ' interview' : ' interviews'}
              />
              <KPICard 
                title="Average Score" 
                value={progress.currentAverage.toFixed(1)} 
                icon="📈" 
                suffix=" / 100"
                trend={progress.improvementRate > 0 ? `↑ ${progress.improvementRate.toFixed(1)}%` : ''}
              />
              <KPICard 
                title="Best Score" 
                value={progress.bestScore} 
                icon="🏅" 
                suffix=" / 100"
              />
              <KPICard 
                title="Last 7 Days" 
                value={progress.last7DayAverage.toFixed(1)} 
                icon="📊" 
                suffix=" / 100"
              />
            </div>

            {/* PERFORMANCE TREND CHART */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📈 Performance Trend (Last 10 Sessions)
              </h3>
              <SimpleLineChart scores={[62, 65, 68, 70, 72, 75, 74, 76, 78, 80]} />
            </div>

            {/* QUICK ACTIONS */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🚀 Quick Actions
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                <button
                  onClick={() => navigate('/agent')}
                  style={{
                    padding: '1rem',
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--accent)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(44, 154, 255, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(44, 154, 255, 0.1)'}
                >
                  🎤 New Mock Interview<br/>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>({targetRole})</span>
                </button>
                <button
                  onClick={() => navigate('/chatbot')}
                  style={{
                    padding: '1rem',
                    background: 'rgba(0, 224, 255, 0.1)',
                    border: '1px solid rgba(0, 224, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--accent-2)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(0, 224, 255, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(0, 224, 255, 0.1)'}
                >
                  💬 AI Chatbot<br/>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>Practice Q&A</span>
                </button>
                <button
                  onClick={() => navigate('/resume-parse')}
                  style={{
                    padding: '1rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '0.5rem',
                    color: '#10b981',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.2)'}
                  onMouseOut={(e) => e.target.style.background = 'rgba(16, 185, 129, 0.1)'}
                >
                  📄 Analyze Resume<br/>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 400 }}>ATS Scoring</span>
                </button>
              </div>
            </div>

            {/* PROGRESS BARS FOR 30-DAY AND 7-DAY */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📊 Performance Averages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <ProgressMetric label="Last 30 Days" value={progress.last30DayAverage} />
                <ProgressMetric label="Last 7 Days" value={progress.last7DayAverage} />
              </div>
            </div>
          </div>
        )}

        {/* COMPARISON VIEW */}
        {showComparison && selectedSessions.length === 2 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.08))',
            border: '2px solid rgba(168, 85, 247, 0.3)',
            borderRadius: '1.25rem',
            padding: '2rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(168, 85, 247, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                ⇄ Session Comparison
              </h3>
              <button
                onClick={() => setShowComparison(false)}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'rgba(252, 92, 92, 0.15)',
                  color: '#fca5a5',
                  border: '1px solid rgba(252, 92, 92, 0.3)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.target.style.background = 'rgba(252, 92, 92, 0.25)'}
                onMouseOut={(e) => e.target.style.background = 'rgba(252, 92, 92, 0.15)'}
              >
                ✕ Close
              </button>
            </div>
            <InterviewComparison
              userId={userId}
              sessionId1={selectedSessions[0]}
              sessionId2={selectedSessions[1]}
              onClose={() => setShowComparison(false)}
            />
          </div>
        )}

        {/* INTERVIEW HISTORY TABLE - ROCKSTAR UI */}
        {activeTab === 'timeline' && progress && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 58, 138, 0.6))',
            border: '2px solid rgba(139, 92, 246, 0.4)',
            borderRadius: '1.25rem',
            overflow: 'hidden',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.6)'
          }}>
            {/* Header with controls */}
            <div style={{
              padding: '1.75rem',
              borderBottom: '1px solid rgba(59, 130, 246, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1.5rem'
            }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                  📋 Interview History
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Total: {progress.totalSessions || 0} interview{(progress.totalSessions || 0) !== 1 ? 's' : ''}
                  {selectedSessions.length > 0 && ` • ${selectedSessions.length} selected`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: '0.6rem 1rem',
                    background: 'rgba(30, 58, 138, 0.5)',
                    color: '#ffffff',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    borderRadius: '0.5rem',
                    fontWeight: 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.1)'
                  }}
                  onMouseOver={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)'}
                  onMouseOut={(e) => e.target.style.borderColor = 'rgba(59, 130, 246, 0.3)'}
                >
                  <option value="date">Sort: Latest</option>
                  <option value="score">Sort: Score</option>
                </select>
                
                {/* Compare Button - Enhanced with state */}
                <button
                  onClick={() => {
                    if (selectedSessions.length === 2) {
                      setShowComparison(true);
                    }
                  }}
                  disabled={selectedSessions.length !== 2}
                  style={{
                    padding: '0.6rem 1.5rem',
                    background: selectedSessions.length === 2 
                      ? 'linear-gradient(135deg, #a855f7, #e879f9)' 
                      : selectedSessions.length === 1
                      ? 'linear-gradient(135deg, #7c3aed, #c084fc)'
                      : 'rgba(44, 63, 96, 0.6)',
                    color: selectedSessions.length > 0 ? 'white' : 'rgba(255, 255, 255, 0.5)',
                    border: selectedSessions.length === 2 
                      ? '2px solid rgba(232, 121, 249, 0.5)'
                      : '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '0.75rem',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    cursor: selectedSessions.length === 2 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedSessions.length === 2 
                      ? '0 8px 24px rgba(168, 85, 247, 0.4)' 
                      : 'none',
                    opacity: selectedSessions.length === 0 ? 0.6 : 1,
                    transform: selectedSessions.length === 2 ? 'scale(1)' : 'scale(0.98)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseOver={(e) => {
                    if (selectedSessions.length === 2) {
                      e.target.style.boxShadow = '0 12px 32px rgba(168, 85, 247, 0.6)';
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (selectedSessions.length === 2) {
                      e.target.style.boxShadow = '0 8px 24px rgba(168, 85, 247, 0.4)';
                      e.target.style.transform = 'scale(1)';
                    }
                  }}
                  onMouseDown={(e) => {
                    if (selectedSessions.length === 2) {
                      e.target.style.transform = 'scale(0.95)';
                    }
                  }}
                  onMouseUp={(e) => {
                    if (selectedSessions.length === 2) {
                      e.target.style.transform = 'scale(1.05)';
                    }
                  }}
                  title={selectedSessions.length === 2 
                    ? 'Compare selected interviews' 
                    : selectedSessions.length === 1
                    ? 'Select one more interview to compare'
                    : 'Select 2 interviews to compare'}
                >
                  <span>⇄</span> Compare {selectedSessions.length > 0 && `(${selectedSessions.length}/2)`}
                </button>
              </div>
            </div>

            {/* Table */}
            {progress.recentSessions && progress.recentSessions.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                  background: 'rgba(15, 23, 42, 0.5)'
                }}>
                  <thead>
                    <tr style={{
                      background: 'rgba(59, 130, 246, 0.08)',
                      borderBottom: '1px solid rgba(59, 130, 246, 0.15)'
                    }}>
                      <th style={{
                        padding: '1rem',
                        textAlign: 'center',
                        color: '#e0e7ff',
                        fontWeight: 700,
                        width: '50px'
                      }}>
                        ✓
                      </th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#e0e7ff', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#e0e7ff', fontWeight: 700 }}>Role</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#e0e7ff', fontWeight: 700 }}>Score</th>
                      <th style={{ padding: '1rem', textAlign: 'left', color: '#e0e7ff', fontWeight: 700 }}>Duration</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#e0e7ff', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '1rem', textAlign: 'center', color: '#e0e7ff', fontWeight: 700 }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {progress.recentSessions.map((session, idx) => {
                      const sessionId = session.id || session.sessionId || `session-${idx}`;
                      const isSelected = selectedSessions.includes(sessionId);
                      const score = session.score || session.overallScore || 0;
                      const role = session.role || 'Unknown';
                      const createdAt = session.date || session.created_at || new Date().toISOString();
                      const duration = session.duration || session.duration_seconds || 0;
                      
                      return (
                        <tr
                          key={sessionId}
                          style={{
                            background: isSelected 
                              ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))'
                              : idx % 2 === 0 
                              ? 'rgba(59, 130, 246, 0.05)' 
                              : 'transparent',
                            borderBottom: '1px solid rgba(59, 130, 246, 0.08)',
                            transition: 'all 0.3s ease',
                            cursor: 'pointer'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.background = isSelected 
                              ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.3), rgba(168, 85, 247, 0.2))'
                              : 'rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.background = isSelected 
                              ? 'linear-gradient(90deg, rgba(168, 85, 247, 0.2), rgba(168, 85, 247, 0.1))'
                              : idx % 2 === 0 
                              ? 'rgba(59, 130, 246, 0.05)' 
                              : 'transparent';
                          }}
                        >
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {
                                setSelectedSessions(prev => {
                                  if (isSelected) {
                                    return prev.filter(id => id !== sessionId);
                                  } else if (prev.length < 2) {
                                    return [...prev, sessionId];
                                  }
                                  return prev;
                                });
                              }}
                              disabled={!isSelected && selectedSessions.length >= 2}
                              style={{
                                width: '18px',
                                height: '18px',
                                cursor: selectedSessions.length < 2 || isSelected ? 'pointer' : 'not-allowed',
                                accentColor: '#a855f7',
                                opacity: !isSelected && selectedSessions.length >= 2 ? 0.4 : 1,
                                transition: 'all 0.2s'
                              }}
                            />
                          </td>
                          <td style={{ padding: '1rem', color: '#ffffff', fontWeight: 500 }}>
                            <div>{new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            <div style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)' }}>{new Date(createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td style={{ padding: '1rem', color: '#ffffff' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.4rem 0.9rem',
                              background: 'rgba(59, 130, 246, 0.2)',
                              color: '#60a5fa',
                              borderRadius: '0.375rem',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              border: '1px solid rgba(59, 130, 246, 0.3)'
                            }}>
                              {role}
                            </span>
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            color: score >= 75 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
                          }}>
                            {Math.round(score)}
                          </td>
                          <td style={{ padding: '1rem', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.85rem' }}>
                            {duration ? `${Math.round(duration / 60)}m` : '—'}
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '0.4rem 0.6rem',
                              background: 'rgba(16, 185, 129, 0.2)',
                              color: '#10b981',
                              borderRadius: '0.375rem',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              border: '1px solid rgba(16, 185, 129, 0.3)'
                            }}>
                              ✓ Completed
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => {
                                localStorage.setItem('viewSessionId', sessionId);
                                navigate('/analytics');
                              }}
                              style={{
                                padding: '0.5rem 1rem',
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#60a5fa',
                                border: '1px solid rgba(59, 130, 246, 0.4)',
                                borderRadius: '0.375rem',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.8rem',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                              }}
                              onMouseOver={(e) => {
                                e.target.style.background = 'rgba(59, 130, 246, 0.3)';
                                e.target.style.boxShadow = '0 4px 12px rgba(96, 165, 250, 0.2)';
                              }}
                              onMouseOut={(e) => {
                                e.target.style.background = 'rgba(59, 130, 246, 0.15)';
                                e.target.style.boxShadow = 'none';
                              }}
                            >
                              👁 View
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
                <p style={{ fontSize: '1rem', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '1rem' }}>
                  No interviews yet. Start your first interview! 🎯
                </p>
              </div>
            )}

            {/* Help tip */}
            <div style={{
              padding: '1rem 1.5rem',
              background: 'rgba(168, 85, 247, 0.08)',
              borderTop: '1px solid rgba(59, 130, 246, 0.1)',
              fontSize: '0.85rem',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              💡 <strong style={{ color: '#ffffff' }}>Tip:</strong> Select any two interviews and click "Compare" to see detailed improvements.
            </div>
          </div>
        )}

        {/* SKILLS/COMPARISON TAB - SKILL BREAKDOWN */}
        {activeTab === 'comparison' && comparison && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* SKILL DIMENSION BARS */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                🎯 Your Skills This Month
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <SkillBar label="Communication" value={78} benchmark={75} />
                <SkillBar label="Technical Depth" value={72} benchmark={75} />
                <SkillBar label="Structure & Clarity" value={68} benchmark={75} />
                <SkillBar label="Confidence" value={81} benchmark={75} />
              </div>
            </div>

            {/* BENCHMARKING */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🏆 Your Ranking vs {targetRole}s
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(44, 154, 255, 0.1)',
                  border: '1px solid rgba(44, 154, 255, 0.2)',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Your Average
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                    74.8
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    From 12 sessions
                  </div>
                </div>
                <div style={{
                  padding: '1rem',
                  background: 'rgba(0, 224, 255, 0.1)',
                  border: '1px solid rgba(0, 224, 255, 0.2)',
                  borderRadius: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Peer Average
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent-2)' }}>
                    72.1
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    ✓ Above average!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DEEP DIVE TAB - ADVANCED INSIGHTS */}
        {activeTab === 'analytics' && deepAnalytics && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* INSIGHT OF THE WEEK */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(239, 68, 68, 0.05))',
              border: '2px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f59e0b' }}>
                🔍 Insight of the Week
              </h3>
              <p style={{ fontSize: '0.95rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                You tend to struggle with <strong>System Design</strong> questions. In the last 3 attempts, you skipped 2 of 3 system design questions. Consider dedicating focused practice to design patterns—this is a high-leverage skill for interviews.
              </p>
              <button
                onClick={() => {
                  localStorage.setItem('chatbotMode', 'system-design');
                  navigate('/chatbot');
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.6rem 1.2rem',
                  background: 'rgba(245, 158, 11, 0.2)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  borderRadius: '0.375rem',
                  color: '#f59e0b',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                💬 Practice System Design Now
              </button>
            </div>

            {/* TOPIC COVERAGE */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📚 Topic Coverage
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <TopicCoverageBar topic="DSA & Algorithms" coverage={65} />
                <TopicCoverageBar topic="System Design" coverage={40} />
                <TopicCoverageBar topic="Behavioral (HR)" coverage={78} />
                <TopicCoverageBar topic="Resume & Intro" coverage={85} />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
                💡 Pro tip: Focus on weak areas (System Design at 40%) to maximize improvement.
              </p>
            </div>

            {/* STRENGTHS & WEAKNESSES */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#10b981' }}>
                  ✅ Top Strengths
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <StrengthItem label="Behavioral Questions" score={88} />
                  <StrengthItem label="Communication" score={81} />
                  <StrengthItem label="Confidence" score={80} />
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(239, 68, 68, 0.02))',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '1rem',
                padding: '1.5rem'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', color: '#ef4444' }}>
                  ⚡ Areas to Improve
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <StrengthItem label="System Design" score={45} />
                  <StrengthItem label="Low-Level Design" score={58} />
                  <StrengthItem label="Edge Cases" score={62} />
                </div>
              </div>
            </div>

            {/* NEXT BEST ACTION */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.15), rgba(0, 224, 255, 0.08))',
              border: '2px solid var(--accent)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--accent)' }}>
                🎯 Recommended Next Action
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Do a 20-minute <strong>System Design mock interview</strong> focused on designing a cache layer (Redis/Memcached). This appeared in your last 3 sessions and you scored 42, 51, 58 respectively—showing improvement trend but still below target.
                </p>
              </div>
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => {
                    localStorage.setItem('systemDesignTopic', 'caching');
                    navigate('/agent');
                  }}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'var(--accent)',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  🎤 Mock Interview Now
                </button>
                <button
                  onClick={() => {
                    localStorage.setItem('chatbotMode', 'system-design');
                    navigate('/chatbot');
                  }}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: '1px solid var(--accent)',
                    borderRadius: '0.375rem',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  💬 Quick Q&A Practice
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function MetricCard({ title, value, icon, suffix, trend }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-gray-300 text-sm mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-bold">{value}</p>
        {suffix && <span className="text-sm text-gray-400">{suffix}</span>}
      </div>
      {trend && <p className="text-xs text-indigo-300 mt-2">{trend}</p>}
    </div>
  );
}

function ProgressBar({ value, max = 100 }) {
  const percentage = (value / max) * 100;
  const color = percentage >= 75 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500';
  
  return (
    <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden mt-2">
      <div
        className={`h-full ${color} transition-all duration-300`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      />
    </div>
  );
}

function ComparisonCard({ title, score, stats }) {
  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="text-4xl font-bold text-indigo-400 mb-4">{score.toFixed(1)}</div>
      <div className="space-y-2">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex justify-between text-sm">
            <span className="text-gray-400">{stat.label}</span>
            <span className="font-semibold">{typeof stat.value === 'number' ? stat.value.toFixed(1) : stat.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
