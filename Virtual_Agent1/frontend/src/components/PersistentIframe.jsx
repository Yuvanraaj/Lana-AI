import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from '../config';

/**
 * PersistentIframe - Background Loader
 * Keeps the Streamlit app mounted and warmed up.
 */
export default function PersistentIframe() {
  const [location] = useLocation();
  const isVisible = location === "/resume-parse";
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

        // Fetch portal token for admin unification
        if (userId) {
          try {
            const res = await fetch(`${API_BASE_URL}/api/analytics/portal-token?userId=${userId}`);
            if (res.ok) {
              const data = await res.json();
              if (data.ok && data.token) {
                params.append('atoken', data.token);
                console.log('[Portal Token] Successfully obtained auth token');
              } else {
                console.warn('[Portal Token] No token in response:', data);
              }
            } else {
              console.warn('[Portal Token] Failed to fetch token, status:', res.status);
            }
          } catch (tokenErr) {
            console.error('[Portal Token] Error fetching portal token:', tokenErr.message);
          }
        }
        
        setStreamlitUrl(`${baseStreamlitUrl}/?${params.toString()}`);
      } catch (err) {
        console.error('Failed to fetch portal token:', err);
      }
    }

    initializeAuth();
  }, [userId, userName, userEmail, userRole]);

  // If we are not on the resume-parse route and it's not loaded yet, 
  // we still want to keep it in the DOM but hidden to start loading.
  
  return (
    <div style={{
      display: isVisible ? 'block' : 'none',
      position: isVisible ? 'relative' : 'fixed',
      top: isVisible ? '0' : '-9999px',
      left: isVisible ? '0' : '-9999px',
      width: '100%',
      height: isVisible ? 'calc(100vh - 120px)' : '0',
      minHeight: isVisible ? '800px' : '0',
      zIndex: isVisible ? 1 : -1,
      overflow: 'hidden',
      background: 'var(--bg-primary)'
    }}>
      {loading && isVisible && (
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
            width: '40px',
            height: '40px',
            border: '3px solid rgba(44, 154, 255, 0.1)',
            borderTop: '3px solid var(--accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Waking up AI Engine...</p>
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
  );
}
