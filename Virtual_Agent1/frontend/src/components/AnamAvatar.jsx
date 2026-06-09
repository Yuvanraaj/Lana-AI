import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { API_BASE_URL } from '../config';

const AnamAvatar = forwardRef(function AnamAvatar({ onStatusChange, onInterviewEnd, role: interviewRole, sessionId, resumeData }, ref) {
  // Use API_BASE_URL from config, which is properly set for dev and production
  const backendBase = API_BASE_URL;

  // Get the role label and custom JD from localStorage (set by SelectMode)
  const roleLabel = localStorage.getItem('selectedRoleLabel') || 'SDE-1 Product';
  const customJD = localStorage.getItem('selectedJD') || '';
  const isCustomRole = roleLabel === 'Custom Role' && customJD;
  
  // Build resume context if available
  const resumeContext = resumeData ? `
CANDIDATE RESUME DATA (PROVIDED):
- Name: ${resumeData.name || 'Not provided'}
- Email: ${resumeData.email || 'Not provided'}
- Phone: ${resumeData.phone || 'Not provided'}
- Career Level: ${resumeData.career_level || 'Not specified'}
- Years of Experience: Inferred from background
- Skills: ${resumeData.skills ? resumeData.skills.slice(0, 10).join(', ') : 'Not specified'}
- Previous Experience: ${resumeData.experience ? resumeData.experience.map(e => e.title || e.company || '').filter(Boolean).slice(0, 3).join(', ') : 'Not specified'}
- Education: ${resumeData.education ? resumeData.education.map(e => e.degree || e.institution || '').filter(Boolean).join(', ') : 'Not specified'}
- Key Strengths (from resume analysis): ${resumeData.strengths ? resumeData.strengths.slice(0, 3).join(', ') : 'Not specified'}

USE THIS RESUME DATA to personalize your interview:
1. Reference their actual experience and skills
2. Ask questions that build on their background
3. Probe deeper into the technologies and roles they've worked with
4. Ask about their specific challenges in previous roles
5. Tailor the difficulty level based on their career level
` : '';
  
  // Build the role description section of the prompt
  const roleDescriptionSection = resumeData 
    ? `CANDIDATE TARGET ROLE (RESUME-BASED):
Based on the candidate's resume, they appear suited for roles involving: ${resumeData.recommended_roles ? resumeData.recommended_roles.slice(0, 2).join(', ') : 'Software Engineering'}
You will conduct an interview tailored to their background and skills.`
    : isCustomRole 
    ? `CANDIDATE TARGET ROLE (CUSTOM - PRE-SELECTED):
The candidate has selected a CUSTOM role with the following description:
"${customJD}"

In the OPENING, you MUST read back this custom role description to confirm with the candidate that you understand their target role correctly.`
    : `CANDIDATE TARGET ROLE (PRE-SELECTED):
The candidate has already selected their target role: ${roleLabel}
Do NOT ask them to select a role - it is already set. Proceed with the interview for ${roleLabel}.`;
  
  // Role configuration for avatar - must be defined before fetchSessionToken uses it
  const role = 'interviewer';
  const prompt = `You are Anam, an AI technical interviewer for software roles.

${resumeContext}

${roleDescriptionSection}

OPENING:
Greet the candidate professionally. ${resumeData ? 'Acknowledge that you have reviewed their resume and mention 1-2 things you found impressive about their background. Then ask them to confirm their name and what role they are interviewing for.' : isCustomRole ? 'Ask them to confirm their name, then read back the custom role description to confirm you understand their target role correctly, and ask for confirmation.' : `Ask for and confirm their name, then briefly acknowledge their selected role and begin the interview immediately.`}

INTERVIEW FLOW:
1. Collect candidate information:
   - Ask for and confirm their name
   - ${resumeData ? 'Reference specific experience from their resume and ask them to elaborate on it' : isCustomRole ? 'Read back and confirm the custom role description with them' : `Ask for their years of experience in the field related to ${roleLabel}`}
   - If not already done, confirm their target role
   
2. Conduct a personalized technical interview:
   ${resumeData ? '- Start with questions based on their ACTUAL experience and skills from resume' : ''}
   - Ask 3-5 technical questions ${resumeData ? 'relevant to their background and experience level' : `specific to ${resumeData ? 'their domain' : roleLabel}`}
   - Ask 1-2 behavioral questions using STAR format (Situation, Task, Action, Result)
   - Ask ONE question at a time
   - Wait for their complete answer before proceeding
   - ${resumeData ? 'Reference their specific past projects or roles when relevant' : 'After each answer, briefly acknowledge it and move to the next question'}

3. Maintain professional interview tone:
   - Be supportive and constructive
   - If answers are unclear, ask one brief clarifying follow-up
   - Keep all questions strictly relevant to ${resumeData ? 'their background and the role' : 'the role domain'}
   - Never discuss topics unrelated to the interview
   - Total duration should be 30-40 minutes

SESSION ENDING:
When the candidate indicates they want to end the session (e.g., "I'm done", "End interview", "Stop"), you MUST:
1. IMMEDIATELY stop asking any questions
2. Thank them for their time and responses
3. Provide HONEST and DETAILED verbal feedback on their interview performance:
   - ${resumeData ? 'Compare their interview performance to what you saw on their resume' : 'Mention their actual strengths clearly'}
   - Mention specific WEAKNESSES and areas needing improvement
   - Be direct, professional, and constructive (not just positive)
   - Do NOT sugarcoat - give real feedback they can act on
   - Total feedback should be 3-4 sentences covering both strengths AND weaknesses
4. Wish them well with a professional and warm closing greeting
5. Then output the JSON result with no additional text

EVALUATION AND JSON RESULT:
When the candidate indicates they are done OR after providing session-ending feedback, you MUST return ONLY a valid JSON object with NO extra text before or after:

{
  "candidate_name": "<string>",
  "target_role": "${resumeData ? (resumeData.recommended_roles ? resumeData.recommended_roles[0] : 'Software Engineer') : (isCustomRole ? 'Custom Role' : roleLabel)}",
  "duration_minutes": <number>,
  "overall_rating": "<one of: Poor | Average | Good | Very Good | Excellent>",
  "overall_score": <number from 0 to 100>,
  "summary": "<HONEST 2-4 sentence detailed summary: include BOTH strengths AND significant weaknesses. ${resumeData ? 'Compare to resume data if relevant.' : ''} Be specific and direct. Do NOT sugarcoat.>",
  "strengths": [
    "<actual strength demonstrated>",
    "<actual strength demonstrated>",
    "<actual strength demonstrated>"
  ],
  "areas_of_improvement": [
    "<specific weakness or area needing work>",
    "<specific weakness or area needing work>",
    "<specific weakness or area needing work>"
  ],
  "recommendation": "<one of: Strong Hire | Hire | Borderline | No Hire>"
}

CRITICAL JSON RULES:
- Output MUST be valid JSON
- Do NOT include any markdown, explanation, or extra text
- Do NOT include code fence markers (\`\`\`)
- Use double quotes for all keys and string values
- Ensure it can be parsed directly by JSON.parse()
- Start the JSON immediately, no preamble`;

  async function fetchSessionToken(personaOverrides = {}) {
    // Always send role and prompt as query params; let backend use default avatarId from env
    const url = `${backendBase}/api/anam/token`;
    const params = new URLSearchParams({
      ...personaOverrides,
      role,
      prompt
    }).toString();
    const finalUrl = params ? `${url}?${params}` : url;
    const resp = await fetch(finalUrl);
    if (!resp.ok) throw new Error(`Token endpoint failed: ${resp.status}`);
    const data = await resp.json();
    if (!data.sessionToken) throw new Error('No sessionToken in /api/anam/token response');
    return data.sessionToken;
  }

  const videoRef = useRef(null);
  const clientRef = useRef(null);
  const initRef = useRef(false);
  const [status, setStatus] = useState('idle'); // idle | connecting | connected | live | error | limited

  // Notify parent component when status changes
  useEffect(() => {
    if (onStatusChange) {
      onStatusChange(status);
    }
  }, [status, onStatusChange]);

  const resetClient = () => {
    try {
      clientRef.current?.close?.();
      if (window.__anamClient) window.__anamClient.close?.();
      delete window.__anamClient;
      localStorage.removeItem('anam_engine_session');
      initRef.current = false;
    } catch {}
  };

  // Store for transcript monitoring cleanup
  let transcriptCheckInterval = null;

  // Store to track if result has been received
  const resultReceivedRef = useRef(false);
  const storedResultRef = useRef(null);
  const interviewEndedRef = useRef(false);

  // Expose endInterview and speakFeedback methods to parent component
  useImperativeHandle(ref, () => ({
    endInterview: async () => {
      console.log('📞 Ending interview...');
      const client = clientRef.current;
      if (client && typeof client.speak === 'function') {
        try {
          // Send signal to Anam to end the interview
          await client.speak('I want to end the interview now.');
          console.log('✅ End interview signal sent to Anam');
          
          // Wait for result to be captured (up to 10 seconds)
          let waitCount = 0;
          while (waitCount < 20 && !resultReceivedRef.current) {
            await new Promise(r => setTimeout(r, 500));
            waitCount++;
          }
          
          if (resultReceivedRef.current) {
            console.log('✅ Interview result captured successfully');
          } else {
            console.warn('⚠️ Timeout waiting for interview result');
          }
        } catch (err) {
          console.warn('⚠️ Failed to end interview:', err);
        }
      }
    },
    
    speakFeedback: async (feedbackSummary) => {
      console.log('🗣️ Speaking feedback...');
      const client = clientRef.current;
      if (client && typeof client.speak === 'function' && feedbackSummary) {
        try {
          // Build spoken feedback from the summary
          const feedback = `
Thank you for completing the interview. Here is your detailed feedback:

Your overall score is ${feedbackSummary.overallScore} out of 100, rated as ${feedbackSummary.rating}.

${feedbackSummary.summary}

Your main strengths are: ${feedbackSummary.strengths?.join(', ') || 'Good performance'}.

Areas to focus on for improvement: ${feedbackSummary.improvements?.join(', ') || 'Continue practicing'}.

My recommendation: ${feedbackSummary.recommendation}.

Keep practicing and best of luck with your interview preparation!
          `.trim();
          
          await client.speak(feedback);
          console.log('✅ Spoke feedback to candidate');
        } catch (err) {
          console.warn('⚠️ Failed to speak feedback:', err);
        }
      }
    }
  }), []);

  // Set desired role for the Anam persona. Stored in localStorage and used when
  // requesting an engine session from the backend. Exposed as window.__anamSetRole
  // so you can call it from the console: window.__anamSetRole('frontend')
  const setAnamRole = async (roleName) => {
    try {
      if (!roleName) return false;
      // Persist desired role and persona so it sticks across reloads
      localStorage.setItem('anam_desired_role', roleName);
      const personaConfig = {
        name: 'Virtual Interview Prep',
        role: roleName,
        description: `You are a Virtual Interview Prep assistant specialized for ${roleName} roles. Ask the user their name, their target role, and conduct a role-based Q and A session to help them practice for interviews.`
      };
      try { localStorage.setItem('anam_persona', JSON.stringify(personaConfig)); } catch (e) { /* ignore */ }

      const client = clientRef.current;
      // Ask backend for an engine created with this personaConfig
  const resp = await fetch(`${backendBase || ''}/api/anam/engine`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ personaConfig }) });
      const bodyWrap = await (async () => { try { return await resp.json(); } catch { return null; } })();
      const body = bodyWrap && (bodyWrap.body || bodyWrap) || null;
        // Debug: show key fields so we can confirm the browser received the token
        try {
          const dbg = {
            sessionToken: body?.sessionToken || body?.token || body?.data?.sessionToken || body?.data?.token || body?.body?.sessionToken,
            signallingUrl: body?.signallingUrl || body?.signallingEndpoint || body?.signalling || body?.wsEndpoint || `${backendBase || ''}/api/anam/ws-proxy`,
            heartbeatIntervalSeconds: body?.heartbeatIntervalSeconds || body?.clientConfig?.expectedHeartbeatIntervalSecs
          };
          console.debug('Anam engine response debug:', dbg, 'full:', bodyWrap);
        } catch (e) { /* ignore */ }
      if (body && (body.session_id || body.engine_session || body.id)) {
        const session_id = body.session_id || body.engine_session || body.id;
        try { localStorage.setItem('anam_engine_session', JSON.stringify({ ...body, session_id })); } catch (e) {}
        window.__anam_engine_id = session_id;
        console.log('♻️ Switched Anam role and stored engine session:', roleName, session_id);

        // If SDK client exists, trigger a session start or re-init to pick up persona
        if (client) {
          const startFn = client.startSessionIfNeeded || client.startSession || client.start || client.createSession || client.open;
          if (typeof startFn === 'function') {
            try { await startFn.call(client).catch(() => null); await attachStream(client).catch(() => null); } catch (e) { console.warn('⚠️ startSession attempt failed after role change', e); }
          } else {
            try { resetClient(); await initAnam(); } catch (e) { console.warn('⚠️ re-init failed after role change', e); }
          }
        }
        return true;
      }
      console.warn('❌ setAnamRole: backend did not return a valid engine session for role', roleName, bodyWrap);
      return false;
    } catch (e) {
      console.error('❌ setAnamRole error', e);
      return false;
    }
  };

  // Helpers to get/set persona explicitly
  const getAnamPersona = () => {
    try { return JSON.parse(localStorage.getItem('anam_persona') || 'null'); } catch { return null; }
  };
  const setAnamPersona = async (persona) => {
    if (!persona || !persona.role) return false;
    try { localStorage.setItem('anam_persona', JSON.stringify(persona)); localStorage.setItem('anam_desired_role', persona.role); return await setAnamRole(persona.role); } catch (e) { return false; }
  };
  try { window.__anamGetPersona = getAnamPersona; window.__anamSetPersona = setAnamPersona; } catch (e) {}

  // expose helper globally
  try { window.__anamSetRole = setAnamRole; } catch (e) {}


  const CB = {
    blockedUntil: 0,
    cooldownMs: 10_000, // 10s cooldown to be less aggressive during dev
    lastError: null,
  };
  try { window.__anamCircuitBreaker = CB; } catch (e) {}

  // Manual retry helper exposed for developer convenience
  try {
    window.__anamRetryEngine = async () => {
      CB.blockedUntil = 0;
      CB.lastError = null;
      console.log('🔁 Anam engine retry unlocked (manual)');
      return await initAnam();
    };
  } catch (e) {}

  // Note: a single global fetch interceptor is installed at module load above.
  // We intentionally avoid installing additional interceptors here to keep the
  // behavior deterministic and ensure the SDK's internal fetch calls are
  // consistently routed to the backend `/api/anam/engine` endpoint.

  const getSessionToken = async () => {
    // Always send hardcoded role and prompt
    const persona = { role, prompt };
    if (window.__anamToken) return window.__anamToken;
    console.log('🔄 Fetching Anam session token (direct) ...');
    const token = await fetchSessionToken(persona);
    window.__anamToken = token;
    console.log('✅ Received Anam session token');
    return token;
  };

  const attachStream = async (client) => {
    const el = videoRef.current;
    if (!el) return false;

    try {
      // Ensure SDK has a started session before requesting streams. Some SDK
      // methods lazily start a session; call available start helpers so we can
      // catch failures earlier and attempt a backend proxy to create a session.
      const startIfNeeded = client && (client.startSessionIfNeeded || client.startSession || client.start || client.createSession || client.open);
      if (typeof startIfNeeded === 'function') {
        try {
          await startIfNeeded.call(client);
        } catch (startErr) {
          console.warn('⚠️ SDK startSession failed locally, attempting backend proxy to create session', startErr);
          // Try backend proxy to create an upstream engine session and persist it
          try {
            // Use the primary engine endpoint only. The backend will perform the
            // required auth exchange and return a normalized engine session.
            const proxyResp = await fetch(`${backendBase || ''}/api/anam/engine`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
            const proxyBody = await (async () => { try { return await proxyResp.json(); } catch { return null; } })();
              try {
                const dbg = {
                  sessionToken: proxyBody?.sessionToken || proxyBody?.token || proxyBody?.data?.sessionToken || proxyBody?.data?.token || proxyBody?.body?.sessionToken,
                  signallingUrl: proxyBody?.signallingUrl || proxyBody?.signallingEndpoint || proxyBody?.signalling || proxyBody?.wsEndpoint,
                  heartbeatIntervalSeconds: proxyBody?.heartbeatIntervalSeconds || proxyBody?.clientConfig?.expectedHeartbeatIntervalSecs
                };
                console.debug('Anam engine proxy response debug:', dbg, 'full:', proxyBody);
              } catch (e) { /* ignore */ }
            const sid = proxyBody && (proxyBody.session_id || (proxyBody.body && (proxyBody.body.session_id || proxyBody.body.id)) || proxyBody.engine_session || proxyBody.id);
            if (sid) {
                // Ensure signallingUrl exists and points to backend proxy if needed
                try {
                  if (!proxyBody.signallingUrl) proxyBody.signallingUrl = `${backendBase || ''}/api/anam/ws-proxy`;
                } catch (e) {}
              try { localStorage.setItem('anam_engine_session', JSON.stringify({ ...(proxyBody.body || proxyBody), session_id: sid })); } catch (e) {}
              window.__anam_engine_response = { ...(proxyBody.body || proxyBody), session_id: sid };
              window.__anam_engine_id = sid;
              console.log('♻️ Obtained engine session via backend and cached it for SDK use', sid);
            } else {
              console.warn('⚠️ backend did not return a recognizable session body', proxyBody);
            }
          } catch (proxyErr) {
            console.warn('⚠️ backend engine attempt failed', proxyErr);
          }
          // Retry start after proxy attempt
          try { await startIfNeeded.call(client); } catch (retryErr) { console.error('❌ startSession retry failed', retryErr); throw retryErr; }
        }
      }

      // If there's already a stream, reuse it
      if (typeof client.getStream === 'function') {
        const existing = await client.getStream().catch(() => null);
        if (existing) {
          el.srcObject = existing;
          el.muted = false;
          await el.play().catch(() => {});
          return true;
        }
      }

      // Attempt normal streaming
      if (typeof client.streamToVideoElement === 'function') {
        await client.streamToVideoElement(el.id || (el.id = 'anam-video'));
        el.muted = false;
        await el.play().catch(() => {});
        return true;
      }
      if (typeof client.stream === 'function') {
        await client.stream({ element: el });
        el.muted = false;
        await el.play().catch(() => {});
        return true;
      }
      if (typeof client.streamToElement === 'function') {
        await client.streamToElement(el);
        el.muted = false;
        await el.play().catch(() => {});
        return true;
      }
    } catch (err) {
      if (err.message?.includes('Already streaming')) {
        console.log('♻️ Reusing existing stream');
        const existing = el.srcObject || el.src;
        if (existing) return true;
      }
      if (err.message?.includes('Usage limit reached')) {
        console.error('⛔ Anam streaming failed: Usage limit reached. Please upgrade your Anam plan.');
        setStatus('limited');
      } else {
        console.warn('⚠️ stream failed:', err);
      }
    }
    return false;
  };

  /** Request microphone permission and store stream for SDK use */
  const requestMicrophonePermission = async () => {
    try {
      if (window.__anam_mic_stream) return window.__anam_mic_stream;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return null;
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      window.__anam_mic_stream = s;
      console.log('🎤 Microphone permission granted');
      return s;
    } catch (e) {
      console.warn('⚠️ Microphone permission denied or failed', e);
      return null;
    }
  };

  /** Record an answer via MediaRecorder for a few seconds and return a Blob (wav/webm) */
  const recordAnswer = async (durationMs = 6000) => {
    try {
      const stream = window.__anam_mic_stream || (await requestMicrophonePermission());
      if (!stream) return null;
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      return await new Promise((resolve) => {
        recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: chunks[0]?.type || 'audio/webm' });
          resolve(blob);
        };
        recorder.start();
        setTimeout(() => recorder.state === 'recording' && recorder.stop(), durationMs);
      });
    } catch (e) {
      console.warn('⚠️ recordAnswer failed', e);
      return null;
    }
  };

  const initAnam = async (personaOverrides = {}) => {
    if (initRef.current) {
      console.log('⚠️ Anam already initializing, skipping duplicate initialization');
      return false;
    }
    initRef.current = true;
    setStatus('connecting');
    console.log('🔄 Initializing Anam client and resetting previous state');
    
    resetClient();

    try {
      const token = await getSessionToken(personaOverrides);
      if (!token) throw new Error('Failed to retrieve session token');
      // No backend engine session logic needed; role is passed to token endpoint.

      console.log('🔄 Loading Anam SDK...');
      const sdk = await import('https://esm.sh/@anam-ai/js-sdk@latest');
      console.log('✅ Anam SDK loaded');
      
      const createClient = sdk.createClient || (sdk.default && sdk.default.createClient);
      if (!createClient) {
        console.error('❌ No createClient function found in SDK');
        throw new Error('No createClient function in SDK');
      }
      
      console.log('🔄 Creating Anam client with token...');
      if (!token || token.length < 10) {
        console.error('❌ Invalid token format:', token);
        throw new Error('Invalid token format');
      }
      
      // Log token format for debugging
      console.log('🔑 Token format check:', token.includes('.') ? 
                  `JWT-like with ${token.split('.').length} parts` : 
                  'Not in standard JWT format');
      
      const client = createClient(token);
      clientRef.current = client;
      window.__anamClient = client;
      console.log('✅ Anam client created successfully');

      // Direct mode: no fetch or WebSocket monkey patching; SDK handles WebRTC.

      console.log('🔄 Attaching video stream from Anam...');
      try {
        const attached = await attachStream(client);
        console.log(attached ? '✅ Stream attached successfully' : '⚠️ Stream attachment returned false');
        setStatus(attached ? 'live' : 'connected');

        if (attached) {
          // Set up transcript monitoring to detect JSON interview result
          const checkForInterviewResult = () => {
            try {
              // Try multiple methods to get Anam's transcript/response
              const client = clientRef.current;
              let transcript = '';
              
              // Check if user said "End Interview" in transcript
              if (client?.getTranscript && typeof client.getTranscript === 'function') {
                try {
                  transcript = client.getTranscript() || '';
                } catch (e) { /* ignore */ }
              }
              if (!transcript && client?.transcript) {
                transcript = client.transcript || '';
              }
              if (!transcript && window.__anam_transcript) {
                transcript = window.__anam_transcript || '';
              }
              
              // Check if user said "End Interview" or similar phrases
              const endPhrases = [
                'end interview',
                'end the interview', 
                'end session',
                'stop interview',
                'i want to end',
                'finish interview'
              ];
              
              const lowerTranscript = transcript.toLowerCase();
              const userSaidEnd = endPhrases.some(phrase => lowerTranscript.includes(phrase));
              
              if (userSaidEnd && !interviewEndedRef.current) {
                console.log('🎯 Detected "End Interview" in user speech - auto-ending interview');
                interviewEndedRef.current = true;
                // Auto-end the interview
                if (client && typeof client.speak === 'function') {
                  client.speak('I will end the interview now and provide your feedback.').catch(() => {});
                }
              }
              
              // Now check for result
              transcript = '';
              let foundResult = false;
              
              // Method 1: SDK getTranscript function
              if (client?.getTranscript && typeof client.getTranscript === 'function') {
                try {
                  transcript = client.getTranscript();
                  console.log('[TRANSCRIPT] Method 1 (getTranscript):', transcript?.substring(0, 100) + '...');
                } catch (e) { console.warn('[TRANSCRIPT] getTranscript failed:', e); }
              }
              
              // Method 2: Direct transcript property
              if (!foundResult && client?.transcript) {
                transcript = client.transcript;
                console.log('[TRANSCRIPT] Method 2 (direct property):', transcript?.substring(0, 100) + '...');
              }
              
              // Method 3: Window global variable
              if (!foundResult && window.__anam_transcript) {
                transcript = window.__anam_transcript;
                console.log('[TRANSCRIPT] Method 3 (window global):', transcript?.substring(0, 100) + '...');
              }
              
              // Method 4: Conversation history
              if (!foundResult && client?.conversationHistory) {
                transcript = Array.isArray(client.conversationHistory) 
                  ? client.conversationHistory.map(msg => msg.text || msg).join('\n')
                  : client.conversationHistory;
                console.log('[TRANSCRIPT] Method 4 (conversationHistory):', transcript?.substring(0, 100) + '...');
              }
              
              // Method 5: Check window for any stored result
              if (window.__anam_result) {
                try {
                  const result = JSON.parse(window.__anam_result);
                  console.log('✅ Found stored result in window.__anam_result:', result);
                  if (!resultReceivedRef.current) {
                    resultReceivedRef.current = true;
                    storedResultRef.current = result;
                    if (onInterviewEnd) onInterviewEnd(result);
                  }
                  if (transcriptCheckInterval) clearInterval(transcriptCheckInterval);
                  return;
                } catch (e) { console.warn('[RESULT] Failed to parse stored result:', e); }
              }
              
              // Check if we have new content to process
              if (transcript && transcript.length > 0) {
                console.log('[TRANSCRIPT] Full transcript length:', transcript.length);
                
                // Look for JSON pattern - try multiple patterns
                let jsonMatch = null;
                
                // Pattern 1: Strict pattern with all required fields
                jsonMatch = transcript.match(/\{[\s\S]*?"candidate_name"[\s\S]*?"recommendation"[\s\S]*?\}/);
                
                // Pattern 2: If strict doesn't work, try more flexible pattern
                if (!jsonMatch) {
                  jsonMatch = transcript.match(/\{[\s\S]*?"overall_score"[\s\S]*?\}/);
                  console.log('[JSON] Trying flexible pattern...');
                }
                
                // Pattern 3: Look for JSON at the very end (most likely where result would be)
                if (!jsonMatch) {
                  const lastBrace = transcript.lastIndexOf('}');
                  const firstBrace = transcript.lastIndexOf('{', lastBrace);
                  if (firstBrace > -1 && lastBrace > firstBrace) {
                    const potentialJson = transcript.substring(firstBrace, lastBrace + 1);
                    try {
                      JSON.parse(potentialJson);
                      jsonMatch = [potentialJson];
                      console.log('[JSON] Found JSON at end of transcript');
                    } catch (e) { console.warn('[JSON] Potential JSON at end is invalid'); }
                  }
                }
                
                if (jsonMatch) {
                  try {
                    const result = JSON.parse(jsonMatch[0]);
                    console.log('✅ Parsed interview result from transcript:', result);
                    window.__anam_result = JSON.stringify(result); // Store for later
                    storedResultRef.current = result;
                    resultReceivedRef.current = true;
                    
                    // Call parent callback with the parsed interview result
                    if (onInterviewEnd) {
                      onInterviewEnd(result);
                    }
                    
                    // Stop monitoring after result is found
                    if (transcriptCheckInterval) {
                      clearInterval(transcriptCheckInterval);
                      transcriptCheckInterval = null;
                    }
                    foundResult = true;
                  } catch (parseErr) {
                    console.warn('⚠️ Found JSON pattern but parsing failed:', parseErr);
                    console.log('[DEBUG] Problematic JSON:', jsonMatch[0]?.substring(0, 200));
                  }
                }
                
                if (!foundResult) {
                  // Log hints if we still don't have a result
                  if (transcript.includes('"overall_score"')) console.log('[HINT] Transcript contains score field but JSON pattern not matching');
                  if (transcript.includes('"candidate_name"')) console.log('[HINT] Transcript contains candidate_name field');
                  if (transcript.includes('{')) console.log('[HINT] Transcript contains braces');
                }
              }
            } catch (err) {
              console.warn('⚠️ Transcript check error:', err);
            }
          };
          
          // Start polling for interview result more frequently
          transcriptCheckInterval = setInterval(checkForInterviewResult, 1000);
          
          // If attached, start the interview flow:
          // - ask name
          // - ask role
          // - ask 3 role-based questions (voice + prompt)
          const speakText = async (text) => {
            // Strict: use only Anam SDK voice
            const client = clientRef.current;
            if (client && typeof client.speak === 'function') {
              try {
                return await client.speak(text);
              } catch (err) {
                console.warn('⚠️ Failed to speak text:', err);
                // Don't rethrow - just return silently
              }
            } else {
              console.warn('❓ Anam speak function not available');
            }
          };

          const startInterview = async () => {
            try {
              // Interview flow with pre-selected role from SelectMode
              // No role selection dialog - proceed directly with interview
              await speakText('Hello. I am Anam, your professional job interviewer.');
              await speakText('What is your name?');
              
              // Brief pause to let user respond
              await new Promise(r => setTimeout(r, 2000));
              
              // Acknowledge the role and start interview
              if (isCustomRole) {
                await speakText('I see you have selected a custom role. Let me confirm I understand your target role correctly.');
                await speakText('Your target role: ' + customJD);
                await speakText('Is this correct?');
                await new Promise(r => setTimeout(r, 2000));
              } else {
                await speakText('Great. I will interview you for the ' + roleLabel + ' role.');
                await new Promise(r => setTimeout(r, 1000));
              }
              
              // Begin interview
              await speakText('Thank you. Let us begin your interview.');

              // Developer helper: speak an array of custom questions (non-blocking)
              try {
                window.__anamAsk = async (arr) => {
                  if (!Array.isArray(arr)) {
                    console.warn('window.__anamAsk expects an array of strings');
                    return;
                  }
                  for (const q of arr) {
                    try { await speakText(q); } catch (e) { console.warn('⚠️ speakText failed for question', q, e); }
                    // short pause between questions
                    await new Promise(r => setTimeout(r, 600));
                  }
                };
              } catch (e) { console.warn('⚠️ failed to install window.__anamAsk helper', e); }
            } catch (e) {
              console.warn('⚠️ interview flow error', e);
            }
          };

          // Expose helpers for manual conversation from anywhere
          if (clientRef.current && typeof clientRef.current.speak === 'function') {
            window.anamSay = async (text) => {
              try {
                await clientRef.current.speak(text);
              } catch (e) {
                console.warn('Anam speak failed', e);
              }
            };
            window.anamAsk = async (arr) => {
              if (!Array.isArray(arr)) {
                console.warn('anamAsk expects an array of strings');
                return;
              }
              for (const q of arr) {
                try { await clientRef.current.speak(q); } catch (e) { console.warn('speak failed', e); }
                await new Promise(r => setTimeout(r, 600));
              }
            };

            // Wait for video to actually be playing before Anam speaks
            await new Promise((resolve) => {
              const v = videoRef.current;
              if (!v) return resolve();
              if (v.readyState >= 3 && !v.paused) return resolve(); // already playing
              const onPlaying = () => {
                v.removeEventListener('playing', onPlaying);
                v.removeEventListener('canplay', onCanPlay);
                resolve();
              };
              const onCanPlay = () => {
                v.removeEventListener('playing', onPlaying);
                v.removeEventListener('canplay', onCanPlay);
                v.play().catch(() => {});
                resolve();
              };
              v.addEventListener('playing', onPlaying);
              v.addEventListener('canplay', onCanPlay);
              setTimeout(resolve, 10000); // fallback: start after 10s regardless
            });
            console.log('✅ Video is playing — starting interview');

            startInterview().catch((e) => console.warn('⚠️ startInterview failed', e));
            console.info('You can now use window.anamSay("Hello!") or window.anamAsk(["Q1","Q2"]) from anywhere to continue the conversation.');
          } else {
            console.info('ℹ️ Skipping automated interview flow because client.speak is not available. Use window.anamSay or window.anamAsk when ready.');
          }
        }
      } catch (streamError) {
        console.error('❌ Error attaching stream:', streamError);
        setStatus('connected'); // Still mark as connected since the client was created
      }
      return true;
    } catch (err) {
      console.error('❌ Anam init error:', err);
      setStatus('error');
      initRef.current = false;
      return false;
    }
  };

  const onVideoClick = async () => {
    const v = videoRef.current;
    if (v) {
      v.muted = false;
      await v.play().catch(() => {});
    }
    if (status !== 'idle' && status !== 'error') return;
    const ok = await initAnam();
    if (ok && window.__anamSpeak) await window.__anamSpeak('Hello');
  };

  useEffect(() => {
    (async () => {
      try {
        console.log('🔄 Initializing Anam avatar...');
        const ok = await initAnam();
        if (ok) {
          console.log('✅ Anam avatar initialized successfully');
          console.log(`📋 Interview Role: ${isCustomRole ? 'Custom - ' + customJD : roleLabel}`);
          console.log('💬 Anam is ready. Grant microphone permission to answer questions by voice.');
        } else {
          console.error('❌ Failed to initialize Anam avatar');
        }
      } catch (error) {
        console.error('❌ Error initializing Anam avatar:', error);
      }
    })();
    return () => {
      resetClient();
      if (transcriptCheckInterval) {
        clearInterval(transcriptCheckInterval);
        transcriptCheckInterval = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black relative">
      <div className="w-full h-full rounded-[2rem] overflow-hidden bg-black relative">
        <video
          ref={videoRef}
          id="anam-video"
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onClick={onVideoClick}
        />
        {/* Subtle Status Overlay */}
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
          <div className={`w-1.5 h-1.5 rounded-full ${status === 'live' || status === 'connected' ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'}`} />
          <p className="text-[10px] tracking-widest text-white font-bold uppercase">
            {status === 'limited' ? 'LIMIT REACHED' : status}
          </p>
        </div>
      </div>
    </div>
  );
});

export default AnamAvatar;
