import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail'));

  // Listen for auth changes from other components (e.g., Login, Logout)
  useEffect(() => {
    const handleAuthChange = () => {
      setUserId(localStorage.getItem('userId'));
      setUserName(localStorage.getItem('userName'));
      setUserEmail(localStorage.getItem('userEmail'));
      setShowDropdown(false); // Close dropdown on auth change
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => window.removeEventListener('auth-changed', handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    // Dispatch event to notify other components of auth change
    window.dispatchEvent(new CustomEvent('auth-changed'));
    window.location.href = '/login';
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-lg border-b" style={{ borderColor: 'rgba(44, 154, 255, 0.1)', background: 'rgba(15, 23, 42, 0.8)' }}>
      <div className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo & Branding - Professional Brand */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold" style={{
            background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
            boxShadow: '0 0 20px rgba(44, 154, 255, 0.3)',
            color: 'white'
          }}>
            🧠
          </div>
          <div className="flex flex-col items-start">
            <span className="text-base font-bold" style={{ color: 'var(--text-primary)', lineHeight: 1 }}>
              Lana AI
            </span>
            <span className="text-xs font-semibold" style={{ color: 'var(--accent)', letterSpacing: '0.5px', marginTop: '2px' }}>
              Crack Tech Interviews
            </span>
          </div>
        </Link>

        {/* Right Section */}
        <div className="flex gap-3 items-center">
          {userId ? (
            <>
              {/* User Menu Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300"
                  style={{
                    background: 'rgba(44, 154, 255, 0.1)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                  }}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-extrabold shadow rockstar-avatar" style={{
                    background: 'radial-gradient(circle at 70% 30%, #fde68a 60%, #fbbf24 100%)',
                    color: '#3b2f13',
                    border: '2px solid #fbbf24',
                    boxShadow: '0 0 6px 2px #fbbf24',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <span style={{ position: 'absolute', left: 2, top: 2, fontSize: '1.1rem', opacity: 0.7, filter: 'drop-shadow(0 0 1px #fff)' }}>🎸</span>
                    <span style={{ zIndex: 2, fontWeight: 900, letterSpacing: 1 }}>{userName ? userName.charAt(0).toUpperCase() : 'R'}</span>
                  </div>
                  <div className="hidden sm:flex flex-col text-left">
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {userName || 'User'}
                    </span>
                  </div>
                  {/* Arrow removed as requested */}
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl overflow-hidden" style={{
                    background: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(44, 154, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <Link href="/profile" className="block px-4 py-3 text-sm transition-colors flex items-center gap-2" style={{
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid rgba(44, 154, 255, 0.1)'
                    }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                      <span>👤</span> My Profile
                    </Link>
                    <Link href="/progress" className="block px-4 py-3 text-sm transition-colors flex items-center gap-2" style={{
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid rgba(44, 154, 255, 0.1)'
                    }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                      <span>📊</span> Analytics
                    </Link>
                    <Link href="/start" className="block px-4 py-3 text-sm transition-colors flex items-center gap-2" style={{
                      color: 'var(--text-secondary)',
                      borderBottom: '1px solid rgba(44, 154, 255, 0.1)'
                    }} onMouseEnter={(e) => e.target.style.color = 'var(--accent)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}>
                      <span>🚀</span> New Interview
                    </Link>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 text-sm transition-colors flex items-center gap-2"
                      style={{ color: '#ef4444' }}
                    >
                      <span>🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300"
                style={{
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(44, 154, 255, 0.2)'
                }}
              >
                Sign In
              </Link>
              <button
                onClick={() => window.location.href = '/start'}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  boxShadow: '0 0 15px rgba(44, 154, 255, 0.3)'
                }}
              >
                Start Free
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
