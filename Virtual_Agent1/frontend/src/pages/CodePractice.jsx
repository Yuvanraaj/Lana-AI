import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../config';

export default function CodePractice() {
  const [, setLocation] = useLocation();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [responseType, setResponseType] = useState(null); // 'evaluate' or 'hint'

  const languages = [
    { id: 'cpp', label: 'C++' },
    { id: 'python', label: 'Python' },
    { id: 'java', label: 'Java' },
    { id: 'javascript', label: 'JavaScript' }
  ];

  // Load question on component mount
  useEffect(() => {
    fetchRandomQuestion();
  }, []);

  const fetchRandomQuestion = async () => {
    setLoading(true);
    try {
      console.log('[CodePractice] Fetching from:', `${API_BASE_URL}/api/leetcode/random`);
      const response = await fetch(`${API_BASE_URL}/api/leetcode/random`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('[CodePractice] Received question:', data.title);
      setQuestion(data);
      setCode('');
    } catch (error) {
      console.error('[CodePractice] Error fetching question:', error.message);
      setQuestion({
        title: 'Error Loading Question',
        description: `Failed to fetch question: ${error.message}`,
        difficulty: 'Error',
        tags: [],
        examples: 'Please try refreshing the page.'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatTestResults = (rawText) => {
    const langLabel = languages.find(l => l.id === selectedLanguage)?.label;

    let data;
    try {
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      data = JSON.parse(jsonMatch ? jsonMatch[0] : rawText);
    } catch {
      return formatHintResponse(rawText);
    }

    if (!data.language_valid) {
      return (
        <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚫</span>
            <span style={{ color: '#ef4444', fontWeight: 700, fontSize: '1.1rem' }}>Language Mismatch</span>
          </div>
          <p style={{ color: '#fca5a5', margin: 0, lineHeight: 1.6 }}>
            Your code appears to be written in <strong>{data.language_detected}</strong>, but you selected <strong>{langLabel}</strong>.<br />
            Switch to the correct language tab and resubmit.
          </p>
        </div>
      );
    }

    const { summary, categories = [], complexity, overall_verdict, critical_issues = [] } = data;
    const passRate = summary.total > 0 ? Math.round((summary.passed / summary.total) * 100) : 0;
    const verdictColor = overall_verdict === 'PASS' ? '#22c55e' : overall_verdict === 'PARTIAL' ? '#f59e0b' : '#ef4444';

    return (
      <div>
        {/* Summary bar */}
        <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', marginBottom: '1.25rem', border: `1px solid ${verdictColor}44` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: verdictColor }}>{summary.passed}</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>/{summary.total} passed</span>
            </div>
            <div style={{ padding: '0.3rem 0.9rem', background: `${verdictColor}18`, border: `1px solid ${verdictColor}55`, borderRadius: '6px', color: verdictColor, fontWeight: 700, fontSize: '0.85rem' }}>
              {overall_verdict}
            </div>
          </div>
          <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${passRate}%`, background: passRate >= 80 ? '#22c55e' : passRate >= 50 ? '#f59e0b' : '#ef4444', borderRadius: '3px', transition: 'width 0.4s ease' }} />
          </div>
          {summary.failed > 0 && (
            <div style={{ marginTop: '0.5rem', color: '#fca5a5', fontSize: '0.82rem' }}>{summary.failed} test{summary.failed !== 1 ? 's' : ''} failed</div>
          )}
        </div>

        {/* Critical issues */}
        {critical_issues.length > 0 && (
          <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '8px', marginBottom: '1.25rem' }}>
            <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: '0.5rem' }}>⚠️ Critical Issues</div>
            {critical_issues.map((issue, i) => (
              <div key={i} style={{ color: '#fca5a5', fontSize: '0.85rem', marginBottom: '0.25rem' }}>• {issue}</div>
            ))}
          </div>
        )}

        {/* Test categories */}
        {categories.map((cat, ci) => {
          const catPassed = cat.tests.filter(t => t.passed).length;
          const catTotal = cat.tests.length;
          return (
            <div key={ci} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.875rem', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: '8px 8px 0 0', borderBottom: 'none' }}>
                <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem' }}>{cat.name}</span>
                <span style={{ color: catPassed === catTotal ? '#22c55e' : '#f59e0b', fontSize: '0.82rem', fontWeight: 600 }}>{catPassed}/{catTotal}</span>
              </div>
              <div style={{ border: '1px solid rgba(0,212,255,0.12)', borderRadius: '0 0 8px 8px', overflow: 'hidden' }}>
                {cat.tests.map((test, ti) => (
                  <div key={ti} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: '0.75rem', padding: '0.65rem 0.875rem', borderLeft: `3px solid ${test.passed ? '#22c55e' : '#ef4444'}`, borderBottom: ti < cat.tests.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: test.passed ? 'rgba(34,197,94,0.02)' : 'rgba(239,68,68,0.04)' }}>
                    <div style={{ color: test.passed ? '#22c55e' : '#ef4444', fontWeight: 700, fontSize: '0.9rem', paddingTop: '1px' }}>{test.passed ? '✓' : '✗'}</div>
                    <div>
                      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                        <span><span style={{ color: 'var(--text-secondary)' }}>Input: </span><span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>{test.input}</span></span>
                        <span><span style={{ color: 'var(--text-secondary)' }}>Expected: </span><span style={{ color: '#a7f3d0', fontFamily: 'monospace' }}>{test.expected}</span></span>
                        {!test.passed && <span><span style={{ color: 'var(--text-secondary)' }}>Got: </span><span style={{ color: '#fca5a5', fontFamily: 'monospace' }}>{test.actual}</span></span>}
                      </div>
                      {test.note && <div style={{ color: 'var(--text-secondary)', fontSize: '0.77rem', marginTop: '0.2rem', fontStyle: 'italic' }}>{test.note}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Complexity */}
        {complexity && (
          <div style={{ padding: '1rem', background: 'rgba(44,154,255,0.04)', border: '1px solid rgba(44,154,255,0.15)', borderRadius: '8px', marginTop: '0.5rem' }}>
            <div style={{ color: 'var(--accent)', fontWeight: 700, marginBottom: '0.5rem', fontSize: '0.88rem' }}>⚡ Complexity Analysis</div>
            <div style={{ display: 'flex', gap: '2rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-secondary)' }}>Time: </span><span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>{complexity.time}</span></span>
              <span style={{ fontSize: '0.85rem' }}><span style={{ color: 'var(--text-secondary)' }}>Space: </span><span style={{ color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 600 }}>{complexity.space}</span></span>
              <span style={{ fontSize: '0.85rem', color: complexity.optimal ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>{complexity.optimal ? '✓ Optimal' : '⚠ Not Optimal'}</span>
            </div>
            {complexity.notes && <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.5 }}>{complexity.notes}</div>}
          </div>
        )}
      </div>
    );
  };

  const formatHintResponse = (text) => {
    // Split response into sections and format with code blocks
    const sections = text.split(/(?=^##|\n##|^\d+\.|\\n\d+\.)/m);
    
    return sections.map((section, idx) => {
      const lines = section.split('\n');
      
      // Extract section title (either from ## header or numbered point)
      let sectionTitle = '';
      let contentStartIdx = 0;
      
      if (lines[0].match(/^#+\s/)) {
        sectionTitle = lines[0].replace(/^#+\s/, '').trim();
        contentStartIdx = 1;
      } else if (lines[0].match(/^\d+\.\s\*\*/)) {
        sectionTitle = lines[0].replace(/^\d+\.\s\*\*/, '').replace(/\*\*:?$/,'').trim();
        contentStartIdx = 1;
      }
      
      const content = lines.slice(contentStartIdx).join('\n').trim();

      // Check if content contains code block markers
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = codeBlockRegex.exec(content)) !== null) {
        // Add text before code block
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: content.substring(lastIndex, match.index)
          });
        }
        // Add code block
        parts.push({
          type: 'code',
          language: match[1] || selectedLanguage,
          content: match[2].trim()
        });
        lastIndex = match.index + match[0].length;
      }

      // Add remaining text
      if (lastIndex < content.length) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex)
        });
      }

      // If text only, handle as simple text
      if (parts.length === 0) {
        parts.push({
          type: 'text',
          content: content
        });
      }

      return (
        <div key={idx} style={{ marginBottom: '1.5rem' }}>
          {sectionTitle && (
            <h3 style={{
              color: sectionTitle.includes('PASSED') ? '#22c55e' : sectionTitle.includes('FAILED') ? '#ef4444' : 'var(--accent)',
              fontWeight: 700,
              fontSize: sectionTitle.startsWith('###') || sectionTitle.match(/^#+/) && sectionTitle.split('#').length > 3 ? '1rem' : '1.1rem',
              marginBottom: '0.75rem',
              borderBottom: `2px solid ${sectionTitle.includes('PASSED') ? 'rgba(34, 197, 94, 0.3)' : sectionTitle.includes('FAILED') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 212, 255, 0.3)'}`,
              paddingBottom: '0.5rem'
            }}>
              {sectionTitle}
            </h3>
          )}
          {parts.map((part, pidx) => 
            part.type === 'code' ? (
              <div key={pidx} style={{
                background: '#0f172a',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.75rem',
                overflow: 'auto',
                maxHeight: '300px'
              }}>
                <div style={{
                  color: 'rgba(0, 212, 255, 0.7)',
                  fontSize: '0.75rem',
                  marginBottom: '0.5rem',
                  fontWeight: 600
                }}>
                  {part.language.toUpperCase()}
                </div>
                <pre style={{
                  color: '#00d4ff',
                  fontFamily: 'Monaco, Courier New, monospace',
                  fontSize: '0.85rem',
                  lineHeight: '1.5',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {part.content}
                </pre>
              </div>
            ) : (
              <div key={pidx} style={{
                color: 'var(--text-secondary)',
                lineHeight: '1.6',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                marginBottom: '0.5rem'
              }}>
                {part.content}
              </div>
            )
          )}
        </div>
      );
    });
  };

  const sendToOpenAI = async (type) => {
    if (!code.trim()) {
      alert('Please write some code first');
      return;
    }

    setAiLoading(true);
    setResponseType(type);

    const langLabel = languages.find(l => l.id === selectedLanguage)?.label;

    try {
      const systemPrompt = type === 'evaluate'
        ? `You are a senior code reviewer and optimization expert conducting a technical interview.

STEP 1 — LANGUAGE VALIDATION (mandatory):
Selected language: ${langLabel}
If the submitted code is NOT written in ${langLabel} syntax (e.g., Python indentation in a C++ submission, Java class declarations in a Python submission), your ENTIRE response must be ONLY:
"LANGUAGE_MISMATCH: Your code appears to be [detected language], not ${langLabel}. Please switch to the correct language tab and resubmit."
Do NOT evaluate logic if language is wrong.

STEP 2 — CODE REVIEW (only if language matches):

## Code Correctness
Trace the logic carefully. Is it correct for all cases?

## Complexity Analysis
Time complexity: O(?) with justification.
Space complexity: O(?) with justification.
Is this optimal? If not, what is the best possible?

## Optimizations
Specific, concrete improvements with example code snippets.

## Best Practices
Code style, naming, readability issues specific to ${langLabel}.

## Edge Cases to Handle
List cases the current code might miss or crash on.`

        : type === 'test'
        ? `You are a rigorous automated test runner for a technical interview platform.

STEP 1 — LANGUAGE VALIDATION (do this FIRST, mandatory):
Selected language: ${langLabel}
Examine the code syntax strictly. Common signals:
- Python: indentation, def/class keywords, no semicolons, print()
- Java: public class, System.out, strong typing with explicit types
- C++: #include, cout, int main(), semicolons, pointer syntax
- JavaScript: const/let/var, =>, no type declarations

If the code does NOT match ${langLabel}, respond with ONLY this exact JSON (no other text):
{"language_valid":false,"language_detected":"[name of detected language]"}

STEP 2 — TEST EXECUTION (only if language is correct):
Carefully trace the code logic step-by-step for each of the 30 test cases below.
Do NOT guess — follow every branch, loop, and return statement mentally.

Generate exactly 30 test cases spread across these categories:
- Category A (3 cases): The exact examples provided in the problem statement
- Category B (3 cases): Empty input, null/None, zero
- Category C (3 cases): Single element / minimal valid input
- Category D (4 cases): Boundary values — INT_MIN (-2147483648), INT_MAX (2147483647), max array length, empty string
- Category E (3 cases): Negative numbers, mixed positive/negative
- Category F (3 cases): All identical elements, all zeros, all same character
- Category G (3 cases): Already sorted (ascending), reverse sorted, nearly sorted
- Category H (3 cases): Large inputs — simulate 50-100 element arrays / long strings
- Category I (3 cases): High-complexity patterns — worst-case for the algorithm (e.g., palindromes for palindrome check, all same for sliding window)
- Category J (2 cases): Random realistic inputs that a user would submit

Respond with ONLY valid JSON, no markdown, no extra text:
{
  "language_valid": true,
  "summary": {"passed": 0, "failed": 0, "total": 30},
  "categories": [
    {
      "name": "Category A — Problem Examples",
      "tests": [
        {"id": 1, "input": "exact input", "expected": "expected output", "actual": "traced output", "passed": true, "note": ""}
      ]
    }
  ],
  "complexity": {"time": "O(?)", "space": "O(?)", "optimal": true, "notes": "brief explanation"},
  "overall_verdict": "PASS",
  "critical_issues": []
}`

        : `You are a coding mentor. The user is stuck on a LeetCode problem and needs help.
           Provide guidance in a well-structured format with:

## Algorithm Approach
Explain the algorithm and approach to solve this problem.

## Step-by-Step Breakdown
List the key steps to implement the solution.

## Data Structures
What data structures would be helpful?

## Pseudocode
Provide pseudocode outline (with code blocks marked as \`\`\`pseudocode)

## Key Insights
Important patterns or tricks for this problem.

Do NOT give the complete solution, only guide them forward.`;

      const userMessage = `Problem: ${question.title}
Difficulty: ${question.difficulty}
Selected Language: ${langLabel}

Description:
${question.description}

Examples:
${question.examples}

Submitted Code (${langLabel}):
\`\`\`${selectedLanguage}
${code}
\`\`\`
${type === 'test' ? 'Run all 30 test cases and return the JSON result.' : type === 'evaluate' ? 'Evaluate this code.' : 'Provide structured hints.'}`;

      const response = await fetch(`${API_BASE_URL}/api/openai-proxy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stream: false,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          model: 'gpt-4o-mini',
          temperature: type === 'test' ? 0.1 : 0.7,
          max_tokens: type === 'test' ? 4000 : 1800
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[CodePractice] HTTP Error:', response.status, errorData);
        throw new Error(`HTTP ${response.status}: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('[CodePractice] OpenAI Response:', data);
      
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        console.error('[CodePractice] No content in response:', data);
        throw new Error('No response content from OpenAI');
      }
      
      setAiResponse(content);
    } catch (error) {
      console.error('[CodePractice] Error:', error);
      setAiResponse(`Error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return { bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.5)', text: '#22c55e' };
      case 'medium':
        return { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.5)', text: '#f59e0b' };
      case 'hard':
        return { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.5)', text: '#ef4444' };
      default:
        return { bg: 'rgba(100, 100, 100, 0.1)', border: 'rgba(100, 100, 100, 0.5)', text: '#999' };
    }
  };

  const difficultyStyle = question ? getDifficultyColor(question.difficulty) : {};

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '2rem' }}>💻</span>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            LeetCode Practice
          </h1>
        </div>
        <button
          onClick={() => setLocation('/start')}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            background: 'transparent',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '0.95rem'
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 80px)', gap: 0 }}>
        {/* Problem Description */}
        <div style={{
          overflowY: 'auto',
          padding: '2rem',
          borderRight: '1px solid rgba(0, 212, 255, 0.1)'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(0, 212, 255, 0.2)',
                borderTop: '3px solid var(--accent)',
                borderRadius: '50%',
                margin: '0 auto',
                animation: 'spin 1s linear infinite'
              }} />
              <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading problem...</p>
            </div>
          ) : question ? (
            <div>
              {/* Title and Difficulty */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {question.title || 'Problem'} #{question.id || ''}
                  </h2>
                  <button
                    onClick={fetchRandomQuestion}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: '8px',
                      background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                      color: 'white',
                      border: 'none',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>

                {/* Difficulty Badge */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '6px',
                    background: difficultyStyle.bg,
                    border: `1px solid ${difficultyStyle.border}`,
                    color: difficultyStyle.text,
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}>
                    {question.difficulty || 'Unknown'}
                  </div>
                  {question.stats?.acRate && (
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Acceptance: {(question.stats.acRate * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>

              {/* Topics */}
              {question.tags && question.tags.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.75rem' }}>
                    Topics:
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {question.tags.map((tag, idx) => (
                      <span key={idx} style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '4px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.3)',
                        color: 'var(--accent)',
                        fontSize: '0.85rem'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>Description</h3>
                <div style={{
                  background: 'rgba(0, 212, 255, 0.05)',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.6',
                  fontSize: '0.95rem',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {question.description || 'No description available'}
                </div>
              </div>

              {/* Examples */}
              {question.examples && (
                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>Examples</h3>
                  <div style={{
                    background: 'rgba(0, 212, 255, 0.05)',
                    padding: '1.5rem',
                    borderRadius: '8px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    fontSize: '0.85rem',
                    fontFamily: 'Monaco, Courier New, monospace',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}>
                    {question.examples}
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>Problem Info</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{
                    padding: '1rem',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Problem ID</p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, margin: '0.25rem 0 0 0' }}>
                      {question.id || 'N/A'}
                    </p>
                  </div>
                  <div style={{
                    padding: '1rem',
                    border: '1px solid rgba(0, 212, 255, 0.2)',
                    borderRadius: '8px'
                  }}>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>Difficulty</p>
                    <p style={{ color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 600, margin: '0.25rem 0 0 0' }}>
                      {question.difficulty || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Failed to load problem.</p>
          )}
        </div>

        {/* Code Editor */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)'
        }}>
          {/* Language Selector */}
          <div style={{
            padding: '1.5rem',
            borderBottom: '1px solid rgba(0, 212, 255, 0.1)',
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setSelectedLanguage(lang.id)}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '6px',
                  background: selectedLanguage === lang.id ? 'var(--accent)' : 'transparent',
                  border: selectedLanguage === lang.id ? 'none' : '1px solid rgba(0, 212, 255, 0.3)',
                  color: selectedLanguage === lang.id ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.2s'
                }}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Code Editor Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '1.5rem' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Write your solution in {languages.find(l => l.id === selectedLanguage)?.label}
            </p>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Write your code here..."
              style={{
                flex: 1,
                padding: '1rem',
                background: '#0f172a',
                border: '1px solid rgba(0, 212, 255, 0.2)',
                borderRadius: '8px',
                color: '#00d4ff',
                fontFamily: 'Monaco, Courier New, monospace',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                resize: 'none',
                outline: 'none'
              }}
            />
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => sendToOpenAI('test')}
                disabled={aiLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  cursor: aiLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  opacity: aiLoading ? 0.6 : 1
                }}
              >
                {aiLoading && responseType === 'test' ? '⏳ Testing...' : '🧪 Test'}
              </button>
              <button
                onClick={() => sendToOpenAI('evaluate')}
                disabled={aiLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                  color: 'white',
                  border: 'none',
                  fontWeight: 600,
                  cursor: aiLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  opacity: aiLoading ? 0.6 : 1
                }}
              >
                {aiLoading && responseType === 'evaluate' ? '⏳ Evaluating...' : '✓ Evaluate'}
              </button>
              <button
                onClick={() => sendToOpenAI('hint')}
                disabled={aiLoading}
                style={{
                  flex: 1,
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: aiLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  opacity: aiLoading ? 0.6 : 1
                }}
              >
                {aiLoading && responseType === 'hint' ? '⏳ Getting Hint...' : '💡 Hint'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Response Modal */}
      {aiResponse && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: 'var(--text-primary)', margin: 0, fontSize: '1.3rem' }}>
                {responseType === 'evaluate' ? '✓ Code Evaluation' : responseType === 'test' ? '🧪 Test Results' : '💡 Solution Hints'}
              </h2>
              <button
                onClick={() => setAiResponse(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                ✕
              </button>
            </div>

            {/* Response Content */}
            <div style={{
              color: 'var(--text-secondary)',
              lineHeight: '1.8',
              fontSize: '0.95rem',
              maxHeight: 'calc(80vh - 150px)',
              overflowY: 'auto',
              paddingRight: '0.5rem'
            }}>
              {responseType === 'test' ? formatTestResults(aiResponse) : formatHintResponse(aiResponse)}
            </div>

            {/* Action Buttons */}
            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setAiResponse(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid var(--accent)',
                  color: 'var(--accent)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.95rem'
                }}
              >
                Close
              </button>
              {responseType === 'hint' && (
                <button
                  onClick={() => {
                    setAiResponse(null);
                    setCode(''); // Clear code to start fresh
                    setCode('// Apply the hint above to solve the problem\n');
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                    color: 'white',
                    border: 'none',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                >
                  Start Coding
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Custom scrollbar styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 212, 255, 0.05);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 212, 255, 0.3);
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 212, 255, 0.5);
        }
      `}</style>
    </div>
  );
}

