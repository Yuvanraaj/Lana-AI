/**
 * @fileoverview Analytics & User Management Routes
 * Endpoints for comprehensive performance tracking, comparisons, and user management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const UserService = require('../models/UserService');
const SessionService = require('../models/SessionService');
const FeedbackService = require('../models/FeedbackService');

// ====== HELPER FUNCTIONS ======

/**
 * Validate username format (alphanumeric, 3-20 chars)
 */
function isValidUsername(username) {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

/**
 * Validate password strength
 */
function isValidPassword(password) {
  // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate name
 */
function isValidName(name) {
  return name && name.trim().length >= 2 && name.length <= 100;
}

/**
 * Format user response (without sensitive data)
 */
function formatUserResponse(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    target_role: user.target_role,
    total_interviews: user.total_interviews || 0,
    average_score: user.average_score || 0,
    best_score: user.best_score || 0,
    created_at: user.created_at,
    last_login: user.last_login
  };
}

// ====== AUTH ENDPOINTS ======

/**
 * POST /api/analytics/user/check-username
 * Check if username is available
 * Body: { username }
 */
router.post('/user/check-username', async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ ok: false, error: 'Username is required' });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ ok: false, error: 'Username must be 3-20 alphanumeric characters' });
    }

    const db = require('../models/database').getDatabase();
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    res.json({
      ok: true,
      available: !user,
      exists: !!user
    });
  } catch (err) {
    console.error('Error checking username:', err);
    res.status(500).json({ ok: false, error: 'Failed to check username', detail: err.message });
  }
});

/**
 * POST /api/analytics/user/register
 * Register new user with username and password
 * Body: { username, password, passwordConfirm, name?, email? }
 */
router.post('/user/register', async (req, res) => {
  try {
    const { username, password, passwordConfirm, name, email } = req.body;
    
    console.log('[AUTH] Registration attempt for username:', username, 'email:', email);

    // Validation
    if (!username) {
      return res.status(400).json({
        ok: false,
        error: 'Username is required',
        code: 'MISSING_USERNAME'
      });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        ok: false,
        error: 'Username must be 3-20 letters, numbers, or underscores',
        code: 'INVALID_USERNAME'
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        error: 'Password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({
        ok: false,
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number',
        code: 'WEAK_PASSWORD'
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        ok: false,
        error: 'Passwords do not match',
        code: 'PASSWORD_MISMATCH'
      });
    }

    if (name && !isValidName(name)) {
      return res.status(400).json({
        ok: false,
        error: 'Name must be 2-100 characters',
        code: 'INVALID_NAME'
      });
    }

    if (email && !isValidEmail(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid email format',
        code: 'INVALID_EMAIL'
      });
    }

    // Check if username already exists
    const db = require('../models/database').getDatabase();
    const existingUser = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE LOWER(username) = LOWER(?)', [username], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (existingUser) {
      console.log(`[AUTH] ✗ Registration failed: Username already taken - ${username}`);
      return res.status(409).json({
        ok: false,
        error: 'Username already taken. Please choose another.',
        code: 'USERNAME_EXISTS'
      });
    }

    // Check if email already exists (if email is provided)
    if (email) {
      const existingEmail = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (existingEmail) {
        console.log(`[AUTH] ✗ Registration failed: Email already registered - ${email}`);
        return res.status(409).json({
          ok: false,
          error: 'Email already registered. Please use a different email or login.',
          code: 'EMAIL_EXISTS'
        });
      }
    }

    // Hash password with 10 salt rounds
    console.log('[AUTH] Hashing password for user:', username);
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user with password
    const userId = require('uuid').v4();
    const now = new Date().toISOString();

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, username, email, password_hash, name, total_interviews, average_score, best_score, total_practice_time, created_at, password_changed_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, email || null, passwordHash, name || username, 0, 0, 0, 0, now, now],
        function(err) {
          if (err) {
            console.error('[AUTH] Database error during register:', err);
            reject(err);
          }
          resolve();
        }
      );
    });

    const newUser = {
      id: userId,
      username,
      email: email || null,
      name: name || username,
      total_interviews: 0,
      average_score: 0,
      best_score: 0,
      total_practice_time: 0,
      created_at: now
    };

    console.log(`[AUTH] ✓ New user registered: ${username} (ID: ${userId}, Email: ${email || 'none'})`);

    res.status(201).json({
      ok: true,
      message: 'Registration successful',
      user: formatUserResponse(newUser)
    });
  } catch (err) {
    console.error('[AUTH] Registration error:', err);
    
    // Handle specific database errors
    if (err.message && err.message.includes('UNIQUE constraint failed')) {
      if (err.message.includes('username')) {
        return res.status(409).json({
          ok: false,
          error: 'Username already taken',
          code: 'USERNAME_EXISTS',
          detail: err.message
        });
      } else if (err.message.includes('email')) {
        return res.status(409).json({
          ok: false,
          error: 'Email already registered',
          code: 'EMAIL_EXISTS',
          detail: err.message
        });
      }
    }
    
    res.status(500).json({
      ok: false,
      error: 'Failed to register user',
      code: 'REGISTRATION_ERROR',
      detail: err.message
    });
  }
});

/**
 * POST /api/analytics/user/login
 * Login with username and password
 * Body: { username, password }
 */
router.post('/user/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username) {
      return res.status(400).json({
        ok: false,
        error: 'Username is required',
        code: 'MISSING_USERNAME'
      });
    }

    if (!password) {
      return res.status(400).json({
        ok: false,
        error: 'Password is required',
        code: 'MISSING_PASSWORD'
      });
    }

    // Find user by username (case-insensitive)
    const db = require('../models/database').getDatabase();
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE LOWER(username) = LOWER(?)',
        [username],
        (err, row) => {
          if (err) reject(err);
          resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      console.log(`[AUTH] ✗ Failed login attempt for user: ${username}`);
      return res.status(401).json({
        ok: false,
        error: 'Invalid username or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login timestamp
    const now = new Date().toISOString();
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET last_login = ? WHERE id = ?',
        [now, user.id],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    console.log(`[AUTH] ✓ Successful login: ${username} (ID: ${user.id})`);

    res.json({
      ok: true,
      message: 'Login successful',
      user: formatUserResponse({ ...user, last_login: now })
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    res.status(500).json({
      ok: false,
      error: 'Failed to login',
      code: 'LOGIN_ERROR',
      detail: err.message
    });
  }
});

/**
 * GET /api/analytics/user/:userId
 * Get user profile with statistics
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Fetch statistics separately to avoid total failure if stats unavailable
    let stats = {};
    try {
      stats = await UserService.getUserStats(userId);
    } catch (statsErr) {
      console.warn('Warning: Could not fetch user stats:', statsErr.message);
      // Continue anyway - stats are optional
      stats = {
        total_interviews: 0,
        average_score: 0,
        best_score: 0,
        total_practice_time: 0
      };
    }

    res.json({
      ok: true,
      user: {
        ...user,
        stats
      }
    });
  } catch (err) {
    console.error('Error in get user:', err);
    res.status(500).json({ error: 'Failed to fetch user', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/performance
 * Get comprehensive performance statistics
 */
router.get('/user/:userId/performance', async (req, res) => {
  try {
    const { userId } = req.params;

    const performanceStats = await SessionService.getUserPerformanceStats(userId);

    res.json({
      ok: true,
      performance: performanceStats
    });
  } catch (err) {
    console.error('Error in performance stats:', err);
    res.status(500).json({ error: 'Failed to fetch performance', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/history
 * Get interview history with full details (includes interviews, resumes, and chatbot)
 */
/**
 * GET /api/analytics/user/:userId/history
 * Get interview history with full details (includes interviews, resumes, and chatbot)
 */
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const results = [];

    // Fetch interview sessions
    const sessions = await SessionService.getUserSessions(userId, limit).catch(() => []);
    if (sessions && Array.isArray(sessions)) {
      sessions.forEach(s => {
        results.push({
          id: s.id,
          type: 'interview',
          session_type: s.session_type || 'interview',
          role: s.role,
          score: s.score || 0,
          status: s.status,
          created_at: s.created_at,
          completed_at: s.completed_at,
          duration_seconds: s.duration_seconds,
          sub_scores: s.sub_scores
        });
      });
    }

    // Query database for resume and chatbot
    const sqlite3 = require('sqlite3').verbose();
    const path = require('path');
    const dbPath = path.join(__dirname, '..', 'data', 'interview_platform.db');
    
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) console.error('DB open error:', err);
    });

    // Get resumes and chatbot data
    db.serialize(() => {
      // Fetch resumes
      db.all(
        `SELECT * FROM resume_analyses WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT ?`,
        [userId, limit],
        (err, rows) => {
          if (!err && rows) {
            rows.forEach(r => {
              try {
                results.push({
                  id: r.id,
                  type: 'resume',
                  score: r.ats_score || 0,
                  file_name: r.file_name || 'resume',
                  created_at: r.analyzed_at,
                  skills_found: r.skills_found ? JSON.parse(r.skills_found) : [],
                  strengths: r.strengths ? JSON.parse(r.strengths) : [],
                  gaps: r.gaps ? JSON.parse(r.gaps) : []
                });
              } catch (e) {
                console.error('Error parsing resume row:', e);
              }
            });
          }

          // Fetch chatbot sessions
          db.all(
            `SELECT * FROM chatbot_feedback WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
            [userId, limit],
            (err2, rows2) => {
              if (!err2 && rows2) {
                rows2.forEach(r => {
                  try {
                    results.push({
                      id: r.id,
                      type: 'chatbot',
                      score: r.score || 0,
                      created_at: r.created_at,
                      conversation_id: r.conversation_id,
                      feedback_text: r.feedback_text ? JSON.parse(r.feedback_text) : []
                    });
                  } catch (e) {
                    console.error('Error parsing chatbot row:', e);
                  }
                });
              }

              db.close();

              // Sort by date descending
              results.sort((a, b) => {
                const dateA = new Date(a.created_at || 0).getTime();
                const dateB = new Date(b.created_at || 0).getTime();
                return dateB - dateA;
              });

              res.json({
                ok: true,
                count: results.length,
                sessions: results
              });
            }
          );
        }
      );
    });
  } catch (err) {
    console.error('Error in history route:', err);
    res.status(500).json({ error: 'Failed to fetch history', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/feedback/comprehensive
 * Get comprehensive feedback from all modes
 */
router.get('/user/:userId/feedback/comprehensive', async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days) || 30;

    const feedback = await FeedbackService.getComprehensiveFeedback(userId, days);

    res.json({
      ok: true,
      feedback
    });
  } catch (err) {
    console.error('Error in comprehensive feedback:', err);
    res.status(500).json({ error: 'Failed to fetch feedback', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/feedback/resume
 * Get resume analysis history
 */
router.get('/user/:userId/feedback/resume', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const analyses = await FeedbackService.getUserResumeAnalyses(userId, limit);

    res.json({
      ok: true,
      analyses
    });
  } catch (err) {
    console.error('Error in resume feedback:', err);
    res.status(500).json({ error: 'Failed to fetch resume feedback', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/feedback/chatbot
 * Get chatbot feedback history
 */
router.get('/user/:userId/feedback/chatbot', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const feedbacks = await FeedbackService.getUserChatbotFeedback(userId, limit);

    res.json({
      ok: true,
      feedbacks
    });
  } catch (err) {
    console.error('Error in chatbot feedback:', err);
    res.status(500).json({ error: 'Failed to fetch chatbot feedback', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/feedback/interview
 * Get interview session history with feedback
 */
router.get('/user/:userId/feedback/interview', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const sessions = await FeedbackService.getUserInterviewSessions(userId, limit);

    res.json({
      ok: true,
      sessions
    });
  } catch (err) {
    console.error('Error in interview feedback:', err);
    res.status(500).json({ error: 'Failed to fetch interview feedback', detail: err.message });
  }
});

/**
 * GET /api/analytics/comparison/:userId/:sessionId1/:sessionId2
 * Compare two sessions
 */
router.get('/comparison/:userId/:sessionId1/:sessionId2', async (req, res) => {
  try {
    const { userId, sessionId1, sessionId2 } = req.params;

    const comparison = await SessionService.getComparativeAnalysis(userId, sessionId1, sessionId2);

    res.json({
      ok: true,
      comparison
    });
  } catch (err) {
    console.error('Error in comparison:', err);
    res.status(500).json({ error: 'Failed to compare sessions', detail: err.message });
  }
});

/**
 * POST /api/analytics/feedback/resume
 * Store resume analysis feedback
 * Body: { userId, fileName, analysis }
 */
router.post('/feedback/resume', async (req, res) => {
  try {
    const { userId, fileName, analysis } = req.body;

    if (!userId || !analysis) {
      return res.status(400).json({ error: 'userId and analysis are required' });
    }

    const feedbackId = await FeedbackService.storeResumeFeedback(userId, fileName, analysis);

    res.json({
      ok: true,
      feedbackId
    });
  } catch (err) {
    console.error('Error storing resume feedback:', err);
    res.status(500).json({ error: 'Failed to store feedback', detail: err.message });
  }
});

/**
 * POST /api/analytics/feedback/chatbot
 * Store chatbot conversation feedback
 * Body: { userId, conversationId, topic, feedback }
 */
router.post('/feedback/chatbot', async (req, res) => {
  try {
    const { userId, conversationId, topic, feedback } = req.body;

    if (!userId || !feedback) {
      return res.status(400).json({ error: 'userId and feedback are required' });
    }

    const feedbackId = await FeedbackService.storeChatbotFeedback(userId, conversationId, topic, feedback);

    res.json({
      ok: true,
      feedbackId
    });
  } catch (err) {
    console.error('Error storing chatbot feedback:', err);
    res.status(500).json({ error: 'Failed to store feedback', detail: err.message });
  }
});

/**
 * PUT /api/analytics/user/:userId/profile
 * Update user profile
 * Body: { name?, avatar_url?, target_role?, preferences? }
 */
router.put('/user/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    await UserService.updateUserProfile(userId, updates);
    const user = await UserService.getUserById(userId);

    res.json({
      ok: true,
      user
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile', detail: err.message });
  }
});

// ============================================================================
// PROGRESS TRACKING ENDPOINTS (COMPREHENSIVE ANALYTICS)
// ============================================================================

/**
 * GET /api/analytics/user/:userId/progress
 * Get user's current progress snapshot
 * Returns: Overall statistics and current metrics
 */
router.get('/user/:userId/progress', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = require('../models/database').getDatabase();

    // Get user profile
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent sessions (last 10)
    const recentSessions = await new Promise((resolve, reject) => {
      db.all(
        `SELECT id, score, duration_seconds, role, status, created_at 
         FROM interview_sessions 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 10`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // Calculate improvement metrics
    const improvementData = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           DATE(created_at) as date,
           AVG(score) as daily_avg,
           MAX(score) as daily_max,
           COUNT(*) as daily_count
         FROM interview_sessions
         WHERE user_id = ? AND created_at >= datetime('now', '-30 days')
         GROUP BY DATE(created_at)
         ORDER BY date DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // Calculate 7-day and 30-day averages
    const last7Days = improvementData.slice(0, 7);
    const last30Days = improvementData;

    const avg7Day = last7Days.length > 0 
      ? (last7Days.reduce((sum, d) => sum + d.daily_avg, 0) / last7Days.length).toFixed(2)
      : 0;

    const avg30Day = last30Days.length > 0 
      ? (last30Days.reduce((sum, d) => sum + d.daily_avg, 0) / last30Days.length).toFixed(2)
      : 0;

    const improvementRate = avg30Day > 0 
      ? ((avg7Day - avg30Day) / avg30Day * 100).toFixed(2)
      : 0;

    res.json({
      ok: true,
      progress: {
        userId,
        username: user.username,
        totalSessions: user.total_interviews || 0,
        currentAverage: user.average_score || 0,
        bestScore: user.best_score || 0,
        last7DayAverage: parseFloat(avg7Day),
        last30DayAverage: parseFloat(avg30Day),
        improvementRate: parseFloat(improvementRate),
        recentSessions: recentSessions.map(s => ({
          id: s.id,
          score: s.score,
          role: s.role,
          duration: s.duration_seconds,
          date: s.created_at,
          status: s.status
        })),
        targetRole: user.target_role || 'Not set'
      }
    });
  } catch (err) {
    console.error('Error in progress endpoint:', err);
    res.status(500).json({ error: 'Failed to fetch progress', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/progress/timeline
 * Get historical progress data for visualization (trending)
 * Returns: Day-by-day breakdown for last 30 days
 */
router.get('/user/:userId/progress/timeline', async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    const db = require('../models/database').getDatabase();

    const timelineData = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           DATE(created_at) as date,
           COUNT(*) as session_count,
           AVG(score) as avg_score,
           MAX(score) as max_score,
           MIN(score) as min_score,
           SUM(duration_seconds) as total_duration
         FROM interview_sessions
         WHERE user_id = ? AND created_at >= datetime('now', '-' || ? || ' days')
         GROUP BY DATE(created_at)
         ORDER BY date ASC`,
        [userId, days],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    res.json({
      ok: true,
      timeline: timelineData.map(d => ({
        date: d.date,
        sessions: d.session_count,
        avgScore: parseFloat(d.avg_score || 0),
        maxScore: d.max_score,
        minScore: d.min_score,
        totalMinutes: Math.round(d.total_duration / 60)
      })),
      daysRetrieved: days
    });
  } catch (err) {
    console.error('Error in timeline endpoint:', err);
    res.status(500).json({ error: 'Failed to fetch timeline', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/progress/comparison
 * Get comparative analytics (user vs peers/benchmarks)
 * Returns: Percentile, ranking, peer comparison
 */
router.get('/user/:userId/progress/comparison', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = require('../models/database').getDatabase();

    // Get user
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get all users in same role
    const roleStats = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           COUNT(*) as total_users,
           AVG(average_score) as avg_score,
           AVG(best_score) as avg_best_score,
           AVG(total_interviews) as avg_interviews
         FROM users 
         WHERE target_role = ? OR (target_role IS NULL)`,
        [user.target_role || 'General'],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows?.[0] || {});
        }
      );
    });

    // Calculate user's percentile
    const percentile = await new Promise((resolve, reject) => {
      db.get(
        `SELECT COUNT(*) as better_count FROM users 
         WHERE average_score > ? AND (target_role = ? OR target_role IS NULL OR ? IS NULL)`,
        [user.average_score, user.target_role, user.target_role],
        (err, row) => {
          if (err) reject(err);
          const percentile = roleStats.total_users > 0 
            ? ((row?.better_count || 0) / roleStats.total_users * 100).toFixed(2)
            : 0;
          resolve(percentile);
        }
      );
    });

    res.json({
      ok: true,
      comparison: {
        userId,
        userScore: user.average_score || 0,
        userBestScore: user.best_score || 0,
        userSessions: user.total_interviews || 0,
        peersAverage: parseFloat(roleStats.avg_score || 0),
        peersBestAverage: parseFloat(roleStats.avg_best_score || 0),
        peersAvgSessions: parseFloat(roleStats.avg_interviews || 0),
        percentile: parseFloat(percentile),
        totalUsersInRole: roleStats.total_users || 0,
        scoreVsAverage: (user.average_score - (roleStats.avg_score || 0)).toFixed(2),
        recommendation: calculateRecommendation(user.average_score, roleStats.avg_score)
      }
    });
  } catch (err) {
    console.error('Error in comparison endpoint:', err);
    res.status(500).json({ error: 'Failed to fetch comparison data', detail: err.message });
  }
});

/**
 * GET /api/analytics/user/:userId/progress/deep
 * Get comprehensive deep-dive analytics
 * Returns: Detailed metrics by role, topic, and time period
 */
router.get('/user/:userId/progress/deep', async (req, res) => {
  try {
    const { userId } = req.params;
    const db = require('../models/database').getDatabase();

    // Get role-wise breakdown
    const roleBreakdown = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           role,
           COUNT(*) as session_count,
           AVG(score) as avg_score,
           MAX(score) as best_score,
           SUM(duration_seconds) as total_time
         FROM interview_sessions
         WHERE user_id = ?
         GROUP BY role
         ORDER BY session_count DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // Get weekly trend
    const weeklyTrend = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
           strftime('%Y-W%W', created_at) as week,
           COUNT(*) as sessions,
           AVG(score) as avg_score,
           MAX(score) as peak_score
         FROM interview_sessions
         WHERE user_id = ?
         GROUP BY week
         ORDER BY week DESC
         LIMIT 12`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          resolve(rows || []);
        }
      );
    });

    // Strengths and weaknesses (by average score per role)
    const strengths = roleBreakdown
      .filter(r => r.avg_score >= 75)
      .map(r => ({ role: r.role, score: parseFloat(r.avg_score) }));

    const weaknesses = roleBreakdown
      .filter(r => r.avg_score < 70)
      .map(r => ({ role: r.role, score: parseFloat(r.avg_score) }));

    res.json({
      ok: true,
      deepAnalytics: {
        userId,
        roleBreakdown: roleBreakdown.map(r => ({
          role: r.role,
          sessions: r.session_count,
          averageScore: parseFloat(r.avg_score || 0),
          bestScore: r.best_score,
          totalMinutes: Math.round(r.total_time / 60)
        })),
        weeklyTrend: weeklyTrend.map(w => ({
          week: w.week,
          sessions: w.sessions,
          avgScore: parseFloat(w.avg_score || 0),
          peakScore: w.peak_score
        })),
        strengths: strengths,
        weaknesses: weaknesses,
        totalSessionsTracked: roleBreakdown.reduce((sum, r) => sum + r.session_count, 0),
        recommendation: generateRecommendation(roleBreakdown, weaknesses)
      }
    });
  } catch (err) {
    console.error('Error in deep analytics endpoint:', err);
    res.status(500).json({ error: 'Failed to fetch deep analytics', detail: err.message });
  }
});

/**
 * POST /api/analytics/session/:sessionId/record-metrics
 * Record metrics for a completed interview session
 * Updates user statistics and creates performance records
 */
router.post('/session/:sessionId/record-metrics', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { score, duration, questionsAttempted, performanceIndex } = req.body;
    const db = require('../models/database').getDatabase();

    if (!score || score < 0 || score > 100) {
      return res.status(400).json({ error: 'Invalid score' });
    }

    // Get session
    const session = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM interview_sessions WHERE id = ?', [sessionId], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update session with metrics
    const now = new Date().toISOString();
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE interview_sessions 
         SET score = ?, duration_seconds = ?, performance_index = ?, completed_at = ?, status = 'completed'
         WHERE id = ?`,
        [score, duration, performanceIndex || 0, now, sessionId],
        (err) => {
          if (err) reject(err);
          resolve();
        }
      );
    });

    // Update user statistics
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [session.user_id], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (user) {
      const newTotalInterviews = (user.total_interviews || 0) + 1;
      const newAverageScore = ((user.average_score || 0) * (user.total_interviews || 0) + score) / newTotalInterviews;
      const newBestScore = Math.max(user.best_score || 0, score);

      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users 
           SET total_interviews = ?, average_score = ?, best_score = ?
           WHERE id = ?`,
          [newTotalInterviews, newAverageScore, newBestScore, session.user_id],
          (err) => {
            if (err) reject(err);
            resolve();
          }
        );
      });

      res.json({
        ok: true,
        message: 'Metrics recorded successfully',
        updatedStats: {
          totalInterviews: newTotalInterviews,
          averageScore: parseFloat(newAverageScore.toFixed(2)),
          bestScore: newBestScore,
          sessionScore: score
        }
      });
    }
  } catch (err) {
    console.error('Error recording metrics:', err);
    res.status(500).json({ error: 'Failed to record metrics', detail: err.message });
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateRecommendation(userScore, peerAverage) {
  if (!peerAverage) return 'Keep practicing to build baseline data';
  
  const diff = userScore - peerAverage;
  if (diff > 15) return '🌟 Outstanding - You are among top performers!';
  if (diff > 5) return '👍 Good - Performing above average';
  if (diff > -5) return '➡️ Average - On par with peers';
  return '📈 Below average - Practice more to improve';
}

function generateRecommendation(roleBreakdown, weaknesses) {
  if (weaknesses.length === 0) return 'Excellent progress! Continue maintaining high scores.';
  if (weaknesses.length === 1) return `Focus on improving ${weaknesses[0].role} skills`;
  return `Work on these areas: ${weaknesses.map(w => w.role).join(', ')}`;
}

module.exports = router;
