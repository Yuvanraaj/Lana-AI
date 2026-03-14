import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../config';

export default function Login() {
  const [, navigate] = useLocation();
  
  // Form state
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(true);
  const [checkingUsername, setCheckingUsername] = useState(false);

  // Clear form on mode change
  useEffect(() => {
    setPassword('');
    setPasswordConfirm('');
    setError('');
    setSuccess('');
  }, [mode]);

  // Check username availability in real-time
  useEffect(() => {
    if (mode === 'register' && username && isValidUsername(username)) {
      const timer = setTimeout(async () => {
        try {
          setCheckingUsername(true);
          const res = await fetch(`${API_BASE_URL}/api/analytics/user/check-username`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username })
          });
          const data = await res.json();
          setUsernameAvailable(data.available);
        } catch (err) {
          console.error('Error checking username:', err);
          setUsernameAvailable(true);
        } finally {
          setCheckingUsername(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [username, mode, API_BASE_URL]);

  // Validation functions
  const isValidUsername = (user) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(user);
  };

  const isValidPassword = (pass) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(pass);
  };

  const isValidEmail = (e) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(e) && e.length <= 255;
  };

  const isValidName = (n) => {
    return n && n.trim().length >= 2 && n.length <= 100;
  };

  // Check if form can be submitted
  const canSubmit = () => {
    if (mode === 'login') {
      return username && password && !loading;
    } else {
      // For registration: require valid username, password, and optional name/email
      return (
        username &&
        isValidUsername(username) &&
        usernameAvailable &&
        password &&
        isValidPassword(password) &&
        password === passwordConfirm &&
        (!name || isValidName(name)) &&
        (!email || isValidEmail(email)) &&
        !loading &&
        !checkingUsername
      );
    }
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username) {
      setError('Username is required');
      return;
    }

    if (!password) {
      setError('Password is required');
      return;
    }

    try {
      setLoading(true);
      console.log('[LOGIN] Attempting login for username:', username);

      const res = await fetch(`${API_BASE_URL}/api/analytics/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      console.log('[LOGIN] Response received:', { status: res.status, ok: res.ok });

      if (!res.ok) {
        setError(data.error || 'Login failed. Please check your username and password.');
        console.error('[LOGIN] Failed:', data.error);
        return;
      }

      console.log('[LOGIN] ✓ Login successful for user:', username);

      // Store user session
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userName', data.user.name || data.user.username);
      localStorage.setItem('userEmail', data.user.email || '');
      localStorage.setItem('lastLogin', new Date().toISOString());

      // Dispatch event to notify Navbar and other components of auth change
      window.dispatchEvent(new CustomEvent('auth-changed'));

      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/start'), 1500);
    } catch (err) {
      const errorMsg = err.message || 'An unknown error occurred';
      setError(`Login error: ${errorMsg}. Check console for details.`);
      console.error('[LOGIN] Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!isValidUsername(username)) {
      setError('Username must be 3-20 letters, numbers, or underscores');
      return;
    }

    if (!usernameAvailable) {
      setError('This username is already taken. Please choose another.');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match');
      return;
    }

    if (name && !isValidName(name)) {
      setError('Please enter a valid name (2-100 characters)');
      return;
    }

    if (email && !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      console.log('[REGISTRATION] Submitting registration form for username:', username);

      const res = await fetch(`${API_BASE_URL}/api/analytics/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          password: password,
          passwordConfirm: passwordConfirm,
          name: name.trim(),
          email: email || null
        })
      });

      const data = await res.json();
      console.log('[REGISTRATION] Response received:', { status: res.status, ok: res.ok, code: data.code });

      if (!res.ok) {
        // Map backend error codes to user-friendly messages
        const errorMap = {
          'USERNAME_EXISTS': 'Username already taken. Please choose another.',
          'WEAK_PASSWORD': 'Password must be at least 8 characters with uppercase, lowercase, and number',
          'PASSWORD_MISMATCH': 'Passwords do not match',
          'INVALID_EMAIL': 'Please enter a valid email address',
          'INVALID_NAME': 'Please enter a valid name (2-100 characters)',
          'MISSING_USERNAME': 'Username is required',
          'MISSING_PASSWORD': 'Password is required',
          'INVALID_USERNAME': 'Username must be 3-20 letters, numbers, or underscores'
        };
        
        const errorMessage = errorMap[data.code] || data.error || 'Registration failed. Please try again.';
        setError(errorMessage);
        console.error('[REGISTRATION] Error:', errorMessage);
        return;
      }

      console.log('[REGISTRATION] ✓ Registration successful for user:', username);

      // Store user session
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userEmail', data.user.email || '');
      localStorage.setItem('createdAt', new Date().toISOString());

      setSuccess('Registration successful! Welcome! Redirecting...');
      setTimeout(() => navigate('/start'), 1500);
    } catch (err) {
      const errorMsg = err.message || 'An unknown error occurred';
      setError(`Registration error: ${errorMsg}. Check console for details.`);
      console.error('[REGISTRATION] Exception:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    if (mode === 'login') {
      handleLogin(e);
    } else {
      handleRegister(e);
    }
  };

  return (
    <div style={{
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* HEADER */}
      <header style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(44, 154, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'opacity 0.3s'
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          🎤 Lana AI
        </button>
        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Interview prep platform
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '500px'
        }}>
          {/* SIGN IN FOCUS */}
          {mode === 'login' && (
            <div>
              {/* TITLE + VALUE PROP */}
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Welcome Back
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1rem' }}>
                  Sign in to sync your mock interviews, resume analyses, and progress dashboards across devices.
                </p>
                <p style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  padding: '0.75rem',
                  background: 'rgba(44, 154, 255, 0.1)',
                  borderRadius: '0.5rem',
                  border: '1px solid rgba(44, 154, 255, 0.2)'
                }}>
                  ✨ Full access to analytics, personalized insights, and interview history
                </p>
              </div>

              {/* LOGIN FORM */}
              <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                {/* USERNAME */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                  }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g., ajith_kumar"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(44, 154, 255, 0.1)',
                      border: error && !username ? '1px solid #ef4444' : '1px solid rgba(44, 154, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = error && !username ? '#ef4444' : 'rgba(44, 154, 255, 0.2)'}
                    disabled={loading}
                  />
                </div>

                {/* PASSWORD */}
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem',
                    color: 'var(--text-primary)'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.getModifierState('CapsLock')) {
                          setCapsLockOn(true);
                        }
                      }}
                      onKeyUp={(e) => {
                        if (!e.getModifierState('CapsLock')) {
                          setCapsLockOn(false);
                        }
                      }}
                      placeholder="Enter your password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                        background: 'rgba(44, 154, 255, 0.1)',
                        border: error && !password ? '1px solid #ef4444' : '1px solid rgba(44, 154, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        fontFamily: 'inherit'
                      }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                      onBlur={(e) => e.target.style.borderColor = error && !password ? '#ef4444' : 'rgba(44, 154, 255, 0.2)'}
                      disabled={loading}
                    />
                    {/* SHOW/HIDE TOGGLE */}
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '1.2rem',
                        transition: 'color 0.3s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--accent)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                      {passwordVisible ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  {/* CAPS LOCK WARNING */}
                  {capsLockOn && (
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.25rem' }}>
                      ⚠️ Caps Lock is on
                    </p>
                  )}
                </div>

                {/* ERROR MESSAGE */}
                {error && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fecaca',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}>
                    <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                    <div>
                      <p style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Login failed</p>
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                {/* SUCCESS MESSAGE */}
                {success && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#a7f3d0',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    ✓ {success}
                  </div>
                )}

                {/* SIGN IN BUTTON */}
                <button
                  type="submit"
                  disabled={!username || !password || loading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: (!username || !password || loading) ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: (!username || !password || loading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                      Signing in...
                    </span>
                  ) : (
                    '🔓 Sign In'
                  )}
                </button>
              </form>

              {/* LINKS & ALTERNATIVES */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {/* FORGOT PASSWORD + REGISTER */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.9rem'
                }}>
                  <button
                    type="button"
                    onClick={() => alert('Password reset coming soon!')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      transition: 'opacity 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Forgot password?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setError('');
                      setSuccess('');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent)',
                      cursor: 'pointer',
                      transition: 'opacity 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Create account?
                  </button>
                </div>

                {/* DIVIDER */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(44, 154, 255, 0.2)' }} />
                  <span>OR</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(44, 154, 255, 0.2)' }} />
                </div>
              </div>
            </div>
          )}

          {/* REGISTER FORM */}
          {mode === 'register' && (
            <div>
              <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  Create Account
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Join to track your interview progress and get personalized insights
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ marginBottom: '2rem' }}>
                {/* FULL NAME */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Ajith Kumar"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(44, 154, 255, 0.1)',
                      border: name && !isValidName(name) ? '1px solid #ef4444' : '1px solid rgba(44, 154, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit'
                    }}
                    disabled={loading}
                  />
                  {name && !isValidName(name) && (
                    <p style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '0.25rem' }}>
                      Name must be 2-100 characters
                    </p>
                  )}
                </div>

                {/* EMAIL */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(44, 154, 255, 0.1)',
                      border: email && !isValidEmail(email) ? '1px solid #ef4444' : '1px solid rgba(44, 154, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit'
                    }}
                    disabled={loading}
                  />
                  {email && !isValidEmail(email) && (
                    <p style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '0.25rem' }}>
                      Invalid email format
                    </p>
                  )}
                </div>

                {/* USERNAME */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Username * <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(3-20 chars)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g., ajith_kumar"
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        paddingRight: checkingUsername ? '2.5rem' : '0.75rem',
                        background: 'rgba(44, 154, 255, 0.1)',
                        border: 
                          username && !isValidUsername(username) ? '1px solid #ef4444' :
                          username && !usernameAvailable ? '1px solid #ef4444' :
                          '1px solid rgba(44, 154, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        fontFamily: 'inherit'
                      }}
                      disabled={loading}
                    />
                    {checkingUsername && (
                      <span style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '0.9rem',
                        animation: 'spin 1s linear infinite'
                      }}>
                        ⟳
                      </span>
                    )}
                  </div>
                  {username && !isValidUsername(username) && (
                    <p style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '0.25rem' }}>
                      3-20 letters, numbers, or underscores only
                    </p>
                  )}
                  {username && isValidUsername(username) && !usernameAvailable && (
                    <p style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '0.25rem' }}>
                      ❌ This username is already taken
                    </p>
                  )}
                  {username && isValidUsername(username) && usernameAvailable && !checkingUsername && (
                    <p style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
                      ✓ Username available
                    </p>
                  )}
                  {checkingUsername && (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Checking availability...
                    </p>
                  )}
                </div>

                {/* PASSWORD */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Password * <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>(Min 8 chars)</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={passwordVisible ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a strong password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.5rem 0.75rem 0.75rem',
                        background: 'rgba(44, 154, 255, 0.1)',
                        border: password && !isValidPassword(password) ? '1px solid #ef4444' : '1px solid rgba(44, 154, 255, 0.2)',
                        borderRadius: '0.5rem',
                        color: 'var(--text-primary)',
                        fontSize: '1rem',
                        transition: 'all 0.3s',
                        fontFamily: 'inherit'
                      }}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                      }}
                    >
                      {passwordVisible ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.5rem'
                  }}>
                    <div style={{ color: password.length >= 8 ? '#a7f3d0' : 'var(--text-secondary)' }}>
                      {password.length >= 8 ? '✓' : '○'} At least 8 chars
                    </div>
                    <div style={{ color: /[A-Z]/.test(password) ? '#a7f3d0' : 'var(--text-secondary)' }}>
                      {/[A-Z]/.test(password) ? '✓' : '○'} Uppercase
                    </div>
                    <div style={{ color: /[a-z]/.test(password) ? '#a7f3d0' : 'var(--text-secondary)' }}>
                      {/[a-z]/.test(password) ? '✓' : '○'} Lowercase
                    </div>
                    <div style={{ color: /\d/.test(password) ? '#a7f3d0' : 'var(--text-secondary)' }}>
                      {/\d/.test(password) ? '✓' : '○'} Number
                    </div>
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.5rem'
                  }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'rgba(44, 154, 255, 0.1)',
                      border: passwordConfirm && passwordConfirm !== password ? '1px solid #ef4444' : '1px solid rgba(44, 154, 255, 0.2)',
                      borderRadius: '0.5rem',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      transition: 'all 0.3s',
                      fontFamily: 'inherit'
                    }}
                    disabled={loading}
                  />
                  {passwordConfirm && passwordConfirm !== password && (
                    <p style={{ fontSize: '0.8rem', color: '#fecaca', marginTop: '0.25rem' }}>
                      Passwords do not match
                    </p>
                  )}
                  {passwordConfirm && passwordConfirm === password && (
                    <p style={{ fontSize: '0.8rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
                      ✓ Passwords match
                    </p>
                  )}
                </div>

                {/* ERROR */}
                {error && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#fecaca',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    ⚠️ {error}
                  </div>
                )}

                {/* SUCCESS */}
                {success && (
                  <div style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '0.5rem',
                    color: '#a7f3d0',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                  }}>
                    ✓ {success}
                  </div>
                )}

                {/* CREATE ACCOUNT BUTTON */}
                <button
                  type="submit"
                  disabled={!canSubmit()}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: !canSubmit() ? 'rgba(107, 114, 128, 0.5)' : 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    color: 'var(--bg-primary)',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    fontSize: '1rem',
                    cursor: !canSubmit() ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
                      Creating account...
                    </span>
                  ) : (
                    '✨ Create Account'
                  )}
                </button>
              </form>

              {/* BACK TO LOGIN */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'opacity 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.opacity = '0.7'}
                  onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Already have an account? Sign In
                </button>
              </div>
            </div>
          )}

          {/* GUEST OPTION */}
          <div style={{
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.1), rgba(0, 224, 255, 0.05))',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            borderRadius: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              Want to try first?
            </p>
            <button
              onClick={() => {
                const guestUserId = 'guest-' + Date.now();
                localStorage.setItem('userId', guestUserId);
                localStorage.setItem('userName', 'Guest User');
                localStorage.setItem('isGuest', 'true');
                navigate('/start');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'transparent',
                border: '1px solid rgba(44, 154, 255, 0.3)',
                color: 'var(--accent)',
                borderRadius: '0.5rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(44, 154, 255, 0.1)';
                e.currentTarget.style.borderColor = 'var(--accent)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.3)';
              }}
            >
              🚀 Continue as Guest
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              Try the platform without saving long-term progress. You can always sign up later to keep your sessions.
            </p>
          </div>

          {/* BENEFITS SECTION */}
          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            background: 'rgba(44, 154, 255, 0.1)',
            borderRadius: '1rem',
            border: '1px solid rgba(44, 154, 255, 0.2)'
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              📊 Why sign in?
            </h3>
            <ul style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              listStyle: 'none',
              padding: 0
            }}>
              <li>✓ <strong>Keep your data.</strong> Your password is securely hashed before storage.</li>
              <li>✓ <strong>Track progress.</strong> Full history of all interviews and sessions across devices.</li>
              <li>✓ <strong>Get insights.</strong> Personalized analytics and trend analysis over time.</li>
              <li>✓ <strong>Sync anywhere.</strong> Access your interview prep from any device, anytime.</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
