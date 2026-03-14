import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function InterviewComparison({ userId, sessionId1, sessionId2, onClose }) {
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchComparison();
  }, [userId, sessionId1, sessionId2]);

  const fetchComparison = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Validate session IDs
      if (!sessionId1 || !sessionId2) {
        setError('Invalid session IDs provided');
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${API_BASE_URL}/api/analytics/comparison/${userId}/${sessionId1}/${sessionId2}`
      );
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || errData.error || 'Failed to fetch comparison');
      }
      
      const data = await res.json();
      
      if (!data.comparison) {
        throw new Error('No comparison data returned from server');
      }
      
      setComparison(data.comparison);
    } catch (err) {
      setError(err.message);
      console.error('Fetch comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-2" />
            <p className="text-gray-600">Analyzing interviews...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !comparison) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-red-600 font-semibold mb-2">Error Loading Comparison</p>
        <p className="text-gray-600 text-sm mb-4">{error || 'Could not load comparison'}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold"
        >
          Close
        </button>
      </div>
    );
  }

  const { session1, session2, deltas, improvements } = comparison;
  const s1 = session1 || {};
  const s2 = session2 || {};

  const score1 = Math.round(s1.score || 0);
  const score2 = Math.round(s2.score || 0);
  const scoreDelta = score2 - score1;
  const scoreImprovement = score1 > 0 ? Math.round((scoreDelta / score1) * 100) : 0;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getDeltaColor = (delta) => {
    if (delta > 0) return 'text-green-600 bg-green-50 border-green-200';
    if (delta < 0) return 'text-red-600 bg-red-50 border-red-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Interview Comparison</h2>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded hover:bg-gray-300 transition font-semibold"
        >
          Close
        </button>
      </div>

      {/* Score Comparison Card */}
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Overall Score Comparison</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Interview 1 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-600 font-semibold mb-2">FIRST INTERVIEW</p>
            <p className="text-xs text-gray-500 mb-4">{formatDate(s1.created_at)}</p>
            <div className={`text-5xl font-bold ${getScoreColor(score1)}`}>{score1}</div>
            <p className="text-sm text-gray-600 mt-2">{s1.role}</p>
          </div>

          {/* Delta */}
          <div className="flex flex-col justify-center items-center">
            <div className={`text-4xl font-bold ${getDeltaColor(scoreDelta)} px-6 py-4 rounded-lg border-2`}>
              {scoreDelta > 0 ? '+' : ''}{scoreDelta}
            </div>
            <p className="text-sm text-gray-600 mt-3 text-center">
              {Math.abs(scoreImprovement)}% {scoreDelta > 0 ? 'improvement' : 'decline'}
            </p>
            {scoreDelta > 0 && (
              <p className="text-xs text-green-600 mt-2">📈 You're improving!</p>
            )}
          </div>

          {/* Interview 2 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <p className="text-sm text-gray-600 font-semibold mb-2">LATEST INTERVIEW</p>
            <p className="text-xs text-gray-500 mb-4">{formatDate(s2.created_at)}</p>
            <div className={`text-5xl font-bold ${getScoreColor(score2)}`}>{score2}</div>
            <p className="text-sm text-gray-600 mt-2">{s2.role}</p>
          </div>
        </div>
      </div>

      {/* Category Scores Comparison */}
      {s1.sub_scores || s2.sub_scores ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Category Breakdown</h3>
          <div className="space-y-4">
            {['communication', 'technical_depth', 'problem_solving', 'structured_thinking', 'confidence'].map((category) => {
              const score1Val = s1.sub_scores?.[category] || 0;
              const score2Val = s2.sub_scores?.[category] || 0;
              const delta = score2Val - score1Val;
              
              return (
                <div key={category}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-900 capitalize">{category.replace(/_/g, ' ')}</p>
                    <p className={`text-sm font-bold ${getDeltaColor(delta)}`}>
                      {Math.round(score1Val)} → {Math.round(score2Val)} ({delta > 0 ? '+' : ''}{delta.toFixed(0)})
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-400 h-2 rounded-full"
                          style={{ width: `${Math.min(score1Val, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${Math.min(score2Val, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-600 mt-4">
            <span className="inline-block w-3 h-3 bg-gray-400 rounded mr-2" /> Previous • 
            <span className="inline-block w-3 h-3 bg-indigo-600 rounded mx-2" /> Latest
          </p>
        </div>
      ) : null}

      {/* Strengths Gained */}
      {improvements?.strengthsGained && improvements.strengthsGained.length > 0 && (
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <h3 className="text-lg font-bold text-green-900 mb-4">✅ Strengths Gained</h3>
          <ul className="space-y-2">
            {improvements.strengthsGained.map((strength, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-green-600 flex-shrink-0">✓</span>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Areas Still Needing Work */}
      {improvements?.areasToFocus && improvements.areasToFocus.length > 0 && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">📈 Still Focus On</h3>
          <ul className="space-y-2">
            {improvements.areasToFocus.map((area, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-blue-600 flex-shrink-0">→</span>
                <span className="text-gray-700">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Timeline & Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">First Interview</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Date:</span> {formatDate(s1.created_at)}</p>
            <p><span className="font-medium">Role:</span> {s1.role}</p>
            <p><span className="font-medium">Duration:</span> {Math.round((s1.duration_seconds || 0) / 60)} minutes</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4">Latest Interview</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <p><span className="font-medium">Date:</span> {formatDate(s2.created_at)}</p>
            <p><span className="font-medium">Role:</span> {s2.role}</p>
            <p><span className="font-medium">Duration:</span> {Math.round((s2.duration_seconds || 0) / 60)} minutes</p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {scoreDelta > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6 text-center">
          <p className="text-lg font-bold text-green-900 mb-2">🎉 Great Progress!</p>
          <p className="text-green-700">
            You've improved by {Math.abs(scoreImprovement)}% since your last interview. Keep up the great work!
          </p>
        </div>
      )}
    </div>
  );
}
