/**
 * Analytics Page
 * Displays interview analytics for a completed session
 */

import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import InterviewAnalytics from '../components/InterviewAnalytics';

export default function AnalyticsPage() {
  const [, navigate] = useLocation();
  const sessionId = localStorage.getItem('viewSessionId');
  const userId = localStorage.getItem('userId') || 'demo-user';

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">No session selected</p>
          <button
            onClick={() => navigate('/start')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <InterviewAnalytics
      sessionId={sessionId}
      userId={userId}
      onClose={() => navigate('/start')}
    />
  );
}
