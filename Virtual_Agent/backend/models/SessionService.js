/**
 * Session Service - Handles interview session operations
 */

const { v4: uuid } = require('uuid');
const { runAsync, getAsync, allAsync } = require('./database');

class SessionService {
  /**
   * Create interview session
   */
  static async createSession(userId, sessionType, role, jobDescription = null, isGuest = false) {
    try {
      const sessionId = uuid();
      const now = new Date().toISOString();

      await runAsync(
        `INSERT INTO interview_sessions 
         (id, user_id, session_type, role, job_description, status, created_at) 
         VALUES (?, ?, ?, ?, ?, 'in_progress', ?)`,
        [sessionId, userId, sessionType, role, jobDescription, now]
      );

      console.log(`[SESSION] Created session: ${sessionId} for user ${userId}`);

      return {
        id: sessionId,
        user_id: userId,
        session_type: sessionType,
        role,
        job_description: jobDescription,
        is_guest: isGuest,
        status: 'in_progress',
        created_at: now
      };
    } catch (err) {
      console.error('Error in createSession:', err);
      throw err;
    }
  }

  /**
   * Update session with Q&A
   */
  static async updateSessionQA(sessionId, question, answer) {
    try {
      const session = await getAsync(
        'SELECT * FROM interview_sessions WHERE id = ?',
        [sessionId]
      );

      if (!session) throw new Error('Session not found');

      let questions = session.questions ? JSON.parse(session.questions) : [];
      let answers = session.answers ? JSON.parse(session.answers) : [];

      questions.push(question);
      answers.push(answer);

      await runAsync(
        `UPDATE interview_sessions 
         SET questions = ?, answers = ? 
         WHERE id = ?`,
        [JSON.stringify(questions), JSON.stringify(answers), sessionId]
      );

      console.log(`[SESSION] Updated Q&A for session ${sessionId}`);

      return { questions, answers };
    } catch (err) {
      console.error('Error in updateSessionQA:', err);
      throw err;
    }
  }

  /**
   * Complete interview session with full results and update user statistics
   */
  static async completeSession(sessionId, results) {
    try {
      const {
        score,
        subScores,
        strengths,
        improvements,
        patterns,
        duration,
        summary,
        practicePlan,
        externalFeedback
      } = results;

      const now = new Date().toISOString();

      // Get session details to retrieve userId
      const session = await getAsync(
        'SELECT user_id FROM interview_sessions WHERE id = ?',
        [sessionId]
      );

      if (!session) throw new Error('Session not found');
      const userId = session.user_id;

      // Update interview session
      await runAsync(
        `UPDATE interview_sessions 
         SET status = 'completed',
             score = ?,
             sub_scores = ?,
             strengths = ?,
             improvements = ?,
             patterns = ?,
             duration_seconds = ?,
             summary = ?,
             practice_plan = ?,
             external_feedback = ?,
             feedback_score = ?,
             performance_index = ?,
             completed_at = ?
         WHERE id = ?`,
        [
          score,
          JSON.stringify(subScores),
          JSON.stringify(strengths),
          JSON.stringify(improvements),
          JSON.stringify(patterns),
          duration || 0,
          summary,
          practicePlan,
          externalFeedback,
          score,
          Math.round((score / 100) * 100), // Performance index as percentage
          now,
          sessionId
        ]
      );

      // Update user statistics
      await this._updateUserStats(userId, score, duration || 0);

      console.log(`[SESSION] Completed session: ${sessionId} with score: ${score}`);
      console.log(`[STATS] Updated user performance metrics for user: ${userId}`);

      return { status: 'completed', score, completedAt: now };
    } catch (err) {
      console.error('Error in completeSession:', err);
      throw err;
    }
  }

  /**
   * Update user statistics when a session completes
   * @private
   */
  static async _updateUserStats(userId, score, duration) {
    try {
      // Get current user stats
      let user = await getAsync(
        `SELECT total_interviews, average_score, best_score, total_practice_time 
         FROM users WHERE id = ?`,
        [userId]
      );

      // If user doesn't exist, create them first
      if (!user) {
        console.log(`[USER] Creating missing user ${userId} for session completion`);
        try {
          await runAsync(
            `INSERT INTO users (id, email, name, created_at, last_login) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, `user+${userId}@lanaai.local`, `User ${userId.substring(0, 8)}`, new Date().toISOString(), new Date().toISOString()]
          );
          console.log(`[USER] Auto-created user: ${userId}`);
          
          // Now fetch the user we just created
          user = await getAsync(
            `SELECT total_interviews, average_score, best_score, total_practice_time 
             FROM users WHERE id = ?`,
            [userId]
          );
        } catch (createErr) {
          console.warn(`Cannot auto-create user ${userId}: ${createErr.message}`);
          return; // Skip stats update if we can't create user
        }
      }

      if (!user) {
        console.warn(`User ${userId} not found for stats update`);
        return;
      }

      const currentTotal = user.total_interviews || 0;
      const currentAvg = user.average_score || 0;
      const currentBest = user.best_score || 0;
      const currentTime = user.total_practice_time || 0;

      // Calculate new statistics
      const newTotal = currentTotal + 1;
      const newAvg = currentTotal === 0 
        ? score 
        : Math.round(((currentAvg * currentTotal) + score) / newTotal * 10) / 10;
      const newBest = Math.max(currentBest, score);
      const newTime = currentTime + (duration || 0);

      // Update user record
      await runAsync(
        `UPDATE users 
         SET total_interviews = ?,
             average_score = ?,
             best_score = ?,
             total_practice_time = ?
         WHERE id = ?`,
        [newTotal, newAvg, newBest, newTime, userId]
      );

      console.log(
        `[STATS] User ${userId} - Total: ${newTotal}, Avg: ${newAvg}, Best: ${newBest}, Time: ${newTime}s`
      );
    } catch (err) {
      console.error('Error in _updateUserStats:', err);
      // Don't throw - stats update failure shouldn't break session completion
    }
  }

  /**
   * Get session by ID
   */
  static async getSession(sessionId) {
    try {
      const session = await getAsync(
        'SELECT * FROM interview_sessions WHERE id = ?',
        [sessionId]
      );

      if (session && session.questions) {
        session.questions = JSON.parse(session.questions);
        session.answers = JSON.parse(session.answers);
        if (session.sub_scores) session.sub_scores = JSON.parse(session.sub_scores);
        if (session.strengths) session.strengths = JSON.parse(session.strengths);
        if (session.improvements) session.improvements = JSON.parse(session.improvements);
        if (session.patterns) session.patterns = JSON.parse(session.patterns);
      }

      return session;
    } catch (err) {
      console.error('Error in getSession:', err);
      throw err;
    }
  }

  /**
   * Get user's interview history
   */
  static async getUserSessions(userId, limit = 50) {
    try {
      const sessions = await allAsync(
        `SELECT * FROM interview_sessions 
         WHERE user_id = ? AND status = 'completed'
         ORDER BY completed_at DESC
         LIMIT ?`,
        [userId, limit]
      );

      return sessions.map(session => ({
        ...session,
        sub_scores: session.sub_scores ? JSON.parse(session.sub_scores) : null,
        strengths: session.strengths ? JSON.parse(session.strengths) : null,
        improvements: session.improvements ? JSON.parse(session.improvements) : null,
        patterns: session.patterns ? JSON.parse(session.patterns) : null
      }));
    } catch (err) {
      console.error('Error in getUserSessions:', err);
      throw err;
    }
  }

  /**
   * Get user statistics across all sessions
   */
  static async getUserPerformanceStats(userId) {
    try {
      const sessions = await this.getUserSessions(userId, 100);

      if (sessions.length === 0) {
        return {
          totalSessions: 0,
          averageScore: 0,
          highestScore: 0,
          improvementTrend: 0,
          bySessionType: {},
          byRole: {}
        };
      }

      const scores = sessions.map(s => s.score).filter(s => s !== null);
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const highScore = Math.max(...scores);

      // Calculate improvement trend
      let improvementTrend = 0;
      if (scores.length >= 2) {
        const firstQuarter = scores.slice(0, Math.ceil(scores.length / 4));
        const lastQuarter = scores.slice(-Math.ceil(scores.length / 4));
        const firstAvg = firstQuarter.reduce((a, b) => a + b, 0) / firstQuarter.length;
        const lastAvg = lastQuarter.reduce((a, b) => a + b, 0) / lastQuarter.length;
        improvementTrend = lastAvg - firstAvg;
      }

      // By session type
      const bySessionType = {};
      sessions.forEach(s => {
        if (!bySessionType[s.session_type]) {
          bySessionType[s.session_type] = { count: 0, avgScore: 0, scores: [] };
        }
        bySessionType[s.session_type].count++;
        if (s.score) bySessionType[s.session_type].scores.push(s.score);
      });

      Object.keys(bySessionType).forEach(type => {
        const scores = bySessionType[type].scores;
        bySessionType[type].avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      });

      // By role
      const byRole = {};
      sessions.forEach(s => {
        if (s.role) {
          if (!byRole[s.role]) {
            byRole[s.role] = { count: 0, avgScore: 0, scores: [] };
          }
          byRole[s.role].count++;
          if (s.score) byRole[s.role].scores.push(s.score);
        }
      });

      Object.keys(byRole).forEach(role => {
        const scores = byRole[role].scores;
        byRole[role].avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      });

      return {
        totalSessions: sessions.length,
        averageScore: Math.round(avgScore * 10) / 10,
        highestScore: highScore,
        improvementTrend: Math.round(improvementTrend * 10) / 10,
        bySessionType,
        byRole,
        recentSessions: sessions.slice(0, 5)
      };
    } catch (err) {
      console.error('Error in getUserPerformanceStats:', err);
      throw err;
    }
  }

  /**
   * Record a session from chatbot or resume analysis (without full interview session)
   * Creates interview_sessions record and updates user stats
   */
  static async recordFeedbackSession(userId, sessionData) {
    try {
      const {
        sessionType = 'chatbot', // 'chatbot' or 'resume_analysis'
        role = null,
        score = 0,
        duration = 0,
        feedback = {},
        strengths = [],
        improvements = [],
        title = null
      } = sessionData;

      const sessionId = uuid();
      const now = new Date().toISOString();

      // Create interview_sessions record for this feedback session
      await runAsync(
        `INSERT INTO interview_sessions 
         (id, user_id, session_type, role, status, score, 
          sub_scores, strengths, improvements, 
          duration_seconds, summary, feedback_score, performance_index, completed_at) 
         VALUES (?, ?, ?, ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          sessionId,
          userId,
          sessionType,
          role,
          score,
          JSON.stringify({}), // sub_scores
          JSON.stringify(strengths),
          JSON.stringify(improvements),
          duration || 0,
          title || `${sessionType} session`,
          score,
          Math.round((score / 100) * 100), // performance_index as percentage
          now
        ]
      );

      // Update user statistics
      await this._updateUserStats(userId, score, duration || 0);

      console.log(`[SESSION] Recorded ${sessionType} session: ${sessionId} for user ${userId} with score ${score}`);

      return {
        sessionId,
        status: 'completed',
        score,
        completedAt: now
      };
    } catch (err) {
      console.error('Error in recordFeedbackSession:', err);
      throw err;
    }
  }

  /**
   * Get comparative data between sessions
   */
  static async getComparativeAnalysis(userId, session1Id, session2Id) {
    try {
      const session1 = await this.getSession(session1Id);
      const session2 = await this.getSession(session2Id);

      if (!session1 || !session2) throw new Error('Sessions not found');

      return {
        session1: {
          id: session1Id,
          score: session1.score,
          type: session1.session_type,
          role: session1.role,
          sub_scores: session1.sub_scores,
          date: session1.completed_at
        },
        session2: {
          id: session2Id,
          score: session2.score,
          type: session2.session_type,
          role: session2.role,
          sub_scores: session2.sub_scores,
          date: session2.completed_at
        },
        comparison: {
          scoreImprovement: session2.score - session1.score,
          performanceChange: session2.score > session1.score ? 'improved' : session2.score < session1.score ? 'declined' : 'stable'
        }
      };
    } catch (err) {
      console.error('Error in getComparativeAnalysis:', err);
      throw err;
    }
  }
}

module.exports = SessionService;
