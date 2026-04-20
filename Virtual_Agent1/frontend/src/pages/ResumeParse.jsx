import React from "react";
import { useLocation } from "wouter";

/**
 * ResumeParse - Integration Component
 * This page now acts as a shell/header for the PersistentIframe 
 * which is managed at the App level to prevent reloading.
 */
export default function ResumeParse() {
  const [, navigate] = useLocation();

  return (
    <div style={{ 
      background: 'var(--bg-primary)', 
      color: 'var(--text-primary)', 
      minHeight: '80px', // Just enough for the header
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

      {/* 
          The actual iframe content is rendered by PersistentIframe 
          located in App.jsx. This prevents the Streamlit app 
          from reloading every time the user navigates.
      */}
      <div style={{ padding: '0 2rem' }}>
        <div style={{ 
          height: '1px', 
          background: 'linear-gradient(90deg, transparent, rgba(44, 154, 255, 0.2), transparent)',
          marginBottom: '1rem' 
        }} />
      </div>
    </div>
  );
}
