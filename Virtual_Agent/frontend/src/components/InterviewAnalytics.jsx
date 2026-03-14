/**
 * InterviewAnalytics Component
 * Displays post-interview summary with scores, patterns, and practice plan
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function InterviewAnalytics({ sessionId, userId, onClose }) {
  const [summary, setSummary] = useState(null);
  const [practicePlan, setPracticePlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'practice'

  useEffect(() => {
    fetchAnalytics();
  }, [sessionId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/interview/summary/${sessionId}`);
      if (!res.ok) throw new Error('Failed to fetch analytics');
      const data = await res.json();
      setSummary(data.summary);
      setPracticePlan(data.practicePlan);
    } catch (err) {
      setError(err.message);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4 mx-auto" />
          <p>Analyzing your interview...</p>
        </div>
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error || 'No analytics available'}</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Interview Results</h1>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
          >
            Close
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Overall Score Card */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 shadow-lg">
          <div className="text-center">
            <p className="text-indigo-200 text-sm font-semibold mb-2">OVERALL SCORE</p>
            <div className="text-6xl font-bold mb-2">{summary.overallScore}</div>
            <div className="text-lg text-indigo-100">/100</div>
            <p className="text-indigo-150 mt-4 max-w-2xl mx-auto">{summary.summaryText}</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-white/10">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === 'summary'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Summary & Breakdown
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`px-6 py-3 font-semibold transition border-b-2 ${
              activeTab === 'practice'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            7-Day Practice Plan
          </button>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && (
          <div className="space-y-8">
            {/* Sub-Scores Grid */}
            <div>
              <h2 className="text-xl font-bold mb-4">Performance Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Communication', score: summary.subScores.communication },
                  { label: 'Technical Depth', score: summary.subScores.technicalDepth },
                  { label: 'Problem Solving', score: summary.subScores.problemSolving },
                  { label: 'Confidence', score: summary.subScores.confidence },
                  { label: 'Answer Structure', score: summary.subScores.answerStructure },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition"
                  >
                    <p className="text-sm text-gray-400 mb-2">{item.label}</p>
                    <div className="text-3xl font-bold text-indigo-400">{item.score}</div>
                    <div className="w-full bg-white/10 rounded-full h-1 mt-3">
                      <div
                        className="bg-indigo-500 h-1 rounded-full transition-all duration-500"
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-green-400">✓</span> Your Strengths
              </h3>
              <div className="space-y-3">
                {summary.strengths.map((strength, i) => (
                  <div
                    key={i}
                    className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex gap-3"
                  >
                    <span className="text-green-400 font-bold text-lg leading-tight">•</span>
                    <p className="text-gray-200">{strength}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-400">↑</span> Areas to Improve
              </h3>
              <div className="space-y-3">
                {summary.improvementAreas.map((area, i) => (
                  <div
                    key={i}
                    className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3"
                  >
                    <span className="text-yellow-400 font-bold text-lg leading-tight">→</span>
                    <p className="text-gray-200">{area}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Patterns */}
            {summary.detectedPatterns && summary.detectedPatterns.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4">Answer Patterns Detected</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {summary.detectedPatterns.slice(0, 4).map((pattern, i) => (
                    <div
                      key={i}
                      className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
                    >
                      <p className="font-semibold text-blue-300 mb-1">
                        {pattern.pattern.replace(/_/g, ' ').toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-400">{pattern.description}</p>
                      <p className="text-xs text-gray-500 mt-2">Detected {pattern.frequency} times</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Feedback */}
            {summary.scoreRationale && (
              <div>
                <h3 className="text-lg font-bold mb-4">Score Explanation</h3>
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <p className="text-gray-300 leading-relaxed">{summary.scoreRationale}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practice Plan Tab */}
        {activeTab === 'practice' && practicePlan && (
          <div className="space-y-6">
            <p className="text-gray-400 text-center mb-8">
              A personalized {practicePlan.durationDays}-day practice plan to help you improve
            </p>
            <div className="space-y-4">
              {practicePlan.days.slice(0, 7).map((day, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-lg p-6 hover:bg-white/10 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-indigo-600 font-bold">
                        {day.day}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{day.title}</h4>
                      <p className="text-sm text-indigo-400 mb-3">Focus: {day.focusArea}</p>
                      <ul className="space-y-2 mb-3">
                        {day.tasks.map((task, j) => (
                          <li key={j} className="text-gray-300 text-sm flex gap-2">
                            <span className="text-indigo-400">→</span> {task}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-yellow-400 italic">💡 {day.tip}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
