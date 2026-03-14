/**
 * @fileoverview Interview Analytics Routes
 * Endpoints for generating summaries, storing session data, and retrieving analytics
 * Now integrated with SQLite database for persistent multi-user storage
 */

const express = require("express");
const router = express.Router();
const InterviewAnalyticsService = require("../services/InterviewAnalyticsService");
const { getRolePreset, rolePresets } = require("../config/llmPrompts");
const SessionService = require("../models/SessionService");
const UserService = require("../models/UserService");
const FeedbackService = require("../models/FeedbackService");
const { getAsync, runAsync, allAsync } = require("../models/database");
const { v4: uuidv4 } = require("uuid");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Initialize analytics service
const analyticsService = new InterviewAnalyticsService(process.env.OPENAI_API_KEY);

// Initialize sessionStore for legacy endpoints (in-memory storage)
const sessionStore = new Map();
const sessions = new Map();

// Dummy function for legacy session file storage
const saveSessionsToFile = () => {  
  // Legacy function - sessions now stored in SQLite database
};


/**
 * POST /api/interview/session/create
 * Create new interview session
 * Body: { userId, role, jobDescription? }
 */
router.post("/session/create", async (req, res) => {
  try {
    const { userId, role, jobDescription = "", isGuest = false } = req.body;

    // Validate role
    const rolePreset = getRolePreset(role);
    if (!rolePreset) {
      return res.status(400).json({ error: "Invalid role preset" });
    }

    // Ensure user exists
    let user = await UserService.getUserById(userId);
    if (!user) {
      // Create user if doesn't exist
      user = await UserService.getOrCreateUser(`user-${userId}@interview-platform.local`);
    }

    // Create session using SessionService
    const session = await SessionService.createSession(
      user.id,
      'interview',
      role,
      jobDescription,
      isGuest
    );

    res.json({
      ok: true,
      sessionId: session.id,
      session
    });
  } catch (e) {
    console.error("Error creating session:", e.message);
    res.status(500).json({ error: "Failed to create session", detail: e.message });
  }
});

/**
 * GET /api/interview/roles
 * Get available role presets
 */
router.get("/roles", (req, res) => {
  res.json({
    ok: true,
    roles: rolePresets.map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      level: r.level,
      keySkills: r.keySkills,
      commonTopics: r.commonTopics,
      difficultyLevel: r.difficultyLevel,
    })),
  });
});

/**
 * POST /api/interview/generate-questions
 * Generate interview questions based on role and JD
 * Body: { role, jobDescription?, previousQuestions?, count? }
 */
router.post("/generate-questions", async (req, res) => {
  try {
    const { role, jobDescription = "", previousQuestions = [], count = 5 } = req.body;

    // Validate role
    const rolePreset = getRolePreset(role);
    if (!rolePreset) {
      return res.status(400).json({ error: "Invalid role preset" });
    }

    const OpenAI = require("openai");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const roleContext = `Role: ${rolePreset.name} (${rolePreset.level})
Key Skills: ${rolePreset.keySkills.join(", ")}
Common Topics: ${rolePreset.commonTopics.join(", ")}
Tone: ${rolePreset.interviewTone}`;

    const previousQuestionsText =
      previousQuestions.length > 0
        ? `Already asked:\n${previousQuestions.map((q) => `- ${q}`).join("\n")}\n\n`
        : "";

    const jdContext = jobDescription
      ? `\nJob Description:\n${jobDescription}`
      : "";

    const prompt = `You are Lana, an expert technical interview coach. Generate ${count} open-ended, probing interview questions for a candidate.

${roleContext}${jdContext}

${previousQuestionsText}Generate ${count} new questions that:
1. Are relevant to the role and job description
2. Haven't been asked before (see above)
3. Are open-ended and allow the candidate to demonstrate depth
4. Vary in type: technical (30%), behavioral (50%), scenario-based (20%)
5. Are progressively more challenging

Format your response as a JSON object with an array of questions:
{
  "questions": [
    "Question 1?",
    "Question 2?",
    ...
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
      max_tokens: 500,
    });

    const responseText = response.choices[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(responseText);
      res.json({
        ok: true,
        questions: parsed.questions || [],
      });
    } catch (parseErr) {
      // If JSON parsing fails, return fallback questions
      const fallbackQuestions = [
        "Tell me about a complex project you worked on. What was your role?",
        "Describe a technical challenge you faced and how you solved it.",
        "How do you approach learning new technologies or frameworks?",
        "Tell me about a time you had to debug a difficult issue.",
        `What interests you about the ${rolePreset.name} position?`,
      ];
      res.json({
        ok: true,
        questions: fallbackQuestions.slice(0, count),
      });
    }
  } catch (e) {
    console.error("Error generating questions:", e.message);
    res.status(500).json({ error: "Failed to generate questions", detail: e.message });
  }
});


/**
 * POST /api/interview/session/:sessionId/update
 * Update session with new answer
 * Body: { question, answer }
 */
router.post("/session/:sessionId/update", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { question, answer } = req.body;

    // Validate input
    if (!question || !answer) {
      return res.status(400).json({ 
        ok: false,
        error: "Both question and answer are required" 
      });
    }

    if (typeof question !== 'string' || typeof answer !== 'string') {
      return res.status(400).json({ 
        ok: false,
        error: "Question and answer must be strings" 
      });
    }

    // Update session with Q&A
    const result = await SessionService.updateSessionQA(sessionId, question, answer);

    console.log(`[SUCCESS] Answer saved for session ${sessionId}`);

    res.json({
      ok: true,
      message: `Answer ${result.answers.length}/${result.questions.length} saved`,
      questionCount: result.questions.length,
      answerCount: result.answers.length
    });
  } catch (e) {
    console.error("Error updating session:", e.message);
    res.status(500).json({ 
      ok: false,
      error: "Failed to update session", 
      detail: e.message 
    });
  }
});

/**
 * POST /api/interview/summary
 * Generate interview summary for a completed session
 * Body: { sessionId, duration? (in minutes) }
 */
router.post("/summary", async (req, res) => {
  try {
    const { sessionId, duration = 0 } = req.body;

    const session = await SessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    // Convert duration from minutes to seconds if provided
    const durationInSeconds = (duration || 0) * 60 || session.duration_seconds || 0;

    // Build transcript from Q&A pairs
    let fullTranscript = "";
    if (session.questions && session.answers) {
      const lines = [];
      for (let i = 0; i < session.questions.length; i++) {
        lines.push(`Q${i + 1}: ${session.questions[i]}`);
        if (session.answers[i]) {
          lines.push(`A${i + 1}: ${session.answers[i]}`);
        }
      }
      fullTranscript = lines.join("\n\n");
    }

    // Score each answer and generate summary
    const answerRubrics = [];
    if (session.questions && session.answers) {
      for (let i = 0; i < session.questions.length; i++) {
        const question = session.questions[i];
        const answer = session.answers[i];
        if (question && answer) {
          const rubric = await analyticsService.scoreAnswer(question, answer, session.role);
          answerRubrics.push(rubric);
        }
      }
    }

    // Detect patterns
    const detectedPatterns = await analyticsService.detectPatterns(fullTranscript, session.role);

    // Generate summary
    const summary = await analyticsService.generateInterviewSummary({
      sessionId,
      userId: session.user_id,
      role: session.role,
      answerRubrics,
      transcript: fullTranscript,
      duration: durationInSeconds,
      detectedPatterns,
      createdAt: session.created_at,
      jdSummary: session.job_description || "",
    });

    // Generate practice plan
    const practicePlan = await analyticsService.generatePracticePlan(summary, session.role);

    // Complete session in database with results
    await SessionService.completeSession(sessionId, {
      score: summary.overallScore,
      subScores: summary.subScores,
      strengths: summary.strengths,
      improvements: summary.improvementAreas,
      patterns: summary.detectedPatterns,
      duration: durationInSeconds,
      summary: JSON.stringify(summary),
      practicePlan: JSON.stringify(practicePlan),
      externalFeedback: null
    });

    console.log(`[SUCCESS] Interview summary generated for session ${sessionId}`);

    res.json({
      ok: true,
      sessionId,
      summary,
      practicePlan,
    });
  } catch (e) {
    console.error("Error generating summary:", e.message);
    res.status(500).json({ ok: false, error: "Failed to generate summary", detail: e.message });
  }
});

/**
 * GET /api/interview/summary/:sessionId
 * Get interview summary for a completed session
 */
router.get("/summary/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await SessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ ok: false, error: "Session not found" });
    }

    if (!session.summary) {
      return res.status(404).json({ ok: false, error: "Summary not yet generated" });
    }

    res.json({
      ok: true,
      summary: JSON.parse(session.summary),
      practicePlan: session.practice_plan ? JSON.parse(session.practice_plan) : null
    });
  } catch (e) {
    console.error("Error fetching summary:", e.message);
    res.status(500).json({ ok: false, error: "Failed to fetch summary", detail: e.message });
  }
});

/**
 * GET /api/interview/history/:userId
 * Get interview history for a user (last N sessions)
 * Query: limit=10 (default)
 */
router.get("/history/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    // Use SessionService to fetch from database
    const { allAsync } = require("../models/database");
    const userSessions = await allAsync(
      `SELECT id, role, overall_score, created_at FROM interview_sessions 
       WHERE user_id = ? AND session_type = 'interview' 
       ORDER BY created_at DESC LIMIT ?`,
      [userId, limit]
    );

    const history = (userSessions || []).map((s) => ({
      sessionId: s.id,
      role: s.role,
      overallScore: s.overall_score || 0,
      completedAt: s.created_at,
    }));

    res.json({
      ok: true,
      userId,
      count: history.length,
      sessions: history,
    });
  } catch (e) {
    console.error("Error fetching history:", e.message);
    res.status(500).json({ error: "Failed to fetch history", detail: e.message });
  }
});

/**
 * GET /api/interview/session/:sessionId
 * Get session details
 */
router.get("/session/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await getAsync(
      'SELECT * FROM interview_sessions WHERE id = ?',
      [sessionId]
    );

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      ok: true,
      session,
    });
  } catch (e) {
    console.error("Error fetching session:", e.message);
    res.status(500).json({ error: "Failed to fetch session", detail: e.message });
  }
});

/**
 * Helper: Parse job description and extract key information
 * In production, this could use NLP or more sophisticated parsing
 */
function parseJobDescription(jd) {
  const lines = jd.toLowerCase().split("\n");
  const requiredSkills = [];
  const niceToHaveSkills = [];

  // Simple heuristic parsing
  let inRequired = false;
  let inNiceToHave = false;

  for (const line of lines) {
    if (line.includes("required") || line.includes("must have")) {
      inRequired = true;
      inNiceToHave = false;
    } else if (line.includes("nice to have") || line.includes("preferred")) {
      inRequired = false;
      inNiceToHave = true;
    }

    // Extract skills (simple approach: look for technical keywords)
    const keywords = [
      "javascript",
      "python",
      "java",
      "sql",
      "react",
      "node",
      "aws",
      "git",
      "docker",
      "kubernetes",
      "c++",
      "golang",
      "rust",
      "typescript",
      "rest api",
      "graphql",
      "mongodb",
      "postgresql",
      "redis",
    ];

    for (const keyword of keywords) {
      if (line.includes(keyword) && !requiredSkills.includes(keyword) && !niceToHaveSkills.includes(keyword)) {
        if (inRequired) {
          requiredSkills.push(keyword);
        } else if (inNiceToHave) {
          niceToHaveSkills.push(keyword);
        }
      }
    }
  }

  // Simple summary: first 300 chars
  const summary = jd.substring(0, 300).trim() + "...";

  return {
    requiredSkills: requiredSkills.slice(0, 8),
    niceToHaveSkills: niceToHaveSkills.slice(0, 5),
    summary,
  };
}

/**
 * POST /api/interview/demo/generate-session
 * Generate a demo session with mock Q&A pairs for quick demo purposes
 * Body: { role? } - default role if not provided
 */
router.post("/demo/generate-session", async (req, res) => {
  try {
    const { role = "sde1-product" } = req.body;

    // Validate role
    const rolePreset = getRolePreset(role);
    if (!rolePreset) {
      return res.status(400).json({ error: "Invalid role preset" });
    }

    const sessionId = `demo-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const userId = "demo-user";

    // Mock Q&A pairs for the demo
    const mockQAPairs = [
      {
        question: "Tell me about a complex project you worked on. What was your role?",
        answer:
          "I built a real-time notification system at my previous company. The situation was that our platform had 10,000+ active users and notifications were being delivered with 30-second delays. I was tasked with designing and implementing a solution. I chose to implement a WebSocket-based system that would push notifications in real-time. The action involved architecting the notification service, setting up message queues with Redis for reliability, and implementing client-side WebSocket listeners. The result was we reduced notification latency from 30 seconds to under 100ms, and improved user engagement by 25%.",
      },
      {
        question: "Describe a technical challenge you faced and how you solved it.",
        answer:
          "We faced a critical challenge with database query performance. Every morning around 9 AM, we had massive spikes in traffic, and database queries were timing out. I diagnosed the issue and found that our analytics queries were locking tables for too long. I optimized the queries, added proper indexing, and implemented caching for frequent queries. Performance improved by 10x.",
      },
      {
        question: "How do you stay updated with new technologies in your field?",
        answer:
          "I follow a structured approach. I read engineering blogs from companies like Netflix and Uber, I take online courses on platforms like Coursera, and I contribute to open-source projects. I also attend local meetups and conferences. Specifically for my role as a backend engineer, I focus on cloud technologies, databases, and system design patterns.",
      },
      {
        question: "Tell me about a time you collaborated with cross-functional teams.",
        answer:
          "Situation: We were building a payments feature for our e-commerce platform. Task: I needed to ensure the backend was compatible with the frontend and payment gateway requirements. Action: I set up weekly syncs with frontend and product teams, wrote clear API documentation, and built a test harness so the frontend team could develop in parallel. Result: We shipped the feature 2 weeks ahead of schedule.",
      },
      {
        question: "Why are you interested in this role?",
        answer:
          "I'm very interested in the backend systems work at your company, especially the opportunity to work on large-scale infrastructure. Your engineering blog posts on distributed systems have impressed me. I'm particularly excited about the database optimization challenges you mentioned in the job description. My experience with high-traffic systems and optimization aligns perfectly with what you're looking for.",
      },
    ];

    const session = {
      sessionId,
      userId,
      role,
      jobDescription: "Senior Backend Engineer role focused on building scalable systems.",
      jdParsed: {
        requiredSkills: ["Java", "Go", "System Design", "Database optimization"],
        niceToHaveSkills: ["Kubernetes", "Protocol Buffers"],
        summary: "Senior Backend Engineer role focused on building scalable systems.",
      },
      status: "completed",
      questions: mockQAPairs.map((p) => p.question),
      answers: mockQAPairs.map((p) => p.answer),
      createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      completedAt: new Date().toISOString(),
      summary: null,
      practicePlan: null,
    };

    sessionStore.set(sessionId, session);
    saveSessionsToFile();

    res.json({
      ok: true,
      sessionId,
      message: "Demo session created. Call /api/interview/summary to generate analytics.",
    });
  } catch (e) {
    console.error("Error generating demo session:", e.message);
    res
      .status(500)
      .json({ error: "Failed to generate demo session", detail: e.message });
  }
});

/**
 * POST /api/interview/save-resume
 * Save resume analysis results to database AND create session record
 * This persists the analysis and updates user metrics
 */
router.post('/save-resume', async (req, res) => {
  try {
    const { userId, fileName, result } = req.body;
    
    if (!userId || !result) {
      return res.status(400).json({ error: 'Missing userId or result data' });
    }

    // Ensure user exists
    let user = await UserService.getUserById(userId);
    if (!user) {
      user = await UserService.getOrCreateUser(`${userId}@interview-platform.local`);
    }
    const finalUserId = user.id;

    const resumeId = uuidv4();
    const atsScore = result.score || 0;
    const dbPath = path.join(__dirname, '..', 'data', 'interview_platform.db');
    const database = new sqlite3.Database(dbPath);

    // Step 1: Save to resume_analyses table
    database.run(
      `INSERT INTO resume_analyses (
        id, user_id, file_name, ats_score, 
        skills_found, strengths, gaps, 
        missing_keywords, recommendations
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        resumeId,
        finalUserId,
        fileName || 'resume.pdf',
        atsScore,
        JSON.stringify(result.skills || []),
        JSON.stringify(result.strengths || []),
        JSON.stringify(result.weaknesses || []),
        JSON.stringify(result.ats_keywords || []),
        JSON.stringify(result.suggestions || [])
      ],
      async function(err) {
        database.close();
        if (err) {
          console.error('Error saving resume:', err);
          return res.status(500).json({ error: 'Failed to save resume analysis' });
        }

        try {
          // Step 2: Create interview_sessions record and update user stats
          const sessionResult = await SessionService.recordFeedbackSession(
            finalUserId,
            {
              sessionType: 'resume_analysis',
              role: result.recommended_roles?.[0] || 'General',
              score: atsScore,
              duration: 0,
              strengths: result.strengths || [],
              improvements: result.weaknesses || [],
              title: `Resume Analysis: ${fileName || 'resume'}`
            }
          );

          console.log(`[RESUME] ✓ Resume ${resumeId} saved + session recorded + user stats updated`);
          
          res.json({ 
            ok: true, 
            resumeId,
            sessionId: sessionResult.sessionId,
            score: atsScore,
            message: 'Resume analysis saved and metrics updated'
          });
        } catch (sessionErr) {
          console.error('Error recording session for resume:', sessionErr);
          // Still return success since resume was saved, but log the stats update error
          res.json({ 
            ok: true, 
            resumeId,
            score: atsScore,
            message: 'Resume analysis saved (session recording had issues)',
            sessionWarning: sessionErr.message
          });
        }
      }
    );
  } catch (err) {
    console.error('Error in save-resume:', err);
    res.status(500).json({ error: 'Failed to save resume analysis', detail: err.message });
  }
});

/**
 * POST /api/interview/save-chatbot
 * Save chatbot session feedback to database AND create session record
 * This persists the feedback and updates user metrics
 */
router.post('/save-chatbot', async (req, res) => {
  try {
    let { userId, conversationId, feedback, score, role, duration } = req.body;
    
    if (!userId || !feedback) {
      return res.status(400).json({ error: 'Missing userId or feedback' });
    }

    // Ensure user exists in database before saving feedback
    let user = await UserService.getUserById(userId);
    if (!user) {
      user = await UserService.getOrCreateUser(`${userId}@interview-platform.local`);
      userId = user.id;
    } else {
      userId = user.id;
    }

    // Step 1: Use FeedbackService to store chatbot feedback
    const feedbackId = await FeedbackService.storeChatbotFeedback(
      userId,
      conversationId || `chat-${userId}-${Date.now()}`,
      'General', // topic
      {
        score: score || 75,
        feedback_text: typeof feedback === 'string' ? feedback : JSON.stringify(feedback),
        conversation_log: []
      }
    );

    try {
      // Step 2: Extract strengths and improvements from feedback (if available)
      let strengths = [];
      let improvements = [];
      
      if (typeof feedback === 'string') {
        // Try to parse if it's JSON string
        try {
          const feedbackObj = JSON.parse(feedback);
          strengths = feedbackObj.strengths || [];
          improvements = feedbackObj.improvements || [];
        } catch (e) {
          // If not JSON, just use empty
        }
      } else if (typeof feedback === 'object') {
        strengths = feedback.strengths || [];
        improvements = feedback.improvements || [];
      }

      // Step 3: Create interview_sessions record and update user stats
      const sessionResult = await SessionService.recordFeedbackSession(
        userId,
        {
          sessionType: 'chatbot',
          role: role || 'General',
          score: score || 75,
          duration: duration || 0,
          strengths: strengths,
          improvements: improvements,
          title: `Chatbot Session - ${role || 'General'}`
        }
      );

      console.log(`[CHATBOT] ✓ Feedback ${feedbackId} saved + session recorded + user stats updated`);
      
      res.json({ 
        ok: true, 
        feedbackId,
        sessionId: sessionResult.sessionId,
        score: score || 75,
        message: 'Chatbot session saved and metrics updated'
      });
    } catch (sessionErr) {
      console.error('Error recording session for chatbot:', sessionErr);
      // Still return success since feedback was saved, but log the stats update error
      res.json({ 
        ok: true, 
        feedbackId,
        score: score || 75,
        message: 'Chatbot feedback saved (session recording had issues)',
        sessionWarning: sessionErr.message
      });
    }
  } catch (err) {
    console.error('Error in save-chatbot:', err);
    res.status(500).json({ error: 'Failed to save chatbot feedback', detail: err.message });
  }
});

/**
 * POST /api/interview/save-interview
 * Save completed interview session to user profile
 * Creates interview_sessions record and updates user stats
 */
router.post('/save-interview', async (req, res) => {
  try {
    const { sessionId, userId, score, feedback, role, duration, strengths, improvements } = req.body;
    
    if (!sessionId || !userId) {
      return res.status(400).json({ error: 'Missing sessionId or userId' });
    }

    // Get session data
    const session = await SessionService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Ensure user exists
    let user = await UserService.getUserById(userId);
    if (!user) {
      user = await UserService.getOrCreateUser(`${userId}@interview-platform.local`);
    }

    // Step 1: Store interview feedback in legacy table
    await FeedbackService.storeInterviewFeedback(
      user.id,
      sessionId,
      feedback || {}
    );

    // Step 2: Record session in unified interview_sessions table and update user stats
    // Duration comes in minutes from frontend, convert to seconds for storage
    const durationInSeconds = (duration || 0) * 60;
    
    await SessionService.recordFeedbackSession(user.id, {
      session_type: 'interview',
      sessionId,
      role: role || session.role || 'Interview',
      score: score || 75,
      duration: durationInSeconds,
      strengths: strengths || [],
      improvements: improvements || [],
      feedback: feedback || {}
    });

    console.log(`✓ Interview session saved: ${sessionId} for user ${user.id}`);
    
    res.json({ 
      ok: true, 
      sessionId,
      score: score || 75,
      message: 'Interview session saved and metrics updated'
    });
  } catch (err) {
    console.error('Error in save-interview:', err);
    res.status(500).json({ error: 'Failed to save interview session', detail: err.message });
  }
});

module.exports = router;
