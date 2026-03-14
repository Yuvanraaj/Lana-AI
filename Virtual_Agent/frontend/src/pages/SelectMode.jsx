import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import InterviewHistory from "../components/InterviewHistory";
import { API_BASE_URL } from "../config";

const primaryActions = [
  {
    label: "Mock Interview",
    path: "/interview",
    description: "Simulated HR & technical rounds with live transcript.",
    outcomes: [
      "Get scores for communication, STAR structure, and technical depth",
      "Receive 7-day improvement plan targeting your weak areas",
      "Export PDF report to track progress"
    ],
    icon: "🎤",
    badge: "RECOMMENDED",
    badgeColor: "from-blue-500 to-cyan-500",
    gradient: "from-blue-600/20 to-cyan-600/20",
    border: "border-blue-500/40 hover:border-blue-400",
    glow: "hover:shadow-blue-500/30",
  },
  {
    label: "AI Coaching",
    path: "/chatbot",
    description: "Practice answering any interview question with AI feedback.",
    outcomes: [
      "Ask unlimited follow-up questions, get suggested improvements",
      "See sample strong responses to learn from",
      "Build confidence before full mock interviews"
    ],
    icon: "💡",
    badge: "PRACTICE",
    badgeColor: "from-purple-500 to-pink-500",
    gradient: "from-purple-600/20 to-pink-600/20",
    border: "border-purple-500/40 hover:border-purple-400",
    glow: "hover:shadow-purple-500/30",
  },
];

const secondaryTools = [
  {
    label: "Resume Analyzer",
    path: "/resume-parse",
    description: "Score vs target JD, skill gaps, and ATS match.",
    outcomes: [
      "Identify missing skills for your target role",
      "See prioritized edit suggestions for ATS optimization",
      "Get keyword alignment report"
    ],
    icon: "📊",
    badge: "ANALYSIS",
    badgeColor: "from-emerald-500 to-teal-500",
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/30 hover:border-emerald-400",
    glow: "hover:shadow-emerald-500/20",
  },
];

export default function SelectMode() {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [customJD, setCustomJD] = useState('');
  const userId = localStorage.getItem('userId') || 'demo-user';

  const roles = [
    { id: 'sde1-backend', label: 'SDE-1 Backend', icon: '⚙️' },
    { id: 'sde1-frontend', label: 'SDE-1 Frontend', icon: '🎨' },
    { id: 'sde1-fullstack', label: 'SDE-1 Fullstack', icon: '🔗' },
    { id: 'sde1-product', label: 'SDE-1 Product', icon: '📱' },
    { id: 'devops', label: 'DevOps Engineer', icon: '🚀' },
    { id: 'data-engineer', label: 'Data Engineer', icon: '📊' },
  ];

  const handleInterviewClick = () => {
    setShowRoleSelector(true);
  };

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleConfirmRole = () => {
    if (selectedRole === 'custom' && !customJD.trim()) {
      alert('Please enter a job description');
      return;
    }
    localStorage.setItem('selectedRole', selectedRole === 'custom' ? 'sde1-product' : selectedRole);
    localStorage.setItem('selectedJD', selectedRole === 'custom' ? customJD : '');
    localStorage.setItem('selectedRoleLabel', selectedRole === 'custom' ? 'Custom Role' : roles.find(r => r.id === selectedRole)?.label || 'Interview');
    setShowRoleSelector(false);
    navigate('/interview');
  };

  const handleOptionClick = (opt) => {
    if (opt.path === '/interview') {
      handleInterviewClick();
    } else if (opt.path) {
      navigate(opt.path);
    }
  };

  return (
    <div>
      {/* Role Selector Modal */}
      {showRoleSelector && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid var(--border-color)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
              Select Your Target Role
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    border: selectedRole === role.id ? '2px solid var(--accent)' : '1px solid var(--border-color)',
                    background: selectedRole === role.id ? 'rgba(44, 154, 255, 0.1)' : 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{role.icon}</div>
                  <div>{role.label}</div>
                </button>
              ))}
            </div>

            {/* Custom Role Option */}
            <div style={{
              padding: '1rem',
              borderRadius: '8px',
              border: selectedRole === 'custom' ? '2px solid var(--accent)' : '1px solid var(--border-color)',
              background: selectedRole === 'custom' ? 'rgba(44, 154, 255, 0.1)' : 'var(--bg-primary)',
              marginBottom: '1.5rem'
            }}>
              <button
                onClick={() => handleRoleSelect('custom')}
                style={{
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textAlign: 'left'
                }}>
                ✨ Custom Role
              </button>
              {selectedRole === 'custom' && (
                <textarea
                  placeholder="Describe your target role (2-3 sentences)"
                  value={customJD}
                  onChange={(e) => setCustomJD(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    marginTop: '0.75rem',
                    minHeight: '80px',
                    fontFamily: 'inherit',
                    fontSize: '0.9rem'
                  }} />
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => { setShowRoleSelector(false); setSelectedRole(null); }}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}>
                Cancel
              </button>
              <button
                onClick={handleConfirmRole}
                disabled={!selectedRole}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedRole ? 'var(--accent)' : 'var(--border-color)',
                  color: 'white',
                  cursor: selectedRole ? 'pointer' : 'not-allowed',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interview History Modal */}
      {showHistory && (
        <InterviewHistory
          userId={userId}
          onViewSession={(sessionId) => {
            localStorage.setItem('viewSessionId', sessionId);
            setShowHistory(false);
            navigate('/analytics');
          }}
          onClose={() => setShowHistory(false)}
        />
      )}

      {!showHistory && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          {/* Subtle background effects */}
          <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(44, 154, 255, 0.1) 0%, transparent 70%)',
            opacity: 0.4
          }} />
          <div className="fixed bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(0, 224, 255, 0.08) 0%, transparent 70%)',
            opacity: 0.3
          }} />

          {/* HERO SECTION */}
          <div className="text-center mb-12 relative z-10 max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full" style={{
              background: 'rgba(44, 154, 255, 0.1)',
              border: '1px solid rgba(44, 154, 255, 0.2)'
            }}>
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'var(--accent)',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500 }}>
                Welcome Back
              </span>
            </div>

            {/* Main Headline - SPECIFIC VALUE PROP */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
              AI Copilot for Cracking
              <br />
              <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Tech Interviews
              </span>
            </h1>

            {/* Subheadline - CLEAR PROMISE */}
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '1rem auto', lineHeight: '1.6' }}>
              Practice real interviews, analyze your resume, and track your progress in one place.
            </p>

            {/* Role Focus - TARGETED */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
              marginTop: '1.5rem'
            }}>
              {['Backend', 'DevOps', 'Data'].map((role, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--accent)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '0.375rem',
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    fontWeight: 500
                  }}
                >
                  {role} Optimized
                </div>
              ))}
            </div>
          </div>

          {/* PRIMARY ACTIONS - BIG FEATURED CARDS */}
          <div className="w-full max-w-5xl mb-12 relative z-10">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pick Your Starting Point
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {primaryActions.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => handleOptionClick(opt)}
                  onMouseEnter={() => setHovered(`primary-${i}`)}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-2xl p-8 flex flex-col items-start text-left transition-all duration-300 focus:outline-none focus:ring-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    cursor: 'pointer',
                    transform: hovered === `primary-${i}` ? 'translateY(-4px) scale(1.02)' : 'translateY(0)',
                    boxShadow: hovered === `primary-${i}` ? '0 20px 40px rgba(44, 154, 255, 0.2)' : 'none',
                    focusRingColor: 'var(--accent)'
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    fontSize: '3rem',
                    marginBottom: '1rem',
                    transform: hovered === `primary-${i}` ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.3s ease'
                  }}>
                    {opt.icon}
                  </div>

                  {/* Header with badge */}
                  <div style={{ marginBottom: '0.5rem' }}>
                    <h2 style={{
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem'
                    }}>
                      {opt.label}
                    </h2>
                    <div style={{
                      display: 'inline-block',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '0.35rem 0.75rem',
                      borderRadius: '0.375rem',
                      background: 'rgba(44, 154, 255, 0.15)',
                      color: 'var(--accent)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {opt.badge}
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    marginBottom: '1.25rem',
                    lineHeight: '1.5'
                  }}>
                    {opt.description}
                  </p>

                  {/* Outcomes as bullets */}
                  <ul style={{
                    flex: 1,
                    width: '100%',
                    marginBottom: '1.5rem',
                    listStyle: 'none',
                    padding: 0
                  }}>
                    {opt.outcomes.map((outcome, idx) => (
                      <li
                        key={idx}
                        style={{
                          fontSize: '0.9rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.6rem',
                          display: 'flex',
                          gap: '0.75rem',
                          lineHeight: '1.4'
                        }}
                      >
                        <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    color: 'white',
                    fontWeight: 600,
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    transform: hovered === `primary-${i}` ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: hovered === `primary-${i}` ? '0 10px 25px rgba(44, 154, 255, 0.3)' : 'none'
                  }}>
                    Get Started →
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* SAMPLE ANALYTICS PREVIEW - WOW SIGNAL #1 */}
          <div className="w-full max-w-5xl mb-12 relative z-10">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What You'll Get: Sample Analytics
            </p>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
              border: '1px solid rgba(44, 154, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '2rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '2rem',
                marginBottom: '2rem'
              }}>
                {/* Overall Score */}
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    margin: '0 auto 1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.2), rgba(0, 224, 255, 0.1))',
                    border: '2px solid var(--accent)'
                  }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>3.8</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Overall</div>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Based on first mock interview</p>
                </div>

                {/* Dimension Scores */}
                {[
                  { label: 'Communication', score: 4.2 },
                  { label: 'Problem Solving', score: 3.5 },
                  { label: 'Confidence', score: 3.7 },
                  { label: 'STAR Structure', score: 3.9 }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {item.label}
                      </span>
                      <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
                        {item.score.toFixed(1)}/5
                      </span>
                    </div>
                    <div style={{
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(item.score / 5) * 100}%`,
                          background: item.score >= 4 ? '#10b981' : item.score >= 3.5 ? '#f59e0b' : '#ef4444',
                          transition: 'width 0.6s ease-out'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Improvement suggestion */}
              <div style={{
                padding: '1.25rem',
                borderRadius: '0.75rem',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#ef4444' }}>→ Focus Area:</strong> Problem-solving improved from 3.1 to 3.5 in second interview. Keep practicing edge cases and optimization techniques.
              </div>
            </div>
          </div>

          {/* SAMPLE RESUME INSIGHTS - WOW SIGNAL #2 */}
          <div className="w-full max-w-5xl mb-12 relative z-10">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              What You'll Get: Resume Analysis
            </p>

            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
              border: '1px solid rgba(44, 154, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '2rem'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem'
              }}>
                {/* Added Keywords */}
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#10b981',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    ✓ Keywords to Add (High Impact)
                  </div>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.6rem'
                  }}>
                    {['Kubernetes', 'CI/CD', 'Terraform', 'Docker', 'Microservices'].map((kw, idx) => (
                      <li
                        key={idx}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '0.375rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#10b981',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      >
                        {kw}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Skills */}
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: '#ef4444',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    ⚠ Missing Skills (Target Role)
                  </div>
                  <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.6rem'
                  }}>
                    {['System Design', 'Distributed Systems', 'Database Optimization'].map((skill, idx) => (
                      <li
                        key={idx}
                        style={{
                          padding: '0.35rem 0.8rem',
                          borderRadius: '0.375rem',
                          background: 'rgba(239, 68, 68, 0.15)',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          color: '#ef4444',
                          fontSize: '0.85rem',
                          fontWeight: 500
                        }}
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ATS Match */}
                <div>
                  <div style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    marginBottom: '1rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    📊 ATS Match Score
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                  }}>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: 'bold',
                      color: 'var(--accent)'
                    }}>
                      78%
                    </div>
                    <div style={{
                      flex: 1,
                      height: '8px',
                      borderRadius: '4px',
                      background: 'rgba(255,255,255,0.1)',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          width: '78%',
                          background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                          transition: 'width 0.6s ease-out'
                        }}
                      />
                    </div>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    vs Backend SDE role at Amazon
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SECONDARY TOOLS */}
          <div className="w-full max-w-5xl mb-12 relative z-10">
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Supporting Tools
            </p>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {secondaryTools.map((opt, i) => (
                <button
                  key={opt.label}
                  onClick={() => handleOptionClick(opt)}
                  onMouseEnter={() => setHovered(`secondary-${i}`)}
                  onMouseLeave={() => setHovered(null)}
                  className="rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between text-left transition-all duration-300 focus:outline-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.06), rgba(0, 224, 255, 0.02))',
                    border: '1px solid rgba(44, 154, 255, 0.15)',
                    cursor: 'pointer',
                    boxShadow: hovered === `secondary-${i}` ? '0 10px 25px rgba(44, 154, 255, 0.15)' : 'none'
                  }}
                >
                  {/* Left Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '2rem' }}>{opt.icon}</div>
                      <div>
                        <h3 style={{
                          fontSize: '1.1rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)',
                          marginBottom: '0.25rem'
                        }}>
                          {opt.label}
                        </h3>
                        <p style={{
                          fontSize: '0.85rem',
                          color: 'var(--text-secondary)',
                          lineHeight: '1.4'
                        }}>
                          {opt.description}
                        </p>
                      </div>
                    </div>

                    {/* Outcomes for secondary */}
                    <ul style={{
                      listStyle: 'none',
                      padding: '0 0 0 3rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '0.6rem'
                    }}>
                      {opt.outcomes.map((outcome, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            gap: '0.5rem'
                          }}
                        >
                          <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>•</span>
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Right CTA */}
                  <div style={{
                    marginTop: '1rem',
                    marginLeft: 'auto',
                    marginRight: 0
                  }}>
                    <div style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '0.5rem',
                      background: 'transparent',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      boxShadow: hovered === `secondary-${i}` ? '0 0 15px rgba(44, 154, 255, 0.3)' : 'none'
                    }}>
                      Try Now →
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* QUICK LINKS - SUPPORTING SECTION */}
          <div className="w-full max-w-5xl mb-12 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* View Interview History */}
              <button
                onClick={() => setShowHistory(true)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(44, 154, 255, 0.08)',
                  border: '1px solid rgba(44, 154, 255, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(44, 154, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(44, 154, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.15)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📊</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Interview History</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>View past sessions</div>
              </button>

              {/* My Profile */}
              <button
                onClick={() => navigate('/profile')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(44, 154, 255, 0.08)',
                  border: '1px solid rgba(44, 154, 255, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(44, 154, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(44, 154, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.15)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>👤</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>My Profile</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>Edit preferences</div>
              </button>

              {/* Track Progress */}
              <button
                onClick={() => navigate('/progress')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  background: 'rgba(44, 154, 255, 0.08)',
                  border: '1px solid rgba(44, 154, 255, 0.15)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(44, 154, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(44, 154, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.15)';
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>📈</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 600 }}>Track Progress</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '0.25rem' }}>View analytics</div>
              </button>
            </div>
          </div>

          {/* FOOTER - UNDER THE HOOD */}
          <div className="w-full max-w-5xl relative z-10 text-center" style={{
            padding: '2rem',
            borderTop: '1px solid rgba(44, 154, 255, 0.15)',
            borderRadius: '1rem'
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto'
            }}>
              <strong style={{ color: 'var(--accent)' }}>Under the hood:</strong> Powered by LLM-based behavior rubrics, multi-dimensional scoring aligned with FAANG hiring practices, ATS keyword extraction, and real-time transcript analysis. Every interview generates actionable improvement plans.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
