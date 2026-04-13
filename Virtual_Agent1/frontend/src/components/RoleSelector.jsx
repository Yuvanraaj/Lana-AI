/**
 * RoleSelector Component
 * Allows users to select a role preset and optionally provide a job description
 */

import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

export default function RoleSelector({ onSelectRole, onClose }) {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jdExpanded, setJdExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/interview/roles`);
      if (!res.ok) throw new Error('Failed to fetch roles');
      const data = await res.json();
      setRoles(data.roles || []);
    } catch (err) {
      setError(err.message);
      console.error('Roles fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    onSelectRole({
      roleId: selectedRole,
      jobDescription: jobDescription.trim(),
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4 mx-auto" />
          <p>Loading role presets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-white/10">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Customize Your Interview</h2>
          <p className="text-indigo-100 mt-1">
            Select your role and optionally paste a job description for personalized questions
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-8 space-y-8">
          {/* Role Selection */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4">Step 1: Select Your Target Role</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    selectedRole === role.id
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <p className="font-semibold text-white mb-1">{role.name}</p>
                  <p className="text-xs text-gray-400 mb-2">{role.level}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.keySkills.slice(0, 2).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] bg-indigo-600/30 text-indigo-200 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Role Details */}
          {selectedRole && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div>
                {roles.find((r) => r.id === selectedRole) && (
                  <div>
                    <p className="text-sm text-gray-400 mb-3">
                      <strong>Key Skills Expected:</strong>{' '}
                      {roles.find((r) => r.id === selectedRole)?.keySkills.join(', ')}
                    </p>
                    <p className="text-sm text-gray-400">
                      <strong>Common Topics:</strong>{' '}
                      {roles.find((r) => r.id === selectedRole)?.commonTopics.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* JD Input */}
          <div>
            <button
              onClick={() => setJdExpanded(!jdExpanded)}
              className="flex items-center gap-2 text-lg font-bold text-white mb-4 hover:text-indigo-400 transition"
            >
              <span>{jdExpanded ? '▼' : '▶'}</span>
              Step 2: (Optional) Paste Job Description
            </button>

            {jdExpanded && (
              <div>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here. We'll extract required skills and personalize your interview..."
                  className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none"
                />
                <p className="text-sm text-gray-400 mt-2">
                  💡 Tip: Including a JD helps us tailor questions to match the specific role and company expectations.
                </p>
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">{error}</div>}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-white/5 border-t border-white/10 rounded-b-2xl flex gap-4 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition"
          >
            Skip
          </button>
          <button
            onClick={handleContinue}
            className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
          >
            Continue to Interview →
          </button>
        </div>
      </div>
    </div>
  );
}
