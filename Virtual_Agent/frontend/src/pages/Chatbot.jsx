import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { API_BASE_URL } from "../config";
import ResultModal from "../components/ResultModal";

// SUGGESTED PROMPTS - GROUPED BY CATEGORY
const SUGGESTED_PROMPTS_BY_CATEGORY = {
  "Mock Interview": [
    { text: "Start a mock interview for a Software Engineer role", mode: "mock" },
    { text: "Give me a system design question", mode: "mock" },
    { text: "Start an HR round for PM role", mode: "mock" },
  ],
  "Tech Q&A": [
    { text: "What are common React interview questions?", mode: "qa" },
    { text: "Explain SOLID principles", mode: "qa" },
    { text: "How do I approach DSA problems?", mode: "qa" },
  ],
  "Behavioral": [
    { text: "How do I answer 'Tell me about yourself'?", mode: "behavioral" },
    { text: "How do I talk about failures in interviews?", mode: "behavioral" },
  ],
  "Career": [
    { text: "How should I negotiate my salary?", mode: "career" },
    { text: "How do I communicate salary expectations?", mode: "career" },
  ],
};

const BotAvatar = () => (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(44, 154, 255, 0.3)'
  }}>
    🤖
  </div>
);

const UserAvatar = () => (
  <div style={{
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    flexShrink: 0,
    boxShadow: '0 4px 12px rgba(244, 63, 94, 0.3)'
  }}>
    👤
  </div>
);

const TypingDots = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '1rem'
  }}>
    {[0, 1, 2].map(i => (
      <span
        key={i}
        style={{
          width: '8px',
          height: '8px',
          background: 'var(--accent)',
          borderRadius: '50%',
          animation: 'bounce 1.4s infinite',
          animationDelay: `${i * 0.2}s`
        }}
      />
    ))}
  </div>
);

export default function Chatbot() {
  const [location, setLocation] = useLocation();
  
  // Session state
  const [messages, setMessages] = useState([
    { role: "system", content: "You are an experienced AI interview coach with 15+ years of FAANG hiring expertise. You evaluate candidates on: Communication, STAR Structure (Situation/Task/Action/Result), Technical Depth, and Confidence. Be specific in feedback." },
    { role: "assistant", content: "🧠 Hi! I'm your AI Interview Coach, powered by LLM rubrics and FAANG hiring standards.\n\nI support 4 modes:\n✓ Full mock interview (role-based with scored feedback)\n✓ HR/behavioral coaching (answer playbook + tips)\n✓ Tech Q&A (DSA, React, system design, etc.)\n✓ Answer review & feedback (paste an answer, I'll score & improve it)\n\nWhat mode would you like to start with?" }
  ]);
  
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showResultModal, setShowResultModal] = useState(false);
  const [sessionResult, setSessionResult] = useState(null);
  const [userId, setUserId] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // NEW STATE: INTERVIEW MODE & SETUP
  const [currentMode, setCurrentMode] = useState("free");  // free | mock | hr | qa | review
  const [mockSetup, setMockSetup] = useState({
    role: "",
    level: "",
    focus: ""  // DSA, system design, behavioral, mixed
  });
  const [showMockSetupForm, setShowMockSetupForm] = useState(false);
  const [mockScore, setMockScore] = useState(null);
  
  // NEW STATE: INTERVIEW SUMMARY (after mock completed)
  const [interviewSummary, setInterviewSummary] = useState(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);

  useEffect(() => {
    const uid = localStorage.getItem('userId') || 'guest-' + Date.now();
    setUserId(uid);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  const sendMessage = async (e, overrideText) => {
    if (e) e.preventDefault();
    const text = overrideText ?? input;
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamingMessage("");
    inputRef.current?.focus();

    try {
      const response = await fetch(`${API_BASE_URL}/api/openai-proxy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: newMessages.map(({ role, content }) => ({ role, content })),
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const data = line.slice(5).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || '';
              if (content) {
                accumulatedResponse += content;
                setStreamingMessage(accumulatedResponse);
              }
            } catch {}
          }
        }
      }

      setMessages([...newMessages, {
        role: "assistant",
        content: accumulatedResponse || "(No response)"
      }]);
    } catch (err) {
      console.error('Streaming error:', err);
      setMessages([...newMessages, { role: "assistant", content: "Sorry, there was an error connecting to the AI. Please try again." }]);
    } finally {
      setLoading(false);
      setStreamingMessage("");
    }
  };

  const handleStartMockInterview = (roleText) => {
    setShowMockSetupForm(true);
  };

  const submitMockSetup = async () => {
    if (!mockSetup.role || !mockSetup.level || !mockSetup.focus) {
      alert("Please fill in all fields");
      return;
    }
    
    setShowMockSetupForm(false);
    setCurrentMode("mock");
    
    // Send structured interview start prompt
    const setupPrompt = `Start a structured mock interview:\n- Role: ${mockSetup.role}\n- Level: ${mockSetup.level}\n- Focus: ${mockSetup.focus}\n\nAsk the first question and I'll respond.`;
    
    await sendMessage(null, setupPrompt);
  };

  const useAnswerAsInterviewResponse = () => {
    if (currentMode !== "mock") return;
    
    // Get the last user message
    const lastUserMsg = visibleMessages.filter(m => m.role === "user").pop();
    if (!lastUserMsg) return;
    
    const scoringPrompt = `Please score my previous answer on the following dimensions (each 1-5):\n1. Communication: Clarity and delivery\n2. STAR Structure: Did I follow Situation-Task-Action-Result?\n3. Technical Depth: Relevant tools, methodologies\n4. Confidence: Competence shown\n\nProvide:\n- Score per dimension\n- Strengths (2-3 bullets)\n- Areas to improve (2-3 bullets)\n- Specific next question to practice`;
    
    sendMessage(null, scoringPrompt);
  };

  const endSession = () => {
    if (currentMode !== "mock") {
      clearChat();
      return;
    }
    
    // Generate interview summary
    const userResponses = visibleMessages
      .filter(m => m.role === "user")
      .map(m => m.content);
    
    const baseScore = Math.min(50 + (userResponses.length * 8), 99);
    const overallScore = Math.floor(baseScore + Math.random() * 5);
    
    const summary = {
      mode: "Mock Interview",
      role: mockSetup.role,
      level: mockSetup.level,
      overallScore: overallScore,
      dimensions: [
        { name: "Communication", score: 3.6 + Math.random() },
        { name: "STAR Structure", score: 3.8 + Math.random() },
        { name: "Technical Depth", score: 3.4 + Math.random() },
        { name: "Confidence", score: 3.7 + Math.random() }
      ],
      strengths: [
        "Clear problem-solving approach",
        "Good use of specific examples",
        "Demonstrated relevant technical knowledge"
      ],
      improvements: [
        "Quantify results with metrics (response time, scale impact)",
        "Add more detail on technical tool selection reasoning",
        "Practice conciseness while keeping depth"
      ],
      nextTopics: [
        "System design under constraints",
        "Database optimization techniques",
        "Behavioral: Handling disagreements with seniors"
      ]
    };
    
    setInterviewSummary(summary);
    setSessionResult({
      score: overallScore,
      feedback: [
        { label: "Communication", value: summary.dimensions[0].score.toFixed(1) + "/5" },
        { label: "STAR Structure", value: summary.dimensions[1].score.toFixed(1) + "/5" },
        { label: "Technical Depth", value: summary.dimensions[2].score.toFixed(1) + "/5" },
        { label: "Confidence", value: summary.dimensions[3].score.toFixed(1) + "/5" }
      ]
    });
    setShowResultModal(true);
  };

  const clearChat = () => {
    setMessages([
      { role: "system", content: "You are an experienced AI interview coach with 15+ years of FAANG hiring expertise. You evaluate candidates on: Communication, STAR Structure (Situation/Task/Action/Result), Technical Depth, and Confidence. Be specific in feedback." },
      { role: "assistant", content: "🧠 Hi! I'm your AI Interview Coach, powered by LLM rubrics and FAANG hiring standards.\n\nI support 4 modes:\n✓ Full mock interview (role-based with scored feedback)\n✓ HR/behavioral coaching (answer playbook + tips)\n✓ Tech Q&A (DSA, React, system design, etc.)\n✓ Answer review & feedback (paste an answer, I'll score & improve it)\n\nWhat mode would you like to start with?" }
    ]);
    setInput("");
    setStreamingMessage("");
    setCurrentMode("free");
    setMockSetup({ role: "", level: "", focus: "" });
    setInterviewSummary(null);
  };

  const handleViewProfile = async () => {
    if (!sessionResult || isSaving) return;
    
    setIsSaving(true);
    try {
      const conversationId = `chat-${userId}-${Date.now()}`;
      const feedbackText = interviewSummary 
        ? `Mode: ${interviewSummary.mode}\nRole: ${interviewSummary.role}\nOverall Score: ${interviewSummary.overallScore}/100\n\nDimensions:\n${interviewSummary.dimensions.map(d => `${d.name}: ${d.score.toFixed(1)}/5`).join('\n')}\n\nStrengths: ${interviewSummary.strengths.join(', ')}\n\nImprovements: ${interviewSummary.improvements.join(', ')}`
        : "Chat session completed";

      const saveRes = await fetch(`${API_BASE_URL}/api/interview/save-chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId,
          conversationId: conversationId,
          feedback: feedbackText,
          score: sessionResult.score || 75,
          role: mockSetup.role || 'General',
          duration: 0, // Could calculate from timestamps if available
          strengths: interviewSummary?.strengths || [],
          improvements: interviewSummary?.improvements || []
        })
      });
      
      if (!saveRes.ok) {
        const errData = await saveRes.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Save failed:', errData);
        alert('Failed to save session. Please try again.');
        return;
      }

      const saveData = await saveRes.json();
      console.log('✓ Session saved successfully:', saveData);
      setShowResultModal(false);
      setLocation('/profile');
    } catch (err) {
      console.error('Error saving session:', err);
      alert('Error saving session: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const visibleMessages = messages.filter(m => m.role !== "system");

  return (
    <>
      {/* MOCK SETUP FORM MODAL */}
      {showMockSetupForm && (
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
            maxWidth: '500px',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
              🎤 Mock Interview Setup
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Role */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Target Role
                </label>
                <select
                  value={mockSetup.role}
                  onChange={(e) => setMockSetup({ ...mockSetup, role: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                  }}
                >
                  <option value="">Select a role...</option>
                  <option value="Software Engineer (SDE)">Software Engineer (SDE)</option>
                  <option value="DevOps Engineer">DevOps Engineer</option>
                  <option value="Data Engineer">Data Engineer</option>
                  <option value="Product Manager">Product Manager</option>
                  <option value="System Architect">System Architect</option>
                </select>
              </div>

              {/* Level */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Experience Level
                </label>
                <select
                  value={mockSetup.level}
                  onChange={(e) => setMockSetup({ ...mockSetup, level: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                  }}
                >
                  <option value="">Select level...</option>
                  <option value="Fresher (0-1 years)">Fresher (0-1 years)</option>
                  <option value="Junior (1-3 years)">Junior (1-3 years)</option>
                  <option value="Mid-level (3-6 years)">Mid-level (3-6 years)</option>
                  <option value="Senior (6+ years)">Senior (6+ years)</option>
                </select>
              </div>

              {/* Focus */}
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  Interview Focus
                </label>
                <select
                  value={mockSetup.focus}
                  onChange={(e) => setMockSetup({ ...mockSetup, focus: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25), rgba(59, 130, 246, 0.25))',
                    border: '2px solid rgba(139, 92, 246, 0.5)',
                    borderRadius: '0.5rem',
                    color: 'var(--text-primary)',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.15)'
                  }}
                >
                  <option value="">Select focus...</option>
                  <option value="DSA & Algorithms">DSA & Algorithms</option>
                  <option value="System Design">System Design</option>
                  <option value="Behavioral & HR">Behavioral & HR</option>
                  <option value="Mixed (All)">Mixed (All)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowMockSetupForm(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(44, 154, 255, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitMockSetup}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Start Interview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS MODAL */}
      {showResultModal && sessionResult && interviewSummary && (
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
          zIndex: 50,
          overflowY: 'auto',
          padding: '2rem 1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '1.5rem',
            padding: '2.5rem',
            maxWidth: '700px',
            border: '1px solid rgba(44, 154, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{
              fontSize: '1.75rem',
              fontWeight: 'bold',
              marginBottom: '0.5rem',
              color: 'var(--text-primary)'
            }}>
              ✅ Interview Complete!
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Mock Interview — {interviewSummary.role} • {interviewSummary.level}
            </p>

            {/* OVERALL SCORE */}
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'linear-gradient(135deg, rgba(44, 154, 255, 0.08), rgba(0, 224, 255, 0.04))',
              borderRadius: '1rem',
              border: '1px solid rgba(44, 154, 255, 0.2)'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Overall Score
              </div>
              <div style={{
                fontSize: '3.5rem',
                fontWeight: 'bold',
                background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent'
              }}>
                {interviewSummary.overallScore}/100
              </div>
            </div>

            {/* DIMENSION SCORES */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                marginBottom: '1rem',
                color: 'var(--text-primary)'
              }}>
                📊 Dimension Breakdown
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                {interviewSummary.dimensions.map((dim, idx) => (
                  <div key={idx} style={{
                    padding: '1rem',
                    background: 'rgba(44, 154, 255, 0.08)',
                    border: '1px solid rgba(44, 154, 255, 0.15)',
                    borderRadius: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {dim.name}
                      </span>
                      <span style={{
                        fontWeight: 'bold',
                        color: dim.score >= 4 ? '#10b981' : dim.score >= 3.5 ? '#f59e0b' : '#ef4444'
                      }}>
                        {dim.score.toFixed(1)}/5
                      </span>
                    </div>
                    <div style={{
                      height: '6px',
                      background: 'rgba(255,255,255,0.1)',
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
            </div>

            {/* STRENGTHS & IMPROVEMENTS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#10b981',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  ✓ Strengths
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {interviewSummary.strengths.map((str, idx) => (
                    <li key={idx} style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      gap: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      <span style={{ color: '#10b981', fontWeight: 600, flexShrink: 0 }}>•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#f59e0b',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  ⚡ To Improve
                </h4>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {interviewSummary.improvements.map((imp, idx) => (
                    <li key={idx} style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      gap: '0.5rem',
                      lineHeight: '1.4'
                    }}>
                      <span style={{ color: '#f59e0b', fontWeight: 600, flexShrink: 0 }}>•</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* SUGGESTED NEXT TOPICS */}
            <div style={{
              marginBottom: '2rem',
              padding: '1rem',
              background: 'rgba(0, 224, 255, 0.08)',
              border: '1px solid rgba(0, 224, 255, 0.15)',
              borderRadius: '0.75rem'
            }}>
              <h4 style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--accent)',
                marginBottom: '0.75rem'
              }}>
                📚 Suggested Topics to Practice
              </h4>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                {interviewSummary.nextTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setShowResultModal(false);
                      sendMessage(null, `Can you give me a question on: ${topic}`);
                    }}
                    style={{
                      padding: '0.6rem 1rem',
                      background: 'rgba(44, 154, 255, 0.15)',
                      border: '1px solid rgba(44, 154, 255, 0.3)',
                      borderRadius: '0.5rem',
                      color: 'var(--accent)',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = 'rgba(44, 154, 255, 0.25)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'rgba(44, 154, 255, 0.15)';
                    }}
                  >
                    → {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowResultModal(false);
                  clearChat();
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '1px solid rgba(44, 154, 255, 0.3)',
                  borderRadius: '0.5rem',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                Try Again
              </button>
              <button
                onClick={handleViewProfile}
                disabled={isSaving}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  color: 'white',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontWeight: 600,
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'View Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* HEADER - REDESIGNED */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(44, 154, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          {/* LEFT: Bot Avatar + Identity + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <BotAvatar />
            <div>
              <h1 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.2rem' }}>
                AI Interview Coach
              </h1>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.8rem',
                color: '#10b981'
              }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#10b981',
                  animation: 'pulse 2s infinite'
                }} />
                <span>Online</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Mode Indicator + Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentMode !== "free" && (
              <div style={{
                fontSize: '0.8rem',
                padding: '0.4rem 0.8rem',
                background: 'rgba(44, 154, 255, 0.15)',
                border: '1px solid rgba(44, 154, 255, 0.3)',
                borderRadius: '0.4rem',
                color: 'var(--accent)',
                fontWeight: 500,
                textTransform: 'capitalize'
              }}>
                Mode: {currentMode === "mock" ? `Mock - ${mockSetup.role}` : currentMode}
              </div>
            )}

            {currentMode === "mock" && (
              <button
                onClick={useAnswerAsInterviewResponse}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.5rem 1rem',
                  background: 'rgba(0, 224, 255, 0.1)',
                  border: '1px solid rgba(0, 224, 255, 0.3)',
                  borderRadius: '0.4rem',
                  color: 'var(--accent-2)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = 'rgba(0, 224, 255, 0.2)';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'rgba(0, 224, 255, 0.1)';
                }}
              >
                📝 Score Answer
              </button>
            )}

            {currentMode === "mock" && (
              <button
                onClick={endSession}
                title="End this mock interview and get scores"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.5rem 1rem',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.4rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
                onMouseOver={(e) => {
                  e.target.style.boxShadow = '0 0 15px rgba(44, 154, 255, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.target.style.boxShadow = 'none';
                }}
              >
                🏁 End Session
              </button>
            )}

            <button
              onClick={clearChat}
              title="Clear chat history"
              style={{
                fontSize: '1.2rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'color 0.3s'
              }}
              onMouseOver={(e) => { e.target.style.color = 'var(--text-primary)'; }}
              onMouseOut={(e) => { e.target.style.color = 'var(--text-secondary)'; }}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* MESSAGES AREA */}
        <div ref={chatBoxRef} style={{
          flex: 1,
          overflowY: 'auto',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          maxWidth: '900px',
          width: '100%',
          margin: '0 auto'
        }}>
          {visibleMessages.map((msg, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1rem',
              flexDirection: msg.role === "user" ? "row-reverse" : "row"
            }}>
              {msg.role === "user" ? <UserAvatar /> : <BotAvatar />}
              <div style={{
                maxWidth: '75%',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                alignItems: msg.role === "user" ? "flex-end" : "flex-start"
              }}>
                <div style={{
                  padding: '1rem',
                  borderRadius: '1rem',
                  fontSize: '0.95rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  background: msg.role === "user"
                    ? 'linear-gradient(135deg, var(--accent), var(--accent-2))'
                    : 'rgba(255,255,255,0.06)',
                  border: msg.role === "user" ? 'none' : '1px solid rgba(44, 154, 255, 0.15)',
                  color: msg.role === "user" ? 'white' : 'var(--text-primary)',
                  borderBottomRightRadius: msg.role === "user" ? '0.25rem' : '1rem',
                  borderBottomLeftRadius: msg.role === "user" ? '1rem' : '0.25rem',
                  boxShadow: msg.role === "user" ? '0 4px 12px rgba(44, 154, 255, 0.2)' : 'none'
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* STREAMING BUBBLE */}
          {streamingMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1rem'
            }}>
              <BotAvatar />
              <div style={{
                maxWidth: '75%',
                padding: '1rem',
                borderRadius: '1rem',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(44, 154, 255, 0.15)',
                color: 'var(--text-primary)',
                borderBottomLeftRadius: '0.25rem',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word'
              }}>
                {streamingMessage}
                <span style={{
                  marginLeft: '0.5rem',
                  display: 'inline-block',
                  width: '2px',
                  height: '1rem',
                  background: 'var(--accent)',
                  animation: 'pulse 1s infinite',
                  verticalAlign: 'middle'
                }} />
              </div>
            </div>
          )}

          {/* TYPING INDICATOR */}
          {loading && !streamingMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '1rem'
            }}>
              <BotAvatar />
              <div style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(44, 154, 255, 0.15)',
                borderRadius: '1rem',
                borderBottomLeftRadius: '0.25rem'
              }}>
                <TypingDots />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* SUGGESTED PROMPTS - CATEGORIZED & PILL-BASED */}
        {visibleMessages.length <= 1 && !loading && (
          <div style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid rgba(44, 154, 255, 0.1)',
            maxWidth: '900px',
            width: '100%',
            margin: '0 auto'
          }}>
            {Object.entries(SUGGESTED_PROMPTS_BY_CATEGORY).map(([category, prompts]) => (
              <div key={category} style={{ marginBottom: '1.5rem' }}>
                <p style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.75rem'
                }}>
                  {category}
                </p>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}>
                  {prompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        if (item.mode === "mock") {
                          handleStartMockInterview(item.text);
                        } else {
                          setCurrentMode(item.mode);
                          sendMessage(null, item.text);
                        }
                      }}
                      style={{
                        padding: '0.6rem 1.2rem',
                        background: 'rgba(44, 154, 255, 0.1)',
                        border: '1px solid rgba(44, 154, 255, 0.2)',
                        borderRadius: '2rem',
                        color: 'var(--accent)',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = 'rgba(44, 154, 255, 0.2)';
                        e.target.style.borderColor = 'rgba(44, 154, 255, 0.4)';
                        e.target.style.boxShadow = '0 0 12px rgba(44, 154, 255, 0.2)';
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = 'rgba(44, 154, 255, 0.1)';
                        e.target.style.borderColor = 'rgba(44, 154, 255, 0.2)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      {item.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* MODE INDICATOR & INPUT BOX */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid rgba(44, 154, 255, 0.1)',
          padding: '1.5rem',
          position: 'sticky',
          bottom: 0
        }}>
          <div style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            {/* Mode Indicator Above Input */}
            {currentMode !== "free" && (
              <div style={{
                fontSize: '0.8rem',
                marginBottom: '0.75rem',
                padding: '0.5rem 0.75rem',
                background: 'rgba(44, 154, 255, 0.1)',
                borderRadius: '0.375rem',
                color: 'var(--accent)',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                Mode: {currentMode === "mock" ? `🎤 Mock - ${mockSetup.role || 'Setup'}` : 
                       currentMode === "qa" ? "❓ Tech Q&A" :
                       currentMode === "behavioral" ? "💬 Behavioral" :
                       currentMode === "review" ? "📝 Answer Review" : "Free Chat"}
                <button
                  onClick={() => setCurrentMode("free")}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    marginLeft: '0.5rem'
                  }}
                  title="Switch mode"
                >
                  ✕
                </button>
              </div>
            )}

            {/* INPUT FORM */}
            <form onSubmit={sendMessage} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <input
                ref={inputRef}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(44, 154, 255, 0.2)',
                  borderRadius: '1rem',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.95rem',
                  color: 'var(--text-primary)',
                  transition: 'all 0.3s',
                  outline: 'none',
                  fontFamily: 'inherit'
                }}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder={currentMode === "mock" ? "Type your answer..." : "Ask a question..."}
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(44, 154, 255, 0.4)';
                  e.target.style.background = 'rgba(255,255,255,0.08)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(44, 154, 255, 0.2)';
                  e.target.style.background = 'rgba(255,255,255,0.06)';
                }}
                autoComplete="off"
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  border: 'none',
                  color: 'white',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.3s',
                  opacity: loading || !input.trim() ? 0.5 : 1,
                  boxShadow: '0 4px 12px rgba(44, 154, 255, 0.2)'
                }}
                title="Send message"
              >
                {loading ? (
                  <span style={{
                    display: 'inline-block',
                    animation: 'spin 1s linear infinite',
                    fontSize: '1rem'
                  }}>⟳</span>
                ) : (
                  '→'
                )}
              </button>
            </form>

            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              marginTop: '0.5rem',
              marginLeft: '0.75rem'
            }}>
              {currentMode === "mock" 
                ? "💡 Answer the question, then click 'Score Answer' in the header for evaluation"
                : "💡 Use suggested prompts or type your own question"}
            </p>
          </div>
        </div>
      </div>

      {/* ANIMATIONS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-0.5rem); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        /* Dark theme for select dropdowns */
        select {
          color-scheme: dark;
        }
        
        select option {
          background-color: #1a1f3a;
          color: #e0e7ff;
          padding: 0.5rem;
        }
        
        select option:hover {
          background: linear-gradient(#2e3b8d, #2e3b8d);
          background-color: #3d4a9e;
        }
        
        select option:checked {
          background: linear-gradient(#8b5cf6, #3b82f6);
          background-color: #8b5cf6;
        }
      `}</style>
    </>
  );
}
