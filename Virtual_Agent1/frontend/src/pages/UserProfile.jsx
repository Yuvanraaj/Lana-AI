import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../config';

export default function UserProfile() {
  const [, navigate] = useLocation();
  const userId = localStorage.getItem('userId');
  
  // Enforce auth
  useEffect(() => {
    if (!userId) {
      navigate('/login');
    }
  }, [userId, navigate]);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [performance, setPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', target_role: '', experience_level: '', focus_areas: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        navigate('/login');
        return;
      }

      // Fetch user profile
      const userRes = await fetch(`${API_BASE_URL}/api/analytics/user/${userId}`);
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
        setStats(userData.user.stats);
        setEditForm({
          name: userData.user.name || '',
          target_role: userData.user.target_role || '',
          experience_level: userData.user.experience_level || 'Fresher',
          focus_areas: userData.user.focus_areas || ''
        });
      }

      // Fetch performance stats
      const perfRes = await fetch(`${API_BASE_URL}/api/analytics/user/${userId}/performance`);
      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setPerformance(perfData.performance);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      const res = await fetch(`${API_BASE_URL}/api/analytics/user/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        await fetchUserData();
        setShowEdit(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('targetRole');
    navigate('/login');
  };

  const startPracticeInterview = async () => {
    try {
      const userId = localStorage.getItem('userId');
      // Use a valid role preset ID instead of the display name
      // Valid options: sde1-product, sde1-backend, sde1-frontend, sde1-fullstack, devops, qa, pm
      const selectedRole = 'sde1-product'; // Default to SDE1 Product for all users
      
      // Create a new interview session
      const res = await fetch(`${API_BASE_URL}/api/interview/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          role: selectedRole,
          jobDescription: '',
          isGuest: false
        })
      });

      if (res.ok) {
        const data = await res.json();
        // Store session details for the interview page
        localStorage.setItem('selectedRole', selectedRole);
        localStorage.setItem('currentSessionId', data.sessionId);
        // Navigate to agent page to start the interview
        navigate('/agent');
      } else {
        console.error('Failed to create interview session');
        alert('Failed to start practice interview. Please try again.');
      }
    } catch (err) {
      console.error('Error starting practice interview:', err);
      alert('Error starting practice interview: ' + err.message);
    }
  };

  // Check if user has any data
  const hasInterviews = stats && stats.total_interviews > 0;

  if (loading) {
    return (
      <div style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            border: '2px solid rgba(44, 154, 255, 0.3)',
            borderTop: '2px solid var(--accent)',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* HEADER WITH LOGOUT BUTTON */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              👤 My Profile
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
              Manage your interview prep account and view high-level stats
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.75rem 1.5rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: '0.5rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s',
              whiteSpace: 'nowrap'
            }}
            onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.25)'}
            onMouseOut={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.15)'}
          >
            🚪 Logout
          </button>
        </div>

        {/* PROFILE CARD - PROMINENT */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.12), rgba(0, 224, 255, 0.06))',
          border: '1px solid rgba(44, 154, 255, 0.3)',
          borderRadius: '1.5rem',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto',
            gap: '2rem',
            alignItems: 'start'
          }}>
            {/* AVATAR + NAME + EMAIL */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '1rem',
              background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 'bold',
              flexShrink: 0
            }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : '👤'}
            </div>

            {/* PROFILE INFO */}
            <div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                {user?.name || 'User'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                {user?.email}
              </p>
              
              {/* TARGET ROLE + EXPERIENCE */}
              <div style={{
                display: 'flex',
                gap: '2rem',
                flexWrap: 'wrap'
              }}>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    🎯 Target Role(s)
                  </p>
                  <p style={{ fontWeight: 600, color: 'var(--accent)' }}>
                    {user?.target_role || 'Not set'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    📊 Experience Level
                  </p>
                  <p style={{ fontWeight: 600, color: 'var(--accent-2)' }}>
                    {user?.experience_level || 'Fresher'}
                  </p>
                </div>
                {user?.focus_areas && (
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      💡 Focus Areas
                    </p>
                    <p style={{ fontWeight: 600, color: '#10b981' }}>
                      {user.focus_areas}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* EDIT BUTTON */}
            <button
              onClick={() => setShowEdit(!showEdit)}
              style={{
                padding: '0.75rem 1.5rem',
                background: showEdit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(44, 154, 255, 0.15)',
                border: showEdit ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(44, 154, 255, 0.3)',
                color: showEdit ? '#ef4444' : 'var(--accent)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s',
                whiteSpace: 'nowrap'
              }}
              onMouseOver={(e) => {
                e.target.style.background = showEdit ? 'rgba(239, 68, 68, 0.25)' : 'rgba(44, 154, 255, 0.25)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = showEdit ? 'rgba(239, 68, 68, 0.15)' : 'rgba(44, 154, 255, 0.15)';
              }}
            >
              {showEdit ? '❌ Cancel' : '✏️ Edit Profile'}
            </button>
          </div>

          {/* EDIT FORM */}
          {showEdit && (
            <div style={{
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid rgba(44, 154, 255, 0.2)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  placeholder="Enter your full name"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(44, 154, 255, 0.2)'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>
                  Target Role(s)
                </label>
                <input
                  type="text"
                  value={editForm.target_role}
                  onChange={(e) => setEditForm({...editForm, target_role: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  placeholder="e.g., Backend Engineer, DevOps"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(44, 154, 255, 0.2)'}
                />
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>
                  Experience Level
                </label>
                <select
                  value={editForm.experience_level}
                  onChange={(e) => setEditForm({...editForm, experience_level: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                >
                  <option value="Fresher">Fresher (0-1 yrs)</option>
                  <option value="Junior">Junior (1-3 yrs)</option>
                  <option value="Mid">Mid-Level (3-6 yrs)</option>
                  <option value="Senior">Senior (6+ yrs)</option>
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '0.5rem',
                  color: 'var(--text-secondary)'
                }}>
                  Focus Areas (optional)
                </label>
                <input
                  type="text"
                  value={editForm.focus_areas}
                  onChange={(e) => setEditForm({...editForm, focus_areas: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    transition: 'all 0.3s'
                  }}
                  placeholder="e.g., System Design, DSA"
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(44, 154, 255, 0.2)'}
                />
              </div>
              <button
                onClick={handleUpdateProfile}
                style={{
                  gridColumn: showEdit ? 'span 2' : 'auto',
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'var(--bg-primary)',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                💾 Save Changes
              </button>
            </div>
          )}
        </div>

        {/* KEY METRICS SECTION - SINGLE LOCATION */}
        {hasInterviews ? (
          <>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📊 Your Stats
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <MetricCard
                icon="🎤"
                label="Total Interviews"
                value={stats?.total_interviews || 0}
                subtext="Mock interviews completed"
                tooltip="Number of virtual agent interviews you have completed"
              />
              <MetricCard
                icon="📈"
                label="Average Score"
                value={Math.round(stats?.average_score || 0)}
                suffix="/100"
                subtext="Mean across all dimensions"
                tooltip="Mean score across Communication, Technical Depth, Structure, and Confidence"
                color="accent"
              />
              <MetricCard
                icon="🏅"
                label="Best Score"
                value={Math.round(stats?.best_score || 0)}
                suffix="/100"
                subtext="Your personal best"
                tooltip="Your highest score achieved in any single interview"
                color="success"
              />
              <MetricCard
                icon="⏱️"
                label="Practice Time"
                value={stats?.total_practice_time ? Math.floor(stats.total_practice_time / 60) : 0}
                suffix="min"
                subtext="Total invested"
                tooltip="Total time spent in mock interviews and chatbot practice sessions"
                color="secondary"
              />
            </div>

            {/* PERFORMANCE BY MODE */}
            {performance && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
                border: '1px solid rgba(44, 154, 255, 0.2)',
                borderRadius: '1rem',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem' }}>
                  📌 Performance by Practice Mode
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem'
                }}>
                  {performance.bySessionType && Object.entries(performance.bySessionType).map(([type, data]) => (
                    <div
                      key={type}
                      style={{
                        padding: '1rem',
                        background: 'rgba(44, 154, 255, 0.1)',
                        border: '1px solid rgba(44, 154, 255, 0.2)',
                        borderRadius: '0.5rem'
                      }}
                    >
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                        {type === 'interview' ? '🤖 Virtual Agent' : type === 'chatbot' ? '💬 Chatbot' : '📄 Resume'}
                      </p>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
                        {data.avgScore.toFixed(1)}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {data.count} session{data.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          /* EMPTY STATE */
          <div style={{
            background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
            border: '2px solid rgba(44, 154, 255, 0.2)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              No Interviews Yet
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              You haven't completed any interviews yet. Start your first mock interview to track your progress, see detailed analytics, and get personalized recommendations.
            </p>
            <button
              onClick={startPracticeInterview}
              style={{
                padding: '0.75rem 2rem',
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                color: 'var(--bg-primary)',
                border: 'none',
                borderRadius: '0.5rem',
                fontWeight: 600,
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(44, 154, 255, 0.3)'
              }}
            >
              🚀 Start Your First Mock Interview
            </button>
          </div>
        )}

        {/* CTA SECTION - LINKS TO OTHER FEATURES */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem'
        }}>
          <CTAButton
            icon="🎤"
            title="Practice Interview"
            description="Go to Virtual Agent mode"
            onClick={startPracticeInterview}
          />
          <CTAButton
            icon="💬"
            title="AI Chatbot"
            description="Practice specific questions"
            onClick={() => navigate('/chatbot')}
          />
          <CTAButton
            icon="📄"
            title="Resume Analysis"
            description="Get ATS and keyword feedback"
            onClick={() => navigate('/resume-parse')}
          />
          <CTAButton
            icon="📊"
            title="Detailed Analytics"
            description="View trends and insights"
            onClick={() => navigate('/progress')}
          />
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

// HELPER COMPONENTS
const MetricCard = ({ icon, label, value, suffix = '', subtext = '', tooltip = '', color = 'default' }) => {
  const colorMap = {
    default: 'rgba(44, 154, 255, 0.15)',
    accent: 'rgba(0, 224, 255, 0.15)',
    success: 'rgba(16, 185, 129, 0.15)',
    secondary: 'rgba(245, 158, 11, 0.15)'
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.12), rgba(0, 224, 255, 0.06))',
        border: '1px solid rgba(44, 154, 255, 0.2)',
        borderRadius: '1rem',
        padding: '1.5rem',
        position: 'relative',
        cursor: tooltip ? 'help' : 'default'
      }}
      title={tooltip}
    >
      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {icon} {label}
      </p>
      <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)', marginBottom: '0.5rem' }}>
        {value}{suffix}
      </p>
      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
        {subtext}
      </p>
    </div>
  );
};

const CTAButton = ({ icon, title, description, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.1), rgba(0, 224, 255, 0.05))',
      border: '1px solid rgba(44, 154, 255, 0.2)',
      borderRadius: '1rem',
      padding: '1.5rem',
      textAlign: 'left',
      cursor: 'pointer',
      transition: 'all 0.3s'
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.borderColor = 'var(--accent)';
      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(44, 154, 255, 0.2), rgba(0, 224, 255, 0.1))';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.2)';
      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(44, 154, 255, 0.1), rgba(0, 224, 255, 0.05))';
    }}
  >
    <p style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</p>
    <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
      {title}
    </p>
    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
      {description}
    </p>
  </button>
);
