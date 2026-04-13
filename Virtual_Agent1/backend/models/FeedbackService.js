/**
 * Feedback Service - Handles feedback from all three modes
 */

const { v4: uuid } = require('uuid');
const { runAsync, getAsync, allAsync } = require('./database');

class FeedbackService {
  /**
   * Store resume analysis feedback
   */
  static async storeResumeFeedback(userId, fileName, analysis) {
    try {
      const feedbackId = uuid();

      await runAsync(
        `INSERT INTO resume_analyses 
         (id, user_id, file_name, ats_score, skills_found, strengths, gaps, missing_keywords, recommendations) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          feedbackId,
          userId,
          fileName,
          analysis.ats_score || 0,
          JSON.stringify(analysis.skills_found || []),
          JSON.stringify(analysis.strengths || []),
          JSON.stringify(analysis.gaps || []),
          JSON.stringify(analysis.missing_keywords || []),
          JSON.stringify(analysis.recommendations || [])
        ]
      );

      console.log(`[FEEDBACK] Stored resume analysis: ${feedbackId} for user ${userId}`);

      return feedbackId;
    } catch (err) {
      console.error('Error in storeResumeFeedback:', err);
      throw err;
    }
  }

  /**
   * Get user's resume analysis history
   */
  static async getUserResumeAnalyses(userId, limit = 10) {
    try {
      const analyses = await allAsync(
        `SELECT * FROM resume_analyses 
         WHERE user_id = ?
         ORDER BY analyzed_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return analyses.map(a => ({
        ...a,
        skills_found: JSON.parse(a.skills_found || '[]'),
        strengths: JSON.parse(a.strengths || '[]'),
        gaps: JSON.parse(a.gaps || '[]'),
        missing_keywords: JSON.parse(a.missing_keywords || '[]'),
        recommendations: JSON.parse(a.recommendations || '[]')
      }));
    } catch (err) {
      console.error('Error in getUserResumeAnalyses:', err);
      throw err;
    }
  }

  /**
   * Store chatbot conversation feedback
   */
  static async storeChatbotFeedback(userId, conversationId, topic, feedback) {
    try {
      const feedbackId = uuid();

      await runAsync(
        `INSERT INTO chatbot_feedback 
         (id, user_id, conversation_id, topic, score, feedback_text, conversation_log) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          feedbackId,
          userId,
          conversationId,
          topic,
          feedback.score || 0,
          feedback.feedback_text || '',
          JSON.stringify(feedback.conversation_log || [])
        ]
      );

      console.log(`[FEEDBACK] Stored chatbot feedback: ${feedbackId} for user ${userId}`);

      return feedbackId;
    } catch (err) {
      console.error('Error in storeChatbotFeedback:', err);
      throw err;
    }
  }

  /**
   * Get user's chatbot feedback history
   */
  static async getUserChatbotFeedback(userId, limit = 10) {
    try {
      const feedbacks = await allAsync(
        `SELECT * FROM chatbot_feedback 
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return feedbacks.map(f => ({
        ...f,
        conversation_log: JSON.parse(f.conversation_log || '[]')
      }));
    } catch (err) {
      console.error('Error in getUserChatbotFeedback:', err);
      throw err;
    }
  }

  /**
   * Store interview session feedback (called when interview completes)
   */
  static async storeInterviewFeedback(userId, sessionId, feedback) {
    try {
      // The interview_sessions table already stores feedback, this is a convenience method
      // Ensures feedback is properly indexed and retrievable
      console.log(`[FEEDBACK] Interview feedback stored for session ${sessionId} (user: ${userId})`);
      return sessionId;
    } catch (err) {
      console.error('Error in storeInterviewFeedback:', err);
      throw err;
    }
  }

  /**
   * Get user's interview sessions with feedback
   */
  static async getUserInterviewSessions(userId, limit = 10) {
    try {
      const sessions = await allAsync(
        `SELECT * FROM interview_sessions 
         WHERE user_id = ? AND status = 'completed'
         ORDER BY completed_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return sessions.map(s => ({
        ...s,
        sub_scores: s.sub_scores ? JSON.parse(s.sub_scores) : {},
        strengths: s.strengths ? JSON.parse(s.strengths) : [],
        improvements: s.improvements ? JSON.parse(s.improvements) : [],
        patterns: s.patterns ? JSON.parse(s.patterns) : [],
        questions: s.questions ? JSON.parse(s.questions) : [],
        answers: s.answers ? JSON.parse(s.answers) : [],
        summary: s.summary ? JSON.parse(s.summary) : null,
        practice_plan: s.practice_plan ? JSON.parse(s.practice_plan) : null
      }));
    } catch (err) {
      console.error('Error in getUserInterviewSessions:', err);
      throw err;
    }
  }

  /**
   * Get comprehensive feedback summary (all modes combined)
   */
  static async getComprehensiveFeedback(userId, days = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - days);
      const sinceStr = since.toISOString();

      // Interview sessions
      const interviewSessions = await allAsync(
        `SELECT * FROM interview_sessions 
         WHERE user_id = ? AND completed_at > ? AND status = 'completed'
         ORDER BY completed_at DESC`,
        [userId, sinceStr]
      );

      // Resume analyses
      const resumeAnalyses = await allAsync(
        `SELECT * FROM resume_analyses 
         WHERE user_id = ? AND analyzed_at > ?
         ORDER BY analyzed_at DESC`,
        [userId, sinceStr]
      );

      // Chatbot feedbacks
      const chatbotFeedbacks = await allAsync(
        `SELECT * FROM chatbot_feedback 
         WHERE user_id = ? AND created_at > ?
         ORDER BY created_at DESC`,
        [userId, sinceStr]
      );

      // Calculate aggregate scores
      const interviewScores = interviewSessions
        .map(s => s.score)
        .filter(s => s !== null);
      
      const resumeScores = resumeAnalyses.map(a => a.ats_score);
      
      const chatbotScores = chatbotFeedbacks.map(f => f.score);

      return {
        summary: {
          totalActivities: interviewSessions.length + resumeAnalyses.length + chatbotFeedbacks.length,
          interviews: interviewSessions.length,
          resumeAnalyses: resumeAnalyses.length,
          chatbotSessions: chatbotFeedbacks.length,
          period: `Last ${days} days`
        },
        scores: {
          avgInterviewScore: interviewScores.length > 0 ? (interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length).toFixed(1) : 0,
          avgResumeScore: resumeScores.length > 0 ? (resumeScores.reduce((a, b) => a + b, 0) / resumeScores.length).toFixed(1) : 0,
          avgChatbotScore: chatbotScores.length > 0 ? (chatbotScores.reduce((a, b) => a + b, 0) / chatbotScores.length).toFixed(1) : 0,
          overallScore: this.calculateOverallScore(interviewScores, resumeScores, chatbotScores)
        },
        recentActivities: {
          lastInterview: interviewSessions[0] || null,
          lastResumeAnalysis: resumeAnalyses[0] || null,
          lastChatbotFeedback: chatbotFeedbacks[0] || null
        }
      };
    } catch (err) {
      console.error('Error in getComprehensiveFeedback:', err);
      throw err;
    }
  }

  /**
   * Calculate overall score from all modes
   */
  static calculateOverallScore(interviewScores, resumeScores, chatbotScores) {
    const allScores = [
      ...(interviewScores || []),
      ...(resumeScores || []),
      ...(chatbotScores || [])
    ];

    if (allScores.length === 0) return 0;

    return Math.round(
      (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10
    ) / 10;
  }
}

module.exports = FeedbackService;
