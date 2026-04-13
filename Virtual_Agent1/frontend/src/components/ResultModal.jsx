import React from 'react';

export default function ResultModal({ title, score, scoreLabel = 'Score', items = [], onClose, onViewProfile, isLoading = false }) {
  const scorePercentage = Math.min(Math.max(score || 0, 0), 100);
  
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 sticky top-0">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold mb-2">{title}</h2>
              <p className="text-indigo-100">Analysis complete</p>
            </div>
            <button
              type="button"
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
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
              <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide mb-3">
                {scoreLabel}
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
                      className={`${getScoreColor(score || 0)} transition-all duration-500`}
                      transform="rotate(-90 50 50)"
                    />
                    <text
                      x="50"
                      y="55"
                      textAnchor="middle"
                      className="text-2xl font-bold fill-gray-900"
                    >
                      {Math.round(score || 0)}
                    </text>
                  </svg>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${getScoreColor(score || 0).replace('bg-', 'text-')}`}>
                    {getScoreLevel(score || 0)}
                  </p>
                  <p className="text-sm text-gray-600">out of 100</p>
                </div>
              </div>
            </div>
          </div>

          {/* Items List */}
          {items && items.length > 0 && (
            <div className="space-y-4 mb-8">
              {items.map((item, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  {typeof item === 'object' && item.label ? (
                    <>
                      <p className="text-sm font-semibold text-indigo-900 mb-1">{item.label}</p>
                      <p className="text-gray-800">{item.value}</p>
                    </>
                  ) : (
                    <p className="text-gray-800">{item}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onViewProfile?.();
              }}
              disabled={isLoading}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              )}
              {isLoading ? 'Saving...' : 'View Profile'}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <span className="font-semibold text-indigo-900">💡 Tip:</span> Go to your profile to see all your analysis history and compare your results.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
