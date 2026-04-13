import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from '../config';

/**
 * ResumeParse - Integration Component
 * Embeds the Standalone AI Resume Analyzer (Streamlit) into the Virtual Agent.
 */
export default function ResumeParse() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);
  const [streamlitUrl, setStreamlitUrl] = useState("http://localhost:8501");

  // Get user data from localStorage for unified auth
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole') || 'user';

  useEffect(() => {
    async function initializeAuth() {
      try {
        const baseStreamlitUrl = "http://localhost:8501";
        
        // PRE-WARM: Ping the Streamlit server immediately to wake it up
        fetch(baseStreamlitUrl, { mode: 'no-cors' }).catch(() => {});
        
        const params = new URLSearchParams();
        if (userId) params.append('uid', userId);
        if (userName) params.append('name', userName);
        if (userEmail) params.append('email', userEmail);
        if (userRole) params.append('role', userRole);

        // Fetch portal token for admin unification (if applicable)
        if (userId) {
          const res = await fetch(`${API_BASE_URL}/api/analytics/portal-token?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.token) {
              params.append('atoken', data.token);
            }
          }
        }
        
        setStreamlitUrl(`${baseStreamlitUrl}/?${params.toString()}`);
      } catch (err) {
        console.error('Failed to fetch portal token:', err);
      }
      // Note: We deliberately do NOT call setLoading(false) here.
      // We want the loading spinner to stay visible until the iframe finishes loading.
      // setLoading(false) is called in the iframe's onLoad handler.
    }

    initializeAuth();
  }, [userId, userName, userEmail, userRole, API_BASE_URL]);

  return (
    <div style={{ 
      background: 'var(--bg-primary)', 
      color: 'var(--text-primary)', 
      minHeight: 'calc(100vh - 80px)', 
      display: 'flex', 
      flexDirection: 'column' 
    }}>
      {/* HEADER SECTION */}
      <div style={{
        padding: '2rem 1rem 1rem 1rem',
        maxWidth: '1400px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '1.875rem', 
            fontWeight: 800, 
            background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', 
            WebkitBackgroundClip: 'text', 
            color: 'transparent',
            marginBottom: '0.5rem' 
          }}>
            AI Resume Analyzer
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Powered by advanced NLP models to optimize your professional profile.
          </p>
        </div>
        
        <button 
          onClick={() => navigate('/start')}
          style={{
            padding: '0.6rem 1.2rem',
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
          ← Back to Tools
        </button>
      </div>

      {/* IFRAME CONTAINER */}
      <div style={{
        flex: 1,
        margin: '1rem auto 2rem auto',
        maxWidth: '1400px',
        width: '95%',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: '1.25rem',
        border: '1px solid rgba(44, 154, 255, 0.1)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
        minHeight: '800px'
      }}>
        {loading && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-primary)',
            zIndex: 10
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid rgba(44, 154, 255, 0.1)',
              borderTop: '3px solid var(--accent)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginBottom: '1rem'
            }} />
            <style>{`
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Initializing Analyzer Engine...</p>
          </div>
        )}

        <iframe
          src={streamlitUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            minHeight: '800px'
          }}
          title="AI Resume Analyzer"
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* FOOTER INFO */}
      <div style={{
        textAlign: 'center',
        padding: '1rem',
        color: 'var(--text-tertiary)',
        fontSize: '0.8rem'
      }}>
        Note: The analyzer runs on a dedicated secure server (localhost:8501).
      </div>
    </div>
  );
}
