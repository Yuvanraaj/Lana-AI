import React, { useRef, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

function AnamAvatar({ onStatusChange, onInterviewEnd, role: interviewRole, sessionId }) {
  // Use API_BASE_URL from config, which handles both dev and production
  const backendBase = API_BASE_URL || (
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost'))
      ? 'http://localhost:8001'
      : ''
  );

  // Role configuration for avatar - must be defined before fetchSessionToken uses it
  const role = 'interviewer';
  const prompt = `You are Anam, an AI technical interviewer for software roles.

OPENING:
First, greet the candidate professionally and ask them to confirm their target role from these options:
- SDE-1 Backend
- SDE-1 Frontend  
- SDE-1 Fullstack
- SDE-1 Product
- DevOps Engineer
- Data Engineer
- Custom (if they have another role in mind, ask them to briefly describe it)

If they choose "Custom", ask them to describe the role in 2-3 sentences.

INTERVIEW FLOW:
1. Collect candidate information:
   - Ask for their name
   - Ask for years of experience
   - Confirm the target role they chose
   
2. Conduct a structured technical interview:
   - Ask 3-5 technical questions specific to their chosen role
   - Ask 1-2 behavioral questions using STAR format (Situation, Task, Action, Result)
   - Ask ONE question at a time
   - Wait for their complete answer before proceeding
   - After each answer, briefly acknowledge it and move to the next question

3. Maintain professional interview tone:
   - Be supportive and constructive
   - If answers are unclear, ask one brief clarifying follow-up
   - Keep all questions strictly relevant to their confirmed target role
   - Never discuss topics unrelated to the interview
   - Total duration should be 30-40 minutes

EVALUATION AND JSON RESULT:
When you have asked all questions OR the candidate indicates they are done, you MUST return ONLY a valid JSON object with NO extra text before or after:

{
  "candidate_name": "<string>",
  "target_role": "<string>",
  "duration_minutes": <number>,
  "overall_rating": "<one of: Poor | Average | Good | Very Good | Excellent>",
  "overall_score": <number from 0 to 100>,
  "summary": "<2-4 sentence high-level summary of performance>",
  "strengths": [
    "<bullet point 1>",
    "<bullet point 2>",
    "<bullet point 3>"
  ],
  "areas_of_improvement": [
    "<bullet point 1>",
    "<bullet point 2>",
    "<bullet point 3>"
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
              // Try to access transcript from various SDK properties
              const client = clientRef.current;
              let transcript = '';
              
              if (client?.getTranscript && typeof client.getTranscript === 'function') {
                transcript = client.getTranscript();
              } else if (client?.transcript) {
                transcript = client.transcript;
              } else if (window.__anam_transcript) {
                transcript = window.__anam_transcript;
              } else if (client?.conversationHistory) {
                transcript = Array.isArray(client.conversationHistory) 
                  ? client.conversationHistory.map(msg => msg.text || msg).join('\n')
                  : client.conversationHistory;
              }
              
              // Check if we have new content to process
              if (transcript && transcript.length > 0) {
                // Look for JSON pattern in transcript
                const jsonMatch = transcript.match(/\{[\s\S]*"candidate_name"[\s\S]*"recommendation"[\s\S]*\}/);
                if (jsonMatch) {
                  try {
                    const result = JSON.parse(jsonMatch[0]);
                    console.log('✅ Parsed interview result:', result);
                    
                    // Call parent callback with the parsed interview result
                    if (onInterviewEnd) {
                      onInterviewEnd(result);
                    }
                    
                    // Stop monitoring after result is found
                    if (transcriptCheckInterval) {
                      clearInterval(transcriptCheckInterval);
                      transcriptCheckInterval = null;
                    }
                  } catch (parseErr) {
                    console.warn('⚠️ Found JSON pattern but parsing failed:', parseErr);
                  }
                }
              }
            } catch (err) {
              console.warn('⚠️ Transcript check error:', err);
            }
          };
          
          // Start polling for interview result every 2 seconds
          transcriptCheckInterval = setInterval(checkForInterviewResult, 2000);
          
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
              // Non-blocking interview flow: we do NOT use window.prompt or
              // request microphone permission automatically. This prevents any
              // browser pop-ups. Instead we use sensible defaults and log
              // instructions to the console for manual interaction.
              await speakText('Hello. I am your Virtual Interview Prep.');
              await speakText('I will ask you a few questions out loud. If you want to answer aloud, you can enable your microphone manually.');
              console.info('Anam Interview: The assistant will ask questions aloud. To answer by voice, grant microphone access manually in the browser UI.');
              const name = 'Candidate';
              await speakText(`Nice to meet you, ${name}. I will ask questions for a role-based practice.`);
              // No prompts: choose role from localStorage if the user previously set one,
              // otherwise default to 'general'. This avoids prompt popups.
              const roleInput = (localStorage.getItem('anam_desired_role') || 'general').toLowerCase();
              const roleKey = roleInput.includes('front') ? 'frontend' : roleInput.includes('back') ? 'backend' : roleInput.includes('devops') ? 'devops' : roleInput.includes('data') ? 'data' : 'general';

              // We removed hardcoded questions to keep the component minimal and
              // non-opinionated. By default the avatar simply announces readiness
              // and waits. Developers can invoke role-specific questions manually
              // from the console with window.__anamAsk([...questions]).
              await speakText('I am ready. When you want me to ask role specific questions, call window.__anamAsk(arrayOfQuestions) from the console.');
              console.info('AnamAvatar: ready. Use window.__anamAsk(["Question 1","Question 2"]) to have Anam ask custom questions.');

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
          // Strict interview flow: greet, ask name, ask position, begin interview
          if (window.__anamClient && typeof window.__anamClient.speak === 'function') {
            await window.__anamClient.speak('Hello, I am Anam, your professional job interviewer.');
            await window.__anamClient.speak('What is your name?');
            await window.__anamClient.speak('What position are you applying for?');
            setTimeout(async () => {
              await window.__anamClient.speak('Thank you. Let us begin your interview. First question: Can you tell me about yourself and your background relevant to this position?');
            }, 2500);
          }
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
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded">
      <div className="w-full max-w-3xl">
        <video
          ref={videoRef}
          id="anam-video"
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '360px', background: '#000', borderRadius: 8 }}
          onClick={onVideoClick}
        />
        <p className="mt-2 text-center text-gray-500">
          {status === 'limited'
            ? 'Streaming usage limit reached. Please upgrade your Anam plan.'
            : status.toUpperCase()}
        </p>
      </div>
    </div>
  );
}
export default AnamAvatar;
