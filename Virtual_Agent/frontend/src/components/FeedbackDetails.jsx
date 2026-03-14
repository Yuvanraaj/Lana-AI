import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

/**
 * FeedbackDetails Component
 * Displays comprehensive feedback for a single interview session
 */
export default function FeedbackDetails({ sessionId, onClose }) {
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSection, setExpandedSection] = useState('overview');

  useEffect(() => {
    fetchFeedback();
  }, [sessionId]);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/interview/summary/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch feedback');
      const data = await res.json();
      setFeedback(data.result);
    } catch (err) {
      setError(err.message);
      console.error('Fetch feedback error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
          <div className="flex justify-center items-center h-40">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading feedback details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !feedback) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Error Loading Feedback</h3>
          <p className="text-gray-600 mb-6">{error || 'Could not load feedback details'}</p>
          <button
            onClick={onClose}
            type="button"
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const score = Math.round(feedback.score || 0);
  const scorePercentage = Math.min(Math.max(score, 0), 100);

  const getScoreColor = (s) => {
    if (s >= 80) return { bg: 'bg-green-500', text: 'text-green-600' };
    if (s >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600' };
    if (s >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600' };
    return { bg: 'bg-red-500', text: 'text-red-600' };
  };

  const getScoreLevel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const strengths = feedback.strengths || [];
  const improvements = feedback.improvements || [];
  const subScores = feedback.subScores || {};
  const patterns = feedback.patterns || [];
  const summary = feedback.summary || 'No summary available';
  const practicePlan = feedback.practicePlan || 'No practice plan available';

  const colors = getScoreColor(score);

  const SectionHeader = ({ icon, title, section }) => (
    <button
      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
      type="button"
      className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition rounded-lg border border-gray-200 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <span className={`transform transition ${expandedSection === section ? 'rotate-180' : ''}`}>
        ▼
      </span>
    </button>
  );

  const SectionContent = ({ children, isExpanded }) => (
    <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'}`}>
      <div className="p-4 bg-white border border-gray-200 border-t-0 rounded-b-lg">
        {children}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">Interview Feedback 📊</h2>
              <p className="text-indigo-100">Detailed analysis of your performance</p>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="text-white hover:text-indigo-100 transition text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Score Card */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
            <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-3">
              Overall Performance
            </p>
            <div className="flex items-center gap-6">
              <div className="relative w-28 h-28">
                <svg className="w-28 h-28" viewBox="0 0 100 100">
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
                    className={`${colors.bg} transition-all duration-500`}
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
              <div className="flex-1">
                <p className={`text-4xl font-bold ${colors.text}`}>
                  {getScoreLevel(score)}
                </p>
                <p className="text-gray-600 mt-2">Out of 100 points</p>
                <p className="text-sm text-gray-500 mt-3">
                  {score >= 80 && '🎉 Outstanding performance! Keep it up!'}
                  {score >= 60 && score < 80 && '✨ Good work! Focus on the areas below to improve further.'}
                  {score >= 40 && score < 60 && '💪 Room for improvement. Practice the suggested areas.'}
                  {score < 40 && '🎯 Let\'s work on improving these skills with focused practice.'}
                </p>
              </div>
            </div>
          </div>

          {/* Sub-scores */}
          {Object.keys(subScores).length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Category Scores</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(subScores).map(([category, categoryScore]) => (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 capitalize">{category}</span>
                      <span className="font-bold text-sm">{Math.round(categoryScore)}/100</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500"
                        style={{ width: `${Math.min(categoryScore, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary Section */}
          <div className="space-y-3">
            <SectionHeader icon="📝" title="Interview Summary" section="overview" />
            <SectionContent isExpanded={expandedSection === 'overview'}>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
            </SectionContent>
          </div>

          {/* Strengths Section */}
          <div className="space-y-3">
            <SectionHeader icon="⭐" title="Your Strengths" section="strengths" />
            <SectionContent isExpanded={expandedSection === 'strengths'}>
              <ul className="space-y-3">
                {strengths.length > 0 ? (
                  strengths.map((strength, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-green-600 font-bold">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No strengths recorded</li>
                )}
              </ul>
            </SectionContent>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-3">
            <SectionHeader icon="📈" title="Areas to Improve" section="improvements" />
            <SectionContent isExpanded={expandedSection === 'improvements'}>
              <ul className="space-y-3">
                {improvements.length > 0 ? (
                  improvements.map((improvement, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-blue-600 font-bold">→</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-600 italic">No improvements needed</li>
                )}
              </ul>
            </SectionContent>
          </div>

          {/* Patterns Section */}
          {patterns && patterns.length > 0 && (
            <div className="space-y-3">
              <SectionHeader icon="🔍" title="Performance Patterns" section="patterns" />
              <SectionContent isExpanded={expandedSection === 'patterns'}>
                <ul className="space-y-3">
                  {patterns.map((pattern, idx) => (
                    <li key={idx} className="flex gap-3">
                      <span className="text-purple-600 font-bold">◆</span>
                      <span className="text-gray-700">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </SectionContent>
            </div>
          )}

          {/* Practice Plan Section */}
          <div className="space-y-3">
            <SectionHeader icon="🎯" title="Recommended Practice Plan" section="practice" />
            <SectionContent isExpanded={expandedSection === 'practice'}>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{practicePlan}</p>
            </SectionContent>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              type="button"
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => window.print()}
              type="button"
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              📄 Print Feedback
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-blue-900">💡 Tip:</span> Review these insights regularly and track your progress across multiple interviews to identify improvement trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
