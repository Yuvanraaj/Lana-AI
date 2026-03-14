import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function InterviewResult({ sessionId, onClose, onViewHistory }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('strengths');

  useEffect(() => {
    fetchResult();
  }, [sessionId]);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/interview/summary/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch result');
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      setError(err.message);
      console.error('Fetch result error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
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

  if (error || !result) {
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

  const score = Math.round(result.score || 0);
  const scorePercentage = Math.min(Math.max(score, 0), 100);
  
  // Determine score level color
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

  const strengths = result.strengths || [];
  const improvements = result.improvements || [];
  const subScores = result.subScores || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Interview Complete! 🎉</h2>
              <p className="text-indigo-100">Your interview has been saved to your profile</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-indigo-100 transition text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Score Card */}
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-6">
              {/* Overall Score */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-3">
                  Overall Score
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24">
                    <svg className="w-24 h-24" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeDasharray={`${scorePercentage * 2.83} 283`}
                        className={`${getScoreColor(score)} transition-all duration-500`}
                        transform="rotate(-90 50 50)"
                      />
                      <text
                        x="50"
                        y="55"
                        textAnchor="middle"
                        className="text-2xl font-bold fill-gray-900"
                      >
                        {score}
                      </text>
                    </svg>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${getScoreColor(score).replace('bg-', 'text-')}`}>
                      {getScoreLevel(score)}
                    </p>
                    <p className="text-sm text-gray-600">out of 100</p>
                  </div>
                </div>
              </div>

              {/* Sub-Scores */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-3">
                  Category Breakdown
                </p>
                <div className="space-y-3">
                  {Object.entries(subScores).map(([category, value]) => (
                    <div key={category}>
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-sm font-medium text-gray-700 capitalize">
                          {category.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm font-bold text-gray-900">{Math.round(value)}</p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${getScoreColor(value)}`}
                          style={{ width: `${Math.min(value, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Strengths */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">✅</span>
                <h3 className="text-lg font-bold text-gray-900">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((strength, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-green-600 mt-1">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No strengths identified</li>
                )}
              </ul>
            </div>

            {/* Areas for Improvement */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">📈</span>
                <h3 className="text-lg font-bold text-gray-900">Areas to Grow</h3>
              </div>
              <ul className="space-y-2">
                {improvements.length > 0 ? (
                  improvements.map((improvement, idx) => (
                    <li key={idx} className="flex gap-2">
                      <span className="text-blue-600 mt-1">•</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No improvements suggested</li>
                )}
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                setTimeout(() => {
                  window.location.href = '/profile';
                }, 100);
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              View Profile
            </button>
            <button
              onClick={() => {
                onClose();
                onViewHistory?.();
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Interview History
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-900">💡 Tip:</span> Visit your profile to see all your past interviews, compare your progress, and track your improvement over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
