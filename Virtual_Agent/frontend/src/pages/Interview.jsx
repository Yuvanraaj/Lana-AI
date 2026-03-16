import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { API_BASE_URL } from '../config';
import AnamAvatar from '../components/AnamAvatar';

export default function Interview() {
  const [, setLocation] = useLocation();
  const anamRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [role, setRole] = useState(null);
  const [jobDescription, setJobDescription] = useState(null);
  const [resumeData, setResumeData] = useState(null); // NEW: Store resume data for Anam
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [interviewStartTime] = useState(Date.now());
  const [anamStatus, setAnamStatus] = useState('idle');

  // Initialize interview from URL or localStorage
  useEffect(() => {
    const initializeInterview = async () => {
      try {
        const sessionIdFromUrl = new URLSearchParams(window.location.search).get('sessionId');
        const roleFromStorage = sessionIdFromUrl 
          ? null 
          : localStorage.getItem('selectedRole');
        const jdFromStorage = sessionIdFromUrl 
          ? null 
          : localStorage.getItem('selectedJD');

        if (sessionIdFromUrl) {
          // Resume existing session
          setSessionId(sessionIdFromUrl);
          setRole('sde1-product');
          localStorage.removeItem('selectedRole');
          localStorage.removeItem('selectedJD');
        } else if (roleFromStorage) {
          // Create new session with role
          await createNewSession(roleFromStorage, jdFromStorage || '');
        } else {
          // No session data - redirect back
          setError('No interview session found. Please select a role first.');
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeInterview();
  }, []);

  const createNewSession = async (selectedRole, selectedJD) => {
    try {
      setLoading(true);
      const isGuest = localStorage.getItem('isGuest') === 'true';
      
      let finalJobDescription = selectedJD;
      let finalRole = selectedRole;
      let parsedResumeData = null;
      
      // Handle resume-based interview
      if (selectedRole === 'resume-based') {
        console.log('[Interview] Processing resume-based interview...');
        parsedResumeData = JSON.parse(localStorage.getItem('resumeData') || '{}');
        console.log('[Interview] Resume data:', parsedResumeData);
        setResumeData(parsedResumeData);
        
        // Create job description from resume data
        finalJobDescription = parsedResumeData.name || 'Resume-based candidate';
        
        // Use a valid role preset (sde1-fullstack) but Anam will use resume data
        finalRole = 'sde1-fullstack'; // Use valid preset but Anam personalizes via resumeData prop
        console.log('[Interview] Role set to:', finalRole, '(resume-based mode)');
        
        localStorage.removeItem('resumeData');
      }
      
      console.log('[Interview] Creating session with role:', finalRole, 'description:', finalJobDescription?.substring(0, 50));
      
      const res = await fetch(`${API_BASE_URL}/api/interview/session/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId') || 'demo-user',
          role: finalRole,
          jobDescription: finalJobDescription,
          isGuest: isGuest
        }),
      });

      console.log('[Interview] Response status:', res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('[Interview] Server error:', errorData);
        throw new Error(`Server error: ${errorData.error || res.statusText}`);
      }
      
      const data = await res.json();
      console.log('[Interview] Session created successfully:', data);

      setSessionId(data.sessionId);
      setRole(finalRole);
      setJobDescription(finalJobDescription);
      console.log('✓ Interview session created:', data.sessionId);
    } catch (err) {
      console.error('[Interview] Full error:', err);
      setError(err.message);
      console.error('Session creation error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleAnamStatusChange = (status) => {
    console.log('[INTERVIEW] Anam status:', status);
    setAnamStatus(status);
  };

  const finishInterview = async (anamResult = {}) => {
    try {
      const userId = localStorage.getItem('userId') || 'demo-user';
      
      // Log the anamResult to verify we're getting the real data
      console.log('[INTERVIEW] anamResult received:', anamResult);
      console.log('[INTERVIEW] anamResult has overall_score?', !!anamResult.overall_score);
      
      // If anamResult has duration_minutes, use that; otherwise calculate from elapsed time
      let interviewDuration = Math.round((Date.now() - interviewStartTime) / 60000);
      if (anamResult.duration_minutes) {
        interviewDuration = anamResult.duration_minutes;
      }
      
      // Map Anam structured result to our API format
      // Prefer ACTUAL data from Anam over defaults
      const feedbackSummary = {
        overallScore: anamResult.overall_score !== undefined ? anamResult.overall_score : 75,
        strengths: (anamResult.strengths && anamResult.strengths.length > 0) ? anamResult.strengths : ['Good communication', 'Clear answers'],
        improvements: (anamResult.areas_of_improvement && anamResult.areas_of_improvement.length > 0) ? anamResult.areas_of_improvement : ['Practice more technical depth'],
        rating: anamResult.overall_rating || 'Good',
        recommendation: anamResult.recommendation || 'Hire',
        summary: (anamResult.summary && anamResult.summary.length > 10) ? anamResult.summary : 'Interview completed with Anam AI',
        targetRole: anamResult.target_role || role,
        candidateName: anamResult.candidate_name || 'Candidate'
      };

      console.log('[INTERVIEW] Saving interview for user:', userId);
      console.log('[INTERVIEW] Duration:', interviewDuration, 'min, Score:', feedbackSummary.overallScore);
      console.log('[INTERVIEW] Feedback Summary:', feedbackSummary);

      const saveRes = await fetch(`${API_BASE_URL}/api/interview/save-interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          role: feedbackSummary.targetRole || role || 'sde1-product',
          score: feedbackSummary.overallScore,
          duration: interviewDuration,
          strengths: feedbackSummary.strengths,
          improvements: feedbackSummary.improvements,
          feedback: feedbackSummary
        }),
      });

      if (saveRes.ok) {
        const saveData = await saveRes.json();
        console.log('[SUCCESS] Interview saved to profile, metrics updated:', saveData);
        // Redirect to profile to see interview history
        setTimeout(() => setLocation('/profile'), 500);
      } else {
        console.warn('[WARNING] Failed to save interview:', saveRes.status);
        // Still go back on failure
        setTimeout(() => setLocation('/profile'), 500);
      }
    } catch (err) {
      console.error('Error saving interview:', err);
      // Redirect back on error
      setTimeout(() => setLocation('/profile'), 500);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4 mx-auto" />
          <p>Preparing your interview with Anam AI...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-4 text-lg">{error}</p>
          <button
            onClick={() => setLocation('/start')}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition font-semibold"
          >
            Go Back to Start
          </button>
        </div>
      </div>
    );
  }

  // Main Interview with Anam
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col">
      {/* INTERVIEW VIEW */}
      <>
          {/* Header */}
          <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-white/10">
            <div className="max-w-6xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">Interview with Anam AI</h1>
                  <p className="text-gray-400 text-sm">
                    {role === 'sde1-product' ? 'SDE-1 Product Based' : role}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm">
                    <p className="text-gray-400">Status</p>
                    <p className="text-indigo-400 font-semibold capitalize">{anamStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-6xl mx-auto px-6 py-8 flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Anam Avatar - Main Interview Area */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-lg p-6 min-h-[500px] flex flex-col items-center justify-center">
                  {sessionId ? (
                    <div className="w-full h-full">
                      <AnamAvatar 
                        ref={anamRef}
                        onStatusChange={handleAnamStatusChange}
                        onInterviewEnd={finishInterview}
                        role={role}
                        sessionId={sessionId}
                        resumeData={resumeData}
                      />
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-400 mb-4">Initializing Anam AI interviewer...</p>
                      <div className="animate-pulse">
                        <div className="w-32 h-32 bg-indigo-500/20 rounded-full mx-auto" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Interview Info Panel */}
              <div className="space-y-6">
                {/* Tips */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="font-semibold mb-3">Interview Tips</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li>✓ Speak clearly and at a normal pace</li>
                    <li>✓ Use the STAR method for behavioral questions</li>
                    <li>✓ Think before answering - pause is okay</li>
                    <li>✓ Provide specific examples and metrics</li>
                    <li>✓ Ask clarifying questions if needed</li>
                  </ul>
                </div>

                {/* Live Feedback */}
                {anamStatus === 'connected' && (
                  <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                    <p className="text-green-300 text-sm">
                      🎤 Anam is listening - Speak your answer clearly
                    </p>
                  </div>
                )}

                {anamStatus === 'error' && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                    <p className="text-red-300 text-sm">
                      ⚠️ Connection issue - Please refresh or try again
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Interview Guide */}
            <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="font-semibold mb-4">How This Interview Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-300">
                <div>
                  <p className="text-indigo-400 font-semibold mb-2">1. Anam Greets You</p>
                  <p>The AI introduces itself and asks your name and target position</p>
                </div>
                <div>
                  <p className="text-indigo-400 font-semibold mb-2">2. Technical Questions</p>
                  <p>Anam asks role-specific technical and behavioral questions</p>
                </div>
                <div>
                  <p className="text-indigo-400 font-semibold mb-2">3. Real-time Feedback</p>
                  <p>Get evaluation and improvement suggestions after completion</p>
                </div>
              </div>
            </div>
          </div>
        </>
    </div>
  );
}
