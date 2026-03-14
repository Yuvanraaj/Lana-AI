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
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
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
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-center items-center h-40">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600 mx-auto mb-2" />
            <p className="text-gray-600">Loading interview history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6 border border-red-200">
        <p className="text-red-600 font-semibold mb-2">Error Loading History</p>
        <p className="text-gray-600 text-sm mb-4">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (sortedSessions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border-2 border-dashed border-slate-300 p-12 text-center">
        <div className="text-4xl mb-4">📋</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Interview History Yet</h3>
        <p className="text-gray-600 mb-6">
          Complete your first interview to see your results and track your progress!
        </p>
        <button
          onClick={() => window.location.href = '/start'}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Take Your First Interview
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with controls */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Interview History</h3>
            <p className="text-sm text-gray-600">Total: {sortedSessions.length} interview{sortedSessions.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date">Sort by: Latest</option>
              <option value="score">Sort by: Score</option>
              <option value="role">Sort by: Role</option>
            </select>
            {selectedSessions.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2"
              >
                <span>📊</span> Compare
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded"
                    disabled
                    title="Select up to 2 interviews to compare"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedSessions.map((session) => {
                const sessionId = session.id || session.sessionId;
                const isSelected = selectedSessions.includes(sessionId);
                const canSelect = !isSelected || selectedSessions.length < 2;
                const score = session.score || session.overallScore || 0;
                const role = session.role || 'Unknown';
                const createdAt = session.created_at || session.completedAt || new Date().toISOString();
                
                return (
                  <tr
                    key={sessionId}
                    className={`hover:bg-gray-50 transition ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSessionSelect(sessionId)}
                        disabled={!canSelect && !isSelected}
                        className="rounded cursor-pointer"
                        title={selectedSessions.length === 2 && !isSelected ? 'Select max 2 interviews' : ''}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">
                        {formatDate(createdAt)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium capitalize">
                        {role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-center font-bold text-lg ${getScoreColor(score)}`}>
                        {Math.round(score)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDuration(session.duration_seconds || session.duration)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        ✓ Completed
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onSelectSession?.(sessionId, null)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-semibold"
                        type="button"
                      >
                        View
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
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-blue-900">💡 Tip:</span> Select any two interviews and click "Compare" to see how you've improved and identify areas to focus on.
        </p>
      </div>
    </div>
  );
}
