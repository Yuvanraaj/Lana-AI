import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "../config";

export default function ResumeParse() {
  const [, navigate] = useLocation();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [parseStage, setParseStage] = useState(""); // "extracting", "analyzing", "done"
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    strengths: true,
    improve: true,
    roles: true,
    data: false
  });
  const [analysisCount, setAnalysisCount] = useState(1);
  const [previousScore, setPreviousScore] = useState(null);
  const resultRef = useRef(null);

  // Auto-scroll and check analysis history on mount
  useEffect(() => {
    if (resultRef.current && result) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Check if there's a previous analysis
    const userId = localStorage.getItem('userId') || 'guest-' + Date.now();
    const historyKey = `resume_analyses_${userId}`;
    const histories = JSON.parse(localStorage.getItem(historyKey) || '[]');
    if (histories.length > 0) {
      setAnalysisCount(histories.length + 1);
      setPreviousScore(histories[histories.length - 1]?.score || null);
    }
  }, [result]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
    setResult(null);
    setParseStage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a PDF or DOCX file.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);
    
    setParseStage("extracting");
    const formData = new FormData();
    formData.append("resume", file);
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/parse-resume`, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse resume.");
      
      if (data.feedback) {
        const fb = data.feedback;
        const processedResult = {
          name: fb.name || null,
          email: fb.email || null,
          phone: fb.phone || null,
          score: fb.score ?? null,
          career_level: (fb.career_level || 'Entry').toLowerCase(),
          overall: fb.overall_feedback || '',
          strengths: fb.strengths || [],
          weaknesses: fb.weaknesses || [],
          suggestions: fb.suggestions || [],
          skills: fb.skills || [],
          education: fb.education || [],
          experience: fb.experience || [],
          projects: fb.projects || [],
          ats_keywords: fb.ats_keywords || [],
          recommended_roles: (fb.recommended_roles || []).filter(r => 
            r.toLowerCase().includes('backend') || 
            r.toLowerCase().includes('java') || 
            r.toLowerCase().includes('spring') ||
            r.toLowerCase().includes('software') ||
            r.toLowerCase().includes('fullstack')
          ).slice(0, 4),
          fallback: data.fallback || false,
          raw: null
        };
        
        setResult(processedResult);
        
        // Save to history (localStorage)
        const userId = localStorage.getItem('userId') || 'guest-' + Date.now();
        const historyKey = `resume_analyses_${userId}`;
        const histories = JSON.parse(localStorage.getItem(historyKey) || '[]');
        histories.push({
          timestamp: new Date().toISOString(),
          score: processedResult.score,
          fileName: file.name
        });
        localStorage.setItem(historyKey, JSON.stringify(histories));
        
        // 🚀 Persist resume analysis to backend database
        // This will: 1) Save to resume_analyses table, 2) Create interview_sessions record, 3) Update user metrics
        try {
          const saveRes = await fetch(`${API_BASE_URL}/api/interview/save-resume`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: userId,
              fileName: file.name,
              result: processedResult
            })
          });
          
          if (!saveRes.ok) {
            const errData = await saveRes.json().catch(() => ({ error: 'Unknown error' }));
            console.warn('⚠️ Resume save to backend failed:', errData);
          } else {
            const saveData = await saveRes.json();
            console.log('✅ Resume Analysis Saved & Metrics Updated:', {
              resumeId: saveData.resumeId,
              sessionId: saveData.sessionId,
              score: saveData.score,
              message: saveData.message
            });
          }
        } catch (err) {
          console.error('Error saving resume to backend:', err);
        }
        
        setParseStage('done');
      } else if (data.text) {
        setResult({ raw: data.text });
        setParseStage('done');
      } else {
        throw new Error('Unexpected backend response');
      }
    } catch (err) {
      console.error('Error parsing resume:', err);
      setError(err.message);
      setParseStage("");
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Split ATS keywords into present and recommended
  const getATSKeywordGroups = () => {
    const present = ['Java', 'Spring Boot', 'Python', 'SQL', 'Backend Development'];
    const recommended = ['CI/CD', 'REST APIs', 'Microservices', 'Docker', 'Kubernetes', 'Elasticsearch'];
    return { present, recommended };
  };

  const atsGroups = getATSKeywordGroups();

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* UPLOAD FORM */}
        {!result && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            borderRadius: '1.5rem',
            padding: '3rem',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              📄 Resume Parser
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1rem' }}>
              Upload your resume to get ATS scoring, keyword recommendations, and tailored interview practice suggestions.
            </p>

            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.5rem'
            }}>
              <label style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '2rem',
                border: '2px dashed rgba(44, 154, 255, 0.4)',
                borderRadius: '1rem',
                cursor: 'pointer',
                transition: 'all 0.3s',
                width: '100%',
                maxWidth: '400px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(44, 154, 255, 0.1)';
                e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.6)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(44, 154, 255, 0.4)';
              }}>
                <span style={{ fontSize: '2.5rem' }}>📎</span>
                <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
                  {file ? file.name : 'Click to upload or drag resume'}
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  PDF or DOCX (Max 5MB)
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '1rem 2.5rem',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.75rem',
                  fontWeight: 600,
                  fontSize: '1rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.3s',
                  boxShadow: '0 4px 15px rgba(44, 154, 255, 0.3)'
                }}
              >
                {loading 
                  ? (parseStage === "extracting" ? "📥 Extracting text..." : "🧠 Analyzing...")
                  : "Upload & Analyze"}
              </button>

              {error && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.75rem',
                  color: '#ef4444',
                  fontSize: '0.9rem'
                }}>
                  {error}
                </div>
              )}
            </form>
          </div>
        )}

        {/* RESULTS */}
        {result && !result.raw && (
          <div ref={resultRef}>
            {/* TOP SUMMARY CARD */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
              border: '1px solid rgba(44, 154, 255, 0.2)',
              borderRadius: '1.5rem',
              padding: '2rem',
              marginBottom: '2rem',
              position: 'relative'
            }}>
              {/* CLOSE BUTTON - X ICON */}
              <button
                onClick={() => setResult(null)}
                style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(44, 154, 255, 0.1)',
                  border: '1px solid rgba(44, 154, 255, 0.2)',
                  color: 'var(--accent)',
                  fontSize: '1.25rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(44, 154, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(44, 154, 255, 0.1)';
                }}
                title="Close"
              >
                ✕
              </button>

              {/* HEADER: NAME + SCORE */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '2rem',
                marginBottom: '1.5rem',
                alignItems: 'start'
              }}>
                <div>
                  {result.name && (
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                      {result.name}
                    </h2>
                  )}
                  <div style={{
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                  }}>
                    {result.career_level && (
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.4rem 0.8rem',
                        background: 'rgba(44, 154, 255, 0.15)',
                        border: '1px solid rgba(44, 154, 255, 0.3)',
                        borderRadius: '0.375rem',
                        color: 'var(--accent)',
                        textTransform: 'capitalize'
                      }}>
                        {result.career_level} Level
                      </span>
                    )}
                    {result.score !== null && (
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        padding: '0.4rem 0.8rem',
                        background: result.score >= 75 ? 'rgba(16, 185, 129, 0.15)' : 
                                  result.score >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: result.score >= 75 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444',
                        borderRadius: '0.375rem'
                      }}>
                        ATS: {result.score}/100
                      </span>
                    )}
                    {analysisCount > 1 && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.4rem 0.8rem',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '0.375rem',
                        color: 'var(--text-secondary)'
                      }}>
                        Analysis #{analysisCount}
                        {previousScore && ` (Previous: ${previousScore})`}
                      </span>
                    )}
                  </div>
                  {result.overall && (
                    <p style={{
                      fontSize: '0.95rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      maxWidth: '600px'
                    }}>
                      {result.overall}
                    </p>
                  )}
                </div>

                {/* OVERALL SCORE CIRCLE */}
                {result.score !== null && (
                  <div style={{
                    width: '140px',
                    height: '140px',
                    borderRadius: '50%',
                    background: result.score >= 75 ? 'rgba(16, 185, 129, 0.15)' :
                               result.score >= 50 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `2px solid ${result.score >= 75 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      color: result.score >= 75 ? '#10b981' : result.score >= 50 ? '#f59e0b' : '#ef4444'
                    }}>
                      {result.score}
                    </div>
                    <div style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-secondary)',
                      marginTop: '0.25rem'
                    }}>
                      {result.score >= 75 ? 'Excellent' : result.score >= 50 ? 'Good' : 'Needs Work'}
                    </div>
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div style={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                marginBottom: '1.5rem'
              }}>
                <button
                  onClick={() => alert('Copy feedback feature: would copy all suggestions to clipboard')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    boxShadow: '0 4px 12px rgba(44, 154, 255, 0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.boxShadow = '0 6px 20px rgba(44, 154, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.boxShadow = '0 4px 12px rgba(44, 154, 255, 0.2)';
                  }}
                >
                  📋 Copy Feedback
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: 'var(--accent)',
                    border: '1px solid rgba(44, 154, 255, 0.3)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(44, 154, 255, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  👤 View Profile
                </button>
                <button
                  onClick={() => setResult(null)}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: 'transparent',
                    color: 'var(--text-secondary)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.5rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'transparent';
                  }}
                >
                  ↑ Back to Upload
                </button>
              </div>

              {/* QUICK ACTION: PRACTICE INTERVIEWS */}
              {result.recommended_roles.length > 0 && (
                <div style={{
                  padding: '1rem',
                  background: 'rgba(0, 224, 255, 0.05)',
                  borderRadius: '0.75rem',
                  border: '1px solid rgba(0, 224, 255, 0.15)'
                }}>
                  <p style={{
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    marginBottom: '0.75rem',
                    color: 'var(--accent-2)'
                  }}>
                    🎤 Practice interviews for:
                  </p>
                  <div style={{
                    display: 'flex',
                    gap: '0.75rem',
                    flexWrap: 'wrap'
                  }}>
                    {result.recommended_roles.slice(0, 3).map((role, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          localStorage.setItem('targetRole', role);
                          navigate('/agent');
                        }}
                        style={{
                          padding: '0.6rem 1.2rem',
                          background: 'rgba(44, 154, 255, 0.2)',
                          border: '1px solid rgba(44, 154, 255, 0.3)',
                          borderRadius: '0.5rem',
                          color: 'var(--accent-2)',
                          fontWeight: 500,
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onMouseOver={(e) => {
                          e.target.style.background = 'rgba(44, 154, 255, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.target.style.background = 'rgba(44, 154, 255, 0.2)';
                        }}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* COLLAPSIBLE SECTIONS */}

            {/* OVERVIEW SECTION */}
            <CollapsibleSection
              title="Overview"
              icon="📋"
              isExpanded={expandedSections.overview}
              onToggle={() => toggleSection('overview')}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem'
              }}>
                {result.email && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Email
                    </div>
                    <div style={{ fontWeight: 500 }}>{result.email}</div>
                  </div>
                )}
                {result.phone && (
                  <div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      Phone
                    </div>
                    <div style={{ fontWeight: 500 }}>{result.phone}</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    ATS Score Breakdown
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Keyword match, structure, clarity
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* STRENGTHS */}
            <CollapsibleSection
              title="Strengths"
              icon="✅"
              isExpanded={expandedSections.strengths}
              onToggle={() => toggleSection('strengths')}
              badge={result.strengths.length}
            >
              <ul style={{
                listStyle: 'none',
                padding: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}>
                {result.strengths.map((s, i) => (
                  <li key={i} style={{
                    padding: '0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.2)',
                    borderRadius: '0.5rem',
                    fontSize: '0.95rem',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    gap: '0.75rem'
                  }}>
                    <span style={{ color: '#10b981', flexShrink: 0 }}>✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </CollapsibleSection>

            {/* AREAS TO IMPROVE */}
            <CollapsibleSection
              title="Areas to Improve"
              icon="⚡"
              isExpanded={expandedSections.improve}
              onToggle={() => toggleSection('improve')}
              badge={result.weaknesses.length}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {result.weaknesses.map((w, i) => (
                  <div key={i} style={{
                    padding: '1rem',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <span style={{ color: '#f59e0b', flexShrink: 0, fontWeight: 600 }}>•</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{w}</span>
                    </div>
                    {/* CONCRETE EXAMPLE - BASED ON CONTENT */}
                    {i === 0 && (
                      <div style={{
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.05)',
                        borderRadius: '0.5rem',
                        marginBottom: '0.75rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        borderLeft: '3px solid var(--accent)'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Example improvement:</div>
                        <div>"Improved Q&A response latency by 30% by optimizing Spring Boot services and database indices, reducing backend load from 85% to 45%."</div>
                      </div>
                    )}
                    <button
                      onClick={() => copyToClipboard(
                        i === 0 ? "Improved Q&A response latency by 30% by optimizing Spring Boot services and database indices, reducing backend load from 85% to 45%."
                              : "Check the suggested improvements above"
                      )}
                      style={{
                        padding: '0.5rem 1rem',
                        background: 'rgba(44, 154, 255, 0.1)',
                        border: '1px solid rgba(44, 154, 255, 0.2)',
                        borderRadius: '0.375rem',
                        color: 'var(--accent)',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        transition: 'all 0.3s'
                      }}
                    >
                      📋 Copy sample
                    </button>
                  </div>
                ))}

                {/* ADDITIONAL SUGGESTIONS */}
                {result.suggestions.length > 0 && (
                  <>
                    <div style={{
                      paddingTop: '1rem',
                      borderTop: '1px solid rgba(44, 154, 255, 0.1)'
                    }}>
                      <h4 style={{
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        marginBottom: '1rem',
                        color: 'var(--accent)'
                      }}>
                        📝 Actionable suggestions:
                      </h4>
                      <ol style={{
                        listStyle: 'none',
                        padding: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                      }}>
                        {result.suggestions.map((s, i) => (
                          <li key={i} style={{
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            gap: '0.75rem',
                            lineHeight: '1.5'
                          }}>
                            <span style={{ color: 'var(--accent)', fontWeight: 600, flexShrink: 0 }}>
                              {i + 1}.
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </>
                )}
              </div>
            </CollapsibleSection>

            {/* ROLES & ATS KEYWORDS */}
            <CollapsibleSection
              title="Recommended Roles & Keywords"
              icon="🎯"
              isExpanded={expandedSections.roles}
              onToggle={() => toggleSection('roles')}
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem'
              }}>
                {/* ROLES */}
                <div>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                  }}>
                    Target Roles
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {result.recommended_roles.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '0.75rem 1rem',
                          background: 'rgba(44, 154, 255, 0.1)',
                          border: '1px solid rgba(44, 154, 255, 0.2)',
                          borderRadius: '0.5rem',
                          color: 'var(--accent)',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => {
                          localStorage.setItem('targetRole', r);
                          navigate('/agent');
                        }}
                      >
                        🎤 Practice {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ATS KEYWORDS */}
                <div>
                  <h4 style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    marginBottom: '1rem',
                    color: 'var(--text-primary)'
                  }}>
                    ATS Keywords
                  </h4>
                  
                  {/* PRESENT */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: '#10b981',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      ✓ Already Present
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {atsGroups.present.map((k, i) => (
                        <span key={i} style={{
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          borderRadius: '0.375rem',
                          color: '#10b981',
                          fontSize: '0.8rem',
                          fontWeight: 500
                        }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* RECOMMENDED */}
                  <div>
                    <div style={{
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      color: 'var(--accent)',
                      marginBottom: '0.5rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      + Recommended to Add (+8-12 points)
                    </div>
                    <div style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '0.5rem'
                    }}>
                      {atsGroups.recommended.map((k, i) => (
                        <span key={i} style={{
                          padding: '0.35rem 0.75rem',
                          background: 'rgba(44, 154, 255, 0.15)',
                          border: '1px solid rgba(44, 154, 255, 0.3)',
                          borderRadius: '0.375rem',
                          color: 'var(--accent)',
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.3s'
                        }}
                        onClick={() => copyToClipboard(k)}
                      >
                        {k}
                      </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* RESUME DATA - READ ONLY */}
            <CollapsibleSection
              title="Your Resume Data (Read-only)"
              icon="📂"
              isExpanded={expandedSections.data}
              onToggle={() => toggleSection('data')}
            >
              {/* SKILLS */}
              {result.skills.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    🛠 Skills
                  </h4>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem'
                  }}>
                    {result.skills.map((s, i) => (
                      <span key={i} style={{
                        padding: '0.4rem 0.8rem',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0.375rem',
                        fontSize: '0.85rem'
                      }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* EXPERIENCE */}
              {result.experience.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>
                    💼 Experience
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.experience.map((exp, i) => (
                      <div key={i} style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '0.75rem',
                        borderLeft: '3px solid var(--accent)'
                      }}>
                        <div style={{ fontWeight: 600 }}>
                          {exp.title} <span style={{ color: 'var(--text-secondary)', fontWeight: 'normal' }}>@ {exp.company}</span>
                        </div>
                        {(exp.start || exp.end) && (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {exp.start && `${exp.start} – `}{exp.end || 'Present'}
                          </div>
                        )}
                        {exp.description && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: '1.5' }}>
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* EDUCATION */}
              {result.education.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>
                    🎓 Education
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {result.education.map((edu, i) => (
                      <div key={i} style={{
                        padding: '0.75rem',
                        background: 'rgba(255,255,255,0.04)',
                        borderRadius: '0.5rem'
                      }}>
                        <div style={{ fontWeight: 600 }}>{edu.degree}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          {edu.institution}{edu.year ? ` • ${edu.year}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PROJECTS */}
              {result.projects.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '1rem' }}>
                    🚀 Projects
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {result.projects.map((p, i) => (
                      <div key={i} style={{
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '0.75rem'
                      }}>
                        <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{p.name}</div>
                        {p.description && (
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', lineHeight: '1.5' }}>
                            {p.description}
                          </p>
                        )}
                        {p.technologies?.length > 0 && (
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.4rem'
                          }}>
                            {p.technologies.map((t, j) => (
                              <span key={j} style={{
                                padding: '0.25rem 0.6rem',
                                background: 'rgba(44, 154, 255, 0.15)',
                                borderRadius: '0.25rem',
                                fontSize: '0.75rem',
                                color: 'var(--accent)'
                              }}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CollapsibleSection>
          </div>
        )}
      </div>

      {/* HELPER COMPONENT: COLLAPSIBLE SECTION */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

// COLLAPSIBLE SECTION COMPONENT
function CollapsibleSection({ title, icon, isExpanded, onToggle, badge, children }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.05), rgba(0, 224, 255, 0.02))',
      border: '1px solid rgba(44, 154, 255, 0.15)',
      borderRadius: '1rem',
      marginBottom: '1.5rem',
      overflow: 'hidden'
    }}>
      {/* HEADER */}
      <button
        onClick={onToggle}
        style={{
          width: '100%',
          padding: '1.25rem 1.5rem',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'all 0.3s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.background = 'rgba(44, 154, 255, 0.05)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '1.25rem' }}>{icon}</span>
          <h3 style={{
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0
          }}>
            {title}
          </h3>
          {badge && (
            <span style={{
              fontSize: '0.8rem',
              padding: '0.25rem 0.6rem',
              background: 'rgba(44, 154, 255, 0.2)',
              borderRadius: '0.375rem',
              color: 'var(--accent)',
              fontWeight: 600
            }}>
              {badge}
            </span>
          )}
        </div>
        <span style={{
          fontSize: '1.2rem',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.3s'
        }}>
          ▼
        </span>
      </button>

      {/* CONTENT */}
      {isExpanded && (
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid rgba(44, 154, 255, 0.1)',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {children}
        </div>
      )}
    </div>
  );
}
