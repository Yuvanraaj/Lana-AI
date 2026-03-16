import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function InterviewResult({ sessionId, onClose, onViewHistory, isInline = false }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 5;
    
    const fetchWithRetry = async () => {
      try {
        setLoading(true);
        console.log(`[FETCH] Getting summary for session: ${sessionId} (attempt ${retryCount + 1})`);
        
        const res = await fetch(`${API_BASE_URL}/api/interview/summary/${sessionId}`);
        console.log('[FETCH] Response status:', res.status);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('[FETCH] Error response:', errorText);
          
          if (res.status === 404 && retryCount < maxRetries) {
            retryCount++;
            console.log(`[FETCH] Retrying in 1 second (attempt ${retryCount}/${maxRetries})`);
            await new Promise(r => setTimeout(r, 1000));
            return fetchWithRetry();
          }
          
          throw new Error(`Failed to fetch result: ${res.status}`);
        }
        
        const data = await res.json();
        console.log('[FETCH] Response data:', data);
        
        const summary = data.summary || data.result || data.data?.summary || data.data?.result;
        
        if (!summary) {
          console.error('[FETCH] No summary found in response:', data);
          throw new Error('No summary data in response');
        }
        
        console.log('[FETCH] Summary loaded:', summary);
        setResult(summary);
        setError(null);
      } catch (err) {
        console.error('[FETCH] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWithRetry();
  }, [sessionId]);

  // Loading state
  if (loading) {
    if (isInline) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-400 mx-auto mb-2" />
            <p className="text-gray-300 text-sm">Loading interview results...</p>
          </div>
        </div>
      );
    } else {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center items-center h-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading your interview results...</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Error state
  if (error || !result) {
    if (isInline) {
      return (
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 text-center">
          <h3 className="text-sm font-bold text-red-300 mb-2">Error Loading Results</h3>
          <p className="text-red-200 text-sm mb-3">{error || 'Could not load interview results'}</p>
        </div>
      );
    } else {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Error Loading Results</h3>
            <p className="text-gray-600 mb-6">{error || 'Could not load interview results'}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
  }

  const score = Math.round(result.overallScore || result.score || 0);
  const strengths = result.strengths || [];
  const improvements = result.improvements || result.improvementAreas || [];
  const subScores = result.subScores || {};

  const getScoreColor = (s) => {
    if (s >= 80) return 'bg-green-500';
    if (s >= 60) return 'bg-blue-500';
    if (s >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLevel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Average';
    return 'Needs Improvement';
  };

  // Inline render for bottom panel
  if (isInline) {
    return (
      <div className="text-gray-100">
        {/* Score Card */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Overall Score */}
          <div className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
            <p className="text-gray-400 text-xs font-semibold uppercase mb-2">Overall Score</p>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-indigo-400">{score}</div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {getScoreLevel(score)}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Scores */}
          {Object.entries(subScores).slice(0, 3).map(([category, value]) => (
            <div key={category} className="bg-slate-800/50 rounded-lg p-4 border border-white/10">
              <p className="text-gray-400 text-xs font-semibold uppercase mb-2 capitalize">{category.replace(/_/g, ' ')}</p>
              <p className="text-xl font-bold text-indigo-300">{Math.round(value)}/100</p>
            </div>
          ))}
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-green-300 mb-3">✅ Strengths</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              {strengths.slice(0, 2).map((s, i) => (
                <li key={i}>• {s}</li>
              ))}
            </ul>
          </div>
          
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-sm font-bold text-blue-300 mb-3">📈 Areas to Grow</h3>
            <ul className="space-y-1 text-sm text-gray-300">
              {improvements.slice(0, 2).map((i, idx) => (
                <li key={idx}>• {i}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => window.location.href = '/start'}
            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-sm transition font-semibold"
          >
            New Interview
          </button>
          <button
            onClick={() => window.location.href = '/profile'}
            className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition"
          >
            Profile
          </button>
        </div>
      </div>
    );
  }

  // Modal render - FULL PAGE DETAILED
  const scorePercentage = Math.min(Math.max(score, 0), 100);
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950">
      {/* Header with Score */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Interview Assessment Complete</h2>
        <p className="text-indigo-100 text-lg">Here's your detailed feedback from Anam AI</p>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-12">
        
        {/* Overall Score - Large Display */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-2xl p-8 mb-8 text-center">
          <p className="text-gray-400 text-lg mb-2 uppercase tracking-widest">Overall Assessment Score</p>
          <div className="flex items-center justify-center gap-8">
            <div>
              <div className="text-7xl font-bold text-indigo-400">{score}</div>
              <p className="text-gray-400 text-sm mt-2">out of 100</p>
            </div>
            <div className="text-left">
              <p className={`text-3xl font-bold ${score >= 80 ? 'text-green-400' : score >= 60 ? 'text-blue-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                {getScoreLevel(score)}
              </p>
              <p className="text-gray-400 mt-2 max-w-xs">
                {score >= 80 ? 'Excellent performance - Ready for roles' : score >= 60 ? 'Good foundation with room to grow' : score >= 40 ? 'Needs focused preparation' : 'Significant improvement needed'}
              </p>
            </div>
          </div>
        </div>

        {/* Category Scores - Detailed Breakdown */}
        <div className="bg-slate-800/50 border border-white/10 rounded-xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Performance by Category</h3>
          <div className="space-y-6">
            {Object.entries(subScores).map(([category, value]) => (
              <div key={category}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-lg font-semibold text-gray-200 capitalize">
                    {category.replace(/_/g, ' ')}
                  </p>
                  <p className={`text-xl font-bold ${value >= 80 ? 'text-green-400' : value >= 60 ? 'text-blue-400' : value >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {Math.round(value)}/100
                  </p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${getScoreColor(value)}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths Section */}
        <div className="bg-green-500/15 border border-green-500/30 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">✅</span>
            <h3 className="text-2xl font-bold text-green-300">Your Strengths</h3>
          </div>
          <ul className="space-y-3">
            {strengths.length > 0 ? (
              strengths.map((strength, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-green-400 font-bold mt-1">•</span>
                  <span className="text-gray-100 text-lg">{strength}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No strengths recorded</li>
            )}
          </ul>
        </div>

        {/* Areas for Improvement - HONEST FEEDBACK */}
        <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">📈</span>
            <h3 className="text-2xl font-bold text-yellow-300">Areas for Improvement</h3>
          </div>
          <p className="text-gray-300 mb-4 text-sm">These are specific areas where you can focus effort to strengthen your candidacy:</p>
          <ul className="space-y-3">
            {improvements.length > 0 ? (
              improvements.map((improvement, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-yellow-400 font-bold mt-1">•</span>
                  <span className="text-gray-100 text-lg">{improvement}</span>
                </li>
              ))
            ) : (
              <li className="text-gray-400 italic">No improvement areas recorded</li>
            )}
          </ul>
        </div>

        {/* Summary/Detailed Feedback */}
        {result?.summary && (
          <div className="bg-blue-500/15 border border-blue-500/30 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-blue-300 mb-4">Detailed Interview Summary</h3>
            <p className="text-gray-200 text-lg leading-relaxed">{result.summary}</p>
          </div>
        )}

        {/* Practice Plan if available */}
        {result?.practice_plan && (
          <div className="bg-purple-500/15 border border-purple-500/30 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-purple-300 mb-4">Suggested Practice Plan</h3>
            <p className="text-gray-200 text-lg leading-relaxed">{result.practice_plan}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mb-12">
          <button
            onClick={() => window.location.href = '/start'}
            className="flex-1 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition font-semibold text-lg"
          >
            Take Another Interview
          </button>
          <button
            onClick={() => window.location.href = '/profile'}
            className="flex-1 px-6 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition font-semibold text-lg"
          >
            View Interview History
          </button>
        </div>

        {/* Footer Note */}
        <div className="bg-indigo-500/20 border border-indigo-500/30 rounded-lg p-6 text-center mb-8">
          <p className="text-sm text-gray-300">
            This feedback is based on Anam AI's behavioral analysis of your responses. 
            <br />
            <span className="font-semibold">Record this session and review it later for deeper insights.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
