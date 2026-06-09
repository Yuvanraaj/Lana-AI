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
    description: "AI-powered resume scoring, skill gaps, ATS optimization, and career planning.",
    outcomes: [
      "5-dimension AI scoring: skills, experience, education, formatting & achievements",
      "Missing keywords, ATS compliance tips, and priority adjustments",
      "Role match predictions and personalized course recommendations"
    ],
    icon: "📊",
    badge: "ANALYSIS",
    badgeColor: "from-emerald-500 to-teal-500",
    gradient: "from-emerald-600/20 to-teal-600/20",
    border: "border-emerald-500/30 hover:border-emerald-400",
    glow: "hover:shadow-emerald-500/20",
  },
  {
    label: "Code Practice",
    path: "/code-practice",
    description: "Random LeetCode problems with real-time coding.",
    outcomes: [
      "Practice coding with LeetCode problems",
      "Support for multiple programming languages",
      "Challenge yourself with random difficulty levels"
    ],
    icon: "💻",
    badge: "CODING",
    badgeColor: "from-orange-500 to-red-500",
    gradient: "from-orange-600/20 to-red-600/20",
    border: "border-orange-500/30 hover:border-orange-400",
    glow: "hover:shadow-orange-500/20",
  },
];

export default function SelectMode() {
  const [, navigate] = useLocation();
  const [hovered, setHovered] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showModeChoice, setShowModeChoice] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [customJD, setCustomJD] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeUploaded, setResumeUploaded] = useState(false); // New: Track success
  const [resumeError, setResumeError] = useState(null);
  const userId = localStorage.getItem('userId') || 'demo-user';

  const roles = [
    { id: 'sde1-backend', label: 'SDE-1 Backend', icon: '⚙️' },
    { id: 'sde1-frontend', label: 'SDE-1 Frontend', icon: '🎨' },
    { id: 'sde1-fullstack', label: 'SDE-1 Fullstack', icon: '🔗' },
    { id: 'sde1-product', label: 'SDE-1 Product', icon: '📱' },
    { id: 'devops', label: 'DevOps Engineer', icon: '🚀' },
    { id: 'data-engineer', label: 'Data Engineer', icon: '📊' },
  ];

  const handleInterviewClick = () => setShowModeChoice(true);
  const handleRoleSelect = (roleId) => setSelectedRole(roleId);

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

  const handleChooseRole = () => {
    setShowModeChoice(false);
    setShowRoleSelector(true);
  };

  const handleChooseResume = () => {
    setShowModeChoice(false);
    setShowResumeUpload(true);
  };

  const handleResumeUpload = async (file) => {
    if (!file) return;

    try {
      setResumeUploading(true);
      setResumeError(null);
      setResumeUploaded(false);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('userId', userId);

      const uploadRes = await fetch(`${API_BASE_URL}/api/parse-resume`, {
        method: 'POST',
        body: formData
      });

      if (!uploadRes.ok) throw new Error(`Upload failed: ${uploadRes.statusText}`);

      const result = await uploadRes.json();
      const resumeData = result.feedback || result;

      if (result.success && resumeData && resumeData.name) {
        localStorage.setItem('resumeData', JSON.stringify(resumeData));
        localStorage.setItem('selectedRole', 'resume-based');
        localStorage.setItem('selectedRoleLabel', 'Resume-Based Interview');
        
        setResumeUploaded(true); // Mark as uploaded
        setTimeout(() => {
          setShowResumeUpload(false);
          navigate('/interview');
        }, 1000); // Small delay to show "Resume Uploaded"
      } else {
        throw new Error(result.error || 'No resume data returned');
      }
    } catch (e) {
      setResumeError(e.message || 'Failed to upload resume');
    } finally {
      setResumeUploading(false);
    }
  };

  return (
    <div>
      {/* Mode Choice Modal */}
      {showModeChoice && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '2rem', maxWidth: '700px', width: '90%', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>Choose Interview Type</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', textAlign: 'center' }}>How would you like to be interviewed?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              <button onClick={handleChooseRole} style={{ padding: '2rem', borderRadius: '10px', border: '2px solid rgba(44, 154, 255, 0.4)', background: 'rgba(44, 154, 255, 0.05)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>👔</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>By Role</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Choose a target role (Backend, Frontend, etc.) and be interviewed for that position.</p>
              </button>
              <button onClick={handleChooseResume} style={{ padding: '2rem', borderRadius: '10px', border: '2px solid rgba(34, 197, 94, 0.4)', background: 'rgba(34, 197, 94, 0.05)', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.3s', textAlign: 'center' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📄</div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>By Resume</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>Upload your resume and be interviewed based on your actual experience.</p>
              </button>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button onClick={() => setShowModeChoice(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Role Selector Modal */}
      {showRoleSelector && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '2rem', maxWidth: '600px', width: '90%', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Select Target Role</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {roles.map((role) => (
                <button key={role.id} onClick={() => handleRoleSelect(role.id)} style={{ padding: '1.25rem', borderRadius: '8px', border: selectedRole === role.id ? '2px solid var(--accent)' : '1px solid var(--border-color)', background: selectedRole === role.id ? 'rgba(44, 154, 255, 0.1)' : 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{role.icon}</div>
                  <div>{role.label}</div>
                </button>
              ))}
            </div>
            <div style={{ padding: '1rem', borderRadius: '8px', border: selectedRole === 'custom' ? '2px solid var(--accent)' : '1px solid var(--border-color)', background: selectedRole === 'custom' ? 'rgba(44, 154, 255, 0.1)' : 'var(--bg-primary)', marginBottom: '1.5rem' }}>
              <button onClick={() => handleRoleSelect('custom')} style={{ width: '100%', padding: '1rem', background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600, textAlign: 'left' }}>✨ Custom Role</button>
              {selectedRole === 'custom' && (
                <textarea placeholder="Describe your target role..." value={customJD} onChange={(e) => setCustomJD(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', marginTop: '0.75rem', minHeight: '80px' }} />
              )}
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setShowRoleSelector(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
              <button onClick={handleConfirmRole} disabled={!selectedRole} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: 'none', background: selectedRole ? 'var(--accent)' : 'var(--border-color)', color: 'white', cursor: selectedRole ? 'pointer' : 'not-allowed', fontWeight: 600 }}>Continue</button>
            </div>
          </div>
        </div>
      )}

      {/* Resume Upload Modal - REFINED */}
      {showResumeUpload && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '2rem', maxWidth: '500px', width: '90%', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>📄 Resume Upload</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Lana will analyze your resume to generate personalized interview scenarios.</p>

            {resumeError && (
              <div style={{ padding: '1rem', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', marginBottom: '1rem', fontSize: '0.9rem' }}>✗ {resumeError}</div>
            )}

            <label style={{ display: 'block', padding: '2rem', borderRadius: '8px', border: '2px dashed rgba(44, 154, 255, 0.4)', background: 'rgba(44, 154, 255, 0.05)', cursor: resumeUploading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', textAlign: 'center', opacity: resumeUploading ? 0.6 : 1 }}>
              <input type="file" accept=".pdf,.docx" onChange={(e) => handleResumeUpload(e.target.files?.[0])} disabled={resumeUploading} style={{ display: 'none' }} />
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{resumeUploading ? '⏳' : resumeUploaded ? '✅' : '📤'}</div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                {resumeUploading ? 'Synthesizing...' : resumeUploaded ? 'Resume Uploaded' : 'Upload Resume'}
              </p>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>PDF or DOCX (max 5MB)</p>
            </label>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button onClick={() => { setShowResumeUpload(false); setResumeError(null); }} disabled={resumeUploading} style={{ flex: 1, padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Main Home Page Layout */}
      {!showHistory && (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
          <div className="fixed top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(44, 154, 255, 0.1) 0%, transparent 70%)', opacity: 0.4 }} />
          
          {/* HERO */}
          <div className="text-center mb-12 relative z-10 max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 leading-tight" style={{ color: 'var(--text-primary)' }}>
              Prepare Smarter.<br />
              <span style={{ background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent' }}>
                Crack Tech Interviews with AI
              </span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '1rem auto' }}>
              Practice real interviews, analyze your resume, and track your progress in one place.
            </p>
          </div>

          {/* PRIMARY ACTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-12 relative z-10">
            {primaryActions.map((opt, i) => (
              <button key={opt.label} onClick={() => handleOptionClick(opt)} onMouseEnter={() => setHovered(`primary-${i}`)} onMouseLeave={() => setHovered(null)} className="rounded-2xl p-8 flex flex-col items-start text-left transition-all duration-300" style={{ background: 'rgba(44, 154, 255, 0.08)', border: '1px solid rgba(44, 154, 255, 0.2)', cursor: 'pointer', transform: hovered === `primary-${i}` ? 'translateY(-4px)' : 'none', boxShadow: hovered === `primary-${i}` ? '0 20px 40px rgba(44, 154, 255, 0.2)' : 'none' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>{opt.icon}</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{opt.label}</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>{opt.description}</p>
                <div style={{ width: '100%', padding: '0.75rem', borderRadius: '0.75rem', background: 'linear-gradient(90deg, var(--accent), var(--accent-2))', color: 'white', fontWeight: 600, textAlign: 'center' }}>Get Started →</div>
              </button>
            ))}
          </div>

          {/* SECONDARY TOOLS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl mb-12 relative z-10">
            {secondaryTools.map((opt, i) => (
              <button key={opt.label} onClick={() => handleOptionClick(opt)} className="rounded-xl p-6 flex items-center gap-4 transition-all" style={{ background: 'rgba(44, 154, 255, 0.05)', border: '1px solid rgba(44, 154, 255, 0.15)', cursor: 'pointer' }}>
                <div style={{ fontSize: '2rem' }}>{opt.icon}</div>
                <div className="text-left">
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{opt.description}</p>
                </div>
              </button>
            ))}
          </div>

          {/* SUPPORT LINKS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-5xl relative z-10">
            <button onClick={() => setShowHistory(true)} className="p-4 rounded-xl border transition-all" style={{ background: 'rgba(44, 154, 255, 0.08)', border: '1px solid rgba(44, 154, 255, 0.15)', color: 'var(--text-primary)' }}>📊 History</button>
            <button onClick={() => navigate('/profile')} className="p-4 rounded-xl border transition-all" style={{ background: 'rgba(44, 154, 255, 0.08)', border: '1px solid rgba(44, 154, 255, 0.15)', color: 'var(--text-primary)' }}>👤 Profile</button>
            <button onClick={() => navigate('/progress')} className="p-4 rounded-xl border transition-all" style={{ background: 'rgba(44, 154, 255, 0.08)', border: '1px solid rgba(44, 154, 255, 0.15)', color: 'var(--text-primary)' }}>📈 Progress</button>
          </div>
        </div>
      )}

      {showHistory && (
        <InterviewHistory userId={userId} onViewSession={(sessionId) => { localStorage.setItem('viewSessionId', sessionId); setShowHistory(false); navigate('/analytics'); }} onClose={() => setShowHistory(false)} />
      )}
    </div>
  );
}
