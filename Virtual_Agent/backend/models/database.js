/**
 * Database Configuration & Models for Interview Platform
 * Uses SQLite for persistent storage with multi-user support
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Database file location
const DB_PATH = path.join(__dirname, '..', 'data', 'interview_platform.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Open database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('[DB] Connected to SQLite database at', DB_PATH);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database tables
 */
function initializeDatabase() {
  return new Promise((resolve, reject) => {
    // Users table - Updated with username/password support
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        name TEXT,
        avatar_url TEXT,
        target_role TEXT,
        total_interviews INTEGER DEFAULT 0,
        average_score REAL DEFAULT 0,
        best_score INTEGER DEFAULT 0,
        total_practice_time INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        password_changed_at TIMESTAMP,
        preferences TEXT
      )
    `, (err) => {
      if (err) {
        console.error('Error creating users table:', err);
        reject(err);
      }
    });

    // Interview Sessions table - Enhanced with progress tracking
    db.run(`
      CREATE TABLE IF NOT EXISTS interview_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        session_type TEXT NOT NULL,
        role TEXT,
        job_description TEXT,
        is_guest BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'in_progress',
        score INTEGER,
        sub_scores TEXT,
        strengths TEXT,
        improvements TEXT,
        patterns TEXT,
        duration_seconds INTEGER,
        questions TEXT,
        answers TEXT,
        summary TEXT,
        practice_plan TEXT,
        external_feedback TEXT,
        feedback_score INTEGER,
        performance_index REAL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error('Error creating sessions table:', err);
        reject(err);
      }
    });

    // Resume Analysis Results table
    db.run(`
      CREATE TABLE IF NOT EXISTS resume_analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        file_name TEXT,
        ats_score INTEGER,
        skills_found TEXT,
        strengths TEXT,
        gaps TEXT,
        missing_keywords TEXT,
        recommendations TEXT,
        analyzed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating resume_analyses table:', err);
        reject(err);
      }
    });

    // Chatbot Feedback table
    db.run(`
      CREATE TABLE IF NOT EXISTS chatbot_feedback (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        conversation_id TEXT,
        topic TEXT,
        score INTEGER,
        feedback_text TEXT,
        conversation_log TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating chatbot_feedback table:', err);
        reject(err);
      }
    });

    // Performance metrics table (for comparisons)
    db.run(`
      CREATE TABLE IF NOT EXISTS performance_metrics (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        metric_name TEXT,
        metric_value REAL,
        session_type TEXT,
        recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating performance_metrics table:', err);
        reject(err);
      } else {
        console.log('[DB] All tables initialized successfully');
        resolve();
      }
    });
  });
}

/**
 * Run query with promise wrapper
 */
function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

/**
 * Get query with promise wrapper
 */
function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * All query with promise wrapper
 */
function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
/**
 * Get database instance
 */
function getDatabase() {
  return db;
}

/**
 * Cleanup old guest sessions (older than 48 hours)
 */
function cleanupGuestSessions() {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
  db.run(
    `DELETE FROM interview_sessions 
     WHERE is_guest = 1 AND created_at < ?`,
    [twoDaysAgo],
    function(err) {
      if (err) {
        console.error('[DB] Guest session cleanup failed:', err.message);
      } else if (this.changes > 0) {
        console.log(`[DB] ✓ Cleaned up ${this.changes} expired guest sessions`);
      }
    }
  );
}

// Initialize database on startup
initializeDatabase().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Start cleanup interval (runs every hour)
setInterval(cleanupGuestSessions, 60 * 60 * 1000);

module.exports = {
  db,
  initializeDatabase,
  cleanupGuestSessions,
  runAsync,
  getAsync,
  allAsync,
  getDatabase
};
