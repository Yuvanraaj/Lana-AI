/**
 * InterviewHistory Component
 * Shows a list of past interview sessions with scores and quick stats
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function InterviewHistory({ userId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('date'); // date, score, role
  const [selectedSessions, setSelectedSessions] = useState([]);

  useEffect(() => {
    if (userId) {
      fetchHistory();
    }
  }, [userId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/analytics/user/${userId}/history?limit=50`);
      if (!res.ok) throw new Error('Failed to fetch interview history');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err.message);
      console.error('History fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortedSessions = [...sessions].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.created_at || b.completedAt) - new Date(a.created_at || a.completedAt);
    } else if (sortBy === 'score') {
      return (b.score || b.overallScore || 0) - (a.score || a.overallScore || 0);
    } else if (sortBy === 'role') {
      return (a.role || '').localeCompare(b.role || '');
    }
    return 0;
  });

  const toggleSessionSelect = (sessionId) => {
    setSelectedSessions(prev => {
      const updated = new Set(prev);
      if (updated.has(sessionId)) {
        updated.delete(sessionId);
      } else {
        if (updated.size >= 2) {
          const first = Array.from(updated)[0];
          updated.delete(first);
        }
        updated.add(sessionId);
      }
      return Array.from(updated);
    });
  };

  const handleCompare = () => {
    if (selectedSessions.length === 2) {
      onSelectSession?.(selectedSessions[0], selectedSessions[1]);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-blue-400 bg-blue-500/20';
    if (score >= 40) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return 'bg-green-500/10 border-green-500/30';
    if (score >= 60) return 'bg-blue-500/10 border-blue-500/30';
    if (score >= 40) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-red-500/10 border-red-500/30';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '—';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };


  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl shadow p-8 border border-cyan-500/20">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-500/30 flex items-center justify-center mx-auto mb-3">
              <div className="animate-spin rounded-full h-7 w-7 border-2 border-cyan-400/30 border-t-cyan-400"></div>
            </div>
            <p className="text-gray-300 font-semibold">Loading your interview history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 backdrop-blur-sm rounded-2xl shadow p-6 border border-red-500/30">
        <p className="text-red-300 font-bold text-lg mb-2">⚠️ Error Loading History</p>
        <p className="text-gray-300 text-sm mb-4">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sortedSessions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl border-2 border-dashed border-cyan-500/30 p-12 text-center">
        <div className="text-5xl mb-4">📋</div>
        <h3 className="text-2xl font-bold text-cyan-300 mb-2">No Interview History Yet</h3>
        <p className="text-gray-300 mb-6 text-lg">
          Complete your first interview with Lana AI to see your results and track your progress!
        </p>
        <button
          onClick={() => window.location.href = '/start'}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition font-bold text-lg"
        >
          🚀 Start Your First Interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-gradient-to-r from-blue-900/40 to-cyan-900/40 backdrop-blur-sm rounded-2xl shadow p-6 border border-cyan-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">📋 Interview History</h3>
            <p className="text-sm text-gray-300 mt-1">Total: <span className="font-bold text-cyan-300">{sortedSessions.length}</span> interview{sortedSessions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-cyan-500/30 rounded-lg bg-slate-900/60 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-semibold"
            >
              <option value="date">📅 Latest</option>
              <option value="score">⭐ Score</option>
              <option value="role">👔 Role</option>
            </select>
            {selectedSessions.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition font-bold flex items-center gap-2"
              >
                <span>📊</span> Compare
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm rounded-2xl shadow overflow-hidden border border-cyan-500/20">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border-b border-cyan-500/20">
              <tr>
                <th className="px-4 py-4 text-left">
                  <input
                    type="checkbox"
                    className="rounded cursor-not-allowed opacity-50"
                    disabled
                    title="Select up to 2 interviews to compare"
                  />
                </th>
                <th className="px-4 py-4 text-left text-sm font-bold text-cyan-300">📅 Date</th>
                <th className="px-4 py-4 text-left text-sm font-bold text-cyan-300">👔 Role</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-cyan-300">⭐ Score</th>
                <th className="px-4 py-4 text-left text-sm font-bold text-cyan-300">⏱️ Duration</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-cyan-300">Status</th>
                <th className="px-4 py-4 text-center text-sm font-bold text-cyan-300">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cyan-500/10">
              {sortedSessions.map((session) => {
                const sessionId = session.id || session.sessionId;
                const isSelected = selectedSessions.includes(sessionId);
                const canSelect = !isSelected || selectedSessions.length < 2;
                const score = session.score || session.overallScore || 0;
                let role = session.role || 'Unknown';
                const isCustomRole = role.includes('custom') || role === 'Custom Role';
                const isResumeRole = role === 'resume-based' || role.includes('resume');
                const createdAt = session.created_at || session.completedAt || new Date().toISOString();
                
                // Format role display
                let roleDisplay = role;
                let roleBadgeColor = 'bg-blue-500/30 text-blue-300 border-blue-500/50';
                let roleIcon = '👔';
                
                if (isCustomRole) {
                  roleDisplay = 'Custom Role';
                  roleBadgeColor = 'bg-purple-500/30 text-purple-300 border-purple-500/50';
                  roleIcon = '✨';
                } else if (isResumeRole) {
                  roleDisplay = 'Resume-Based';
                  roleBadgeColor = 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50';
                  roleIcon = '📄';
                } else {
                  // Format preset roles
                  roleDisplay = role.replace('sde1-', 'SDE-1 ').replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                }
                
                return (
                  <tr
                    key={sessionId}
                    className={`border-cyan-500/10 transition hover:bg-cyan-500/10 ${isSelected ? 'bg-cyan-500/20 border-l-4 border-l-cyan-400' : ''}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSessionSelect(sessionId)}
                        disabled={!canSelect && !isSelected}
                        className="rounded cursor-pointer accent-cyan-500"
                        title={selectedSessions.length === 2 && !isSelected ? 'Select max 2 interviews' : ''}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-semibold text-white">
                        {formatDate(createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatTime(createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-2 px-3 py-1.5 ${roleBadgeColor} rounded-full text-sm font-bold border`}>
                        <span>{roleIcon}</span>
                        <span className="capitalize">{roleDisplay}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className={`text-center font-bold text-xl rounded-lg py-1 ${getScoreBgColor(score)} ${getScoreColor(score)}`}>
                        {Math.round(score)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-white">
                      {formatDuration(session.duration_seconds || session.duration)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/30 text-green-300 rounded-full text-xs font-bold border border-green-500/50">
                        <span>✓</span> Completed
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => onSelectSession?.(sessionId, null)}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition text-sm font-bold"
                        type="button"
                      >
                        📊 View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info */}
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <p className="text-sm text-gray-200">
          <span className="font-bold text-cyan-300 text-base">💡 Pro Tip:</span><br/>
          <span className="block mt-2">Select any two interviews and click <span className="font-bold text-cyan-300">"Compare"</span> to see how you've improved and identify areas to focus on.</span>
        </p>
        <div className="mt-4 pt-4 border-t border-cyan-500/20 flex gap-4 text-xs text-gray-300">
          <div><span className="font-bold text-cyan-300">👔</span> Preset roles from our collection</div>
          <div><span className="font-bold text-cyan-300">✨</span> Your custom role definitions</div>
          <div><span className="font-bold text-cyan-300">📄</span> Resume-based interviews</div>
        </div>
      </div>
    </div>
  );
}
