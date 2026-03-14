import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import AnamAvatar from '../components/AnamAvatar';
import { API_BASE_URL } from '../config';

export default function AgentPage() {
  const [, navigate] = useLocation();
  const [status, setStatus] = useState('idle'); // idle | loading | active | listening | thinking | scoring | completed | error
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [totalQuestions] = useState(5);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasPreviousSessions, setHasPreviousSessions] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [permissionsChecked, setPermissionsChecked] = useState({
    camera: null,
    microphone: null
  });
  const timerRef = useRef(null);

  // Check for previous sessions on mount
  useEffect(() => {
    const userId = localStorage.getItem('userId') || 'demo-user';
    const sessions = localStorage.getItem(`sessions_${userId}`);
    if (sessions) {
      try {
        const parsedSessions = JSON.parse(sessions);
        setHasPreviousSessions(parsedSessions.length > 0);
      } catch (e) {
        console.log('No previous sessions found');
      }
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (status === 'active') {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  // Check permissions
  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const cameraStatus = await navigator.permissions.query({ name: 'camera' });
        const micStatus = await navigator.permissions.query({ name: 'microphone' });
        setPermissionsChecked({
          camera: cameraStatus.state === 'granted',
          microphone: micStatus.state === 'granted'
        });
      } catch (e) {
        console.log('Permissions API not available');
      }
    };
    checkPermissions();
  }, []);

  const handleStartInterview = async () => {
    setStatus('loading');
    // Simulate interview start
    setTimeout(() => {
      setStatus('active');
      setCurrentQuestion(1);
      setElapsedTime(0);
    }, 1000);
  };

  const handleLeaveInterview = () => {
    if (status === 'active') {
      setShowExitConfirm(true);
    } else {
      navigate('/start');
    }
  };

  const confirmLeave = () => {
    setShowExitConfirm(false);
    setStatus('idle');
    setCurrentQuestion(1);
    setElapsedTime(0);
    navigate('/start');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /* STATE COMPONENT VISUAL INDICATOR */
  const getStateDisplay = () => {
    const stateConfig = {
      idle: { icon: '⏸', label: 'Ready to start', color: 'text-gray-300' },
      loading: { icon: '⏳', label: 'Initializing interview...', color: 'text-yellow-400' },
      active: { icon: '🎙', label: 'Listening to you...', color: 'text-green-400' },
      listening: { icon: '👂', label: 'Listening to your response...', color: 'text-green-400' },
      thinking: { icon: '🧠', label: 'Anam is thinking...', color: 'text-blue-400' },
      scoring: { icon: '📊', label: 'Scoring your answer...', color: 'text-purple-400' },
      completed: { icon: '✅', label: 'Interview complete', color: 'text-emerald-400' },
      error: { icon: '⚠️', label: 'Error occurred', color: 'text-red-400' }
    };
    return stateConfig[status] || stateConfig.idle;
  };

  const stateDisplay = getStateDisplay();

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh' }}>
      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 50
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '400px',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Leave Interview?
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              You're in the middle of question <strong>{currentQuestion} of {totalQuestions}</strong>. Leaving now will end your current session, but your previous responses will be saved.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(44, 154, 255, 0.3)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Continue Interview
              </button>
              <button
                onClick={confirmLeave}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.5rem',
                  background: 'rgba(244, 63, 94, 0.8)',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(44, 154, 255, 0.1)',
        padding: '1rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '2rem'
        }}>
          {/* Logo + Title */}
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
              🧠 Virtual Interview Agent
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Practice with Anam, powered by LLM-based scoring + custom rubrics
            </p>
          </div>

          {/* Progress in header */}
          {status === 'active' && (
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
              <div style={{ textAlign: 'center', borderRight: '1px solid rgba(44, 154, 255, 0.2)', paddingRight: '2rem' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Question</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                  {currentQuestion}/{totalQuestions}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Elapsed</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)' }} id="timer">
                  {formatTime(elapsedTime)}
                </div>
              </div>
            </div>
          )}

          {/* Back Button */}
          <button
            onClick={handleLeaveInterview}
            style={{
              padding: '0.6rem 1.2rem',
              background: 'rgba(44, 154, 255, 0.1)',
              border: '1px solid rgba(44, 154, 255, 0.3)',
              borderRadius: '0.5rem',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(44, 154, 255, 0.2)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(44, 154, 255, 0.1)';
            }}
          >
            ← Back to Menu
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* STEP 1: READY / CONNECTION STATUS */}
        {status === 'idle' && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#10b981',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontWeight: 600, color: 'var(--accent)' }}>CONNECTED & READY</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <strong>Camera and microphone are ready.</strong> Anam will ask you 5 behavioral and technical questions in a structured 10-minute mock interview format. You'll get detailed feedback aligned with FAANG hiring standards.
            </p>
          </div>
        )}

        {/* Main Avatar Area */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
          border: '1px solid rgba(44, 154, 255, 0.2)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem',
          minHeight: 'min(500px, 60vh)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* State Indicator - LARGE AND CLEAR */}
          {status !== 'idle' && (
            <div style={{
              position: 'absolute',
              top: '1.5rem',
              left: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'rgba(44, 154, 255, 0.1)',
              border: '1px solid rgba(44, 154, 255, 0.2)',
              borderRadius: '0.5rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>{stateDisplay.icon}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 500, color: stateDisplay.color }}>
                {stateDisplay.label}
              </span>
            </div>
          )}

          {/* Avatar or Error/Idle State */}
          {error ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <p style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '1.05rem', fontWeight: 500 }}>
                {error}
              </p>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                Check your microphone and camera permissions, or click retry to reconnect.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    padding: '0.75rem 2rem',
                    background: 'var(--accent)',
                    color: 'white',
                    borderRadius: '0.5rem',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  Retry
                </button>
                <a href="/start" style={{
                  padding: '0.75rem 2rem',
                  background: 'transparent',
                  color: 'var(--accent)',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s'
                }}>
                  Back to Menu
                </a>
              </div>
            </div>
          ) : (
            <>
              {status !== 'idle' && <AnamAvatar />}
              {status === 'idle' && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🎤</div>
                  <p style={{
                    fontSize: '1.25rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    marginBottom: '0.5rem'
                  }}>
                    Ready to interview with Anam?
                  </p>
                  <p style={{
                    fontSize: '0.95rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '2rem',
                    maxWidth: '500px',
                    lineHeight: '1.6'
                  }}>
                    Allow camera and microphone access for a real-time interview experience. Takes about 10 minutes.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* PERMISSION CHECKLIST */}
        {status === 'idle' && !error && (
          <div style={{
            background: 'rgba(44, 154, 255, 0.05)',
            border: '1px solid rgba(44, 154, 255, 0.15)',
            borderRadius: '1rem',
            padding: '1.5rem',
            marginBottom: '2rem'
          }}>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Prerequisites
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {permissionsChecked.camera === true ? '✅' : permissionsChecked.camera === false ? '❌' : '⏳'}
                </span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Camera Access</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {permissionsChecked.camera === true ? 'Ready' : permissionsChecked.camera === false ? 'Blocked - see settings' : 'Checking...'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>
                  {permissionsChecked.microphone === true ? '✅' : permissionsChecked.microphone === false ? '❌' : '⏳'}
                </span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Microphone Access</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    {permissionsChecked.microphone === true ? 'Ready' : permissionsChecked.microphone === false ? 'Blocked - see settings' : 'Checking...'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '1.2rem' }}>✅</span>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>Quiet Environment</div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    Minimize background noise
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PRIMARY ACTION - START INTERVIEW BUTTON */}
        {status === 'idle' && !error && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
            <button
              onClick={handleStartInterview}
              style={{
                padding: '1.25rem 2.5rem',
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                color: 'white',
                borderRadius: '0.75rem',
                border: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 10px 25px rgba(44, 154, 255, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.boxShadow = '0 15px 35px rgba(44, 154, 255, 0.4)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.boxShadow = '0 10px 25px rgba(44, 154, 255, 0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              🎬 Start Interview Now
            </button>
          </div>
        )}

        {/* BOTTOM SECTIONS (How it works, Evaluation criteria, Sample feedback) */}
        {status === 'idle' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
            {/* HOW IT WORKS - Outcome Focused */}
            <div style={{
              background: 'rgba(44, 154, 255, 0.05)',
              border: '1px solid rgba(44, 154, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                How It Works
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                  <span><strong>Structured format:</strong> 5 questions mix behavioral (STAR) and technical scenarios</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                  <span><strong>Real-time transcription:</strong> Your speech is analyzed as you talk (no manual text entry)</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                  <span><strong>Get detailed scores:</strong> See your dimension breakdowns (communication, structure, depth, confidence) with improvements captured</span>
                </li>
                <li style={{ display: 'flex', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>✓</span>
                  <span><strong>Compare across attempts:</strong> Track your progress across multiple interview runs and identify patterns</span>
                </li>
              </ul>
            </div>

            {/* WE EVALUATE - EXPLICIT CRITERIA */}
            <div style={{
              background: 'rgba(0, 224, 255, 0.05)',
              border: '1px solid rgba(0, 224, 255, 0.15)',
              borderRadius: '1rem',
              padding: '1.5rem'
            }}>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                We Evaluate
              </h3>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem'
              }}>
                {[
                  { name: 'Communication', desc: 'Clarity & delivery' },
                  { name: 'STAR Structure', desc: 'Situation, Task, Action, Result' },
                  { name: 'Technical Depth', desc: 'Tools, methodology, reasoning' },
                  { name: 'Confidence', desc: 'Competence shown in tone' }
                ].map((criterion, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      background: 'rgba(44, 154, 255, 0.08)',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(44, 154, 255, 0.15)'
                    }}
                  >
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                      {criterion.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {criterion.desc}
                    </div>
                  </div>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* SAMPLE FEEDBACK CARD - THE WOW SIGNAL */}
        {status === 'idle' && (
          <div style={{
            marginTop: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(0, 224, 255, 0.04))',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            borderRadius: '1rem',
            padding: '1.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '1.5rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>📊</span>
              <h3 style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                Sample Feedback (What You'll Get)
              </h3>
            </div>

            {/* Sample Answer Feedback */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <p style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                → Your Answer to "Tell me about a time you solved a difficult problem"
              </p>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                paddingLeft: '1rem',
                borderLeft: '3px solid var(--accent)',
                fontStyle: 'italic',
                marginBottom: '1rem'
              }}>
                "We had a service timeout issue on production. I diagnosed the database query, optimized it using an index, and deployment completed within 30 minutes with no downtime."
              </div>

              {/* Score breakdown */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                {[
                  { label: 'Communication', score: 3.8 },
                  { label: 'STAR Structure', score: 4.2 },
                  { label: 'Technical Depth', score: 3.5 },
                  { label: 'Confidence', score: 4.0 }
                ].map((dim, idx) => (
                  <div key={idx}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.4rem'
                    }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {dim.label}
                      </span>
                      <span style={{
                        fontWeight: 600,
                        color: dim.score >= 4 ? '#10b981' : dim.score >= 3.5 ? '#f59e0b' : '#ef4444'
                      }}>
                        {dim.score.toFixed(1)}/5
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${(dim.score / 5) * 100}%`,
                          background: dim.score >= 4 ? '#10b981' : dim.score >= 3.5 ? '#f59e0b' : '#ef4444'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Feedback comment */}
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                borderRadius: '0.5rem',
                padding: '0.75rem',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: '1.5'
              }}>
                <strong style={{ color: '#ef4444' }}>💡 Insight:</strong> Your STAR structure was strong, but missed quantifying the performance impact (response time reduction, queries optimized per second). Next time, include metrics to amplify credibility.
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION - PREVIOUS SESSIONS LINK */}
        {status === 'idle' && hasPreviousSessions && (
          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center'
          }}>
            <button
              onClick={() => navigate('/analytics')}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                border: '1px dashed rgba(44, 154, 255, 0.3)',
                borderRadius: '0.5rem',
                color: 'var(--accent)',
                fontWeight: 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.target.style.borderColor = 'rgba(44, 154, 255, 0.6)';
                e.target.style.background = 'rgba(44, 154, 255, 0.08)';
              }}
              onMouseOut={(e) => {
                e.target.style.borderColor = 'rgba(44, 154, 255, 0.3)';
                e.target.style.background = 'transparent';
              }}
            >
              📜 View your previous Virtual Agent sessions
            </button>
          </div>
        )}
      </div>

      {/* Inline styles for animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
