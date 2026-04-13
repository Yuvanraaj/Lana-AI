/**
 * User Service - Handles user operations and identification
 */

const { v4: uuid } = require('uuid');
const { runAsync, getAsync, allAsync } = require('./database');

class UserService {
  /**
   * Create NEW user with strict duplicate checking
   * Throws error if email already exists
   */
  static async createNewUser(email, name) {
    try {
      // Verify email doesn't exist
      const existingUser = await getAsync(
        'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
        [email]
      );

      if (existingUser) {
        const error = new Error('Email already registered');
        error.code = 'EMAIL_EXISTS';
        throw error;
      }

      const userId = uuid();
      const timestamp = new Date().toISOString();
      const normalizedEmail = email.toLowerCase();

      await runAsync(
        `INSERT INTO users (id, email, name, created_at, last_login) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, normalizedEmail, name || normalizedEmail.split('@')[0], timestamp, timestamp]
      );

      console.log(`[USER] Created new user: ${normalizedEmail} (${userId})`);

      return {
        id: userId,
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        created_at: timestamp,
        last_login: timestamp
      };
    } catch (err) {
      console.error('Error in createNewUser:', err);
      throw err;
    }
  }

  /**
   * Update last login timestamp for user
   */
  static async updateLastLogin(userId) {
    try {
      await runAsync(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [userId]
      );
    } catch (err) {
      console.error('Error updating last login:', err);
    }
  }

  /**
   * Get or create user by email (backward compatibility)
   * If user doesn't exist, create them
   */
  static async getOrCreateUser(email, name = null) {
    try {
      // Check if user exists (case-insensitive)
      let user = await getAsync(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
        [email]
      );

      if (user) {
        // Update last login
        await runAsync(
          'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
          [user.id]
        );
        return user;
      }

      // Create new user
      const userId = uuid();
      const timestamp = new Date().toISOString();
      const normalizedEmail = email.toLowerCase();
      const username = name || normalizedEmail.split('@')[0];

      await runAsync(
        `INSERT INTO users (id, username, email, name, created_at, last_login) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, username, normalizedEmail, name || normalizedEmail.split('@')[0], timestamp, timestamp]
      );

      console.log(`[USER] Created new user: ${normalizedEmail} (${userId})`);

      return {
        id: userId,
        username: username,
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        created_at: timestamp,
        last_login: timestamp
      };
    } catch (err) {
      console.error('Error in getOrCreateUser:', err);
      throw err;
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId) {
    try {
      return await getAsync(
        'SELECT * FROM users WHERE id = ?',
        [userId]
      );
    } catch (err) {
      console.error('Error in getUserById:', err);
      throw err;
    }
  }

  /**
   * Get user by email (case-insensitive)
   */
  static async getUserByEmail(email) {
    try {
      return await getAsync(
        'SELECT * FROM users WHERE LOWER(email) = LOWER(?)',
        [email]
      );
    } catch (err) {
      console.error('Error in getUserByEmail:', err);
      throw err;
    }
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updates) {
    try {
      const allowedFields = ['name', 'avatar_url', 'target_role', 'preferences'];
      const setClause = [];
      const values = [];

      for (const field of allowedFields) {
        if (field in updates) {
          setClause.push(`${field} = ?`);
          values.push(updates[field]);
        }
      }

      if (setClause.length === 0) return;

      values.push(userId);

      await runAsync(
        `UPDATE users SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );

      console.log(`[USER] Updated profile for user ${userId}`);
    } catch (err) {
      console.error('Error in updateUserProfile:', err);
      throw err;
    }
  }

  /**
   * Get all users (admin purposes)
   */
  static async getAllUsers() {
    try {
      return await allAsync('SELECT id, email, name, created_at, last_login FROM users');
    } catch (err) {
      console.error('Error in getAllUsers:', err);
      throw err;
    }
  }

  /**
   * Get user statistics (from user profile, updated by SessionService)
   */
  static async getUserStats(userId) {
    try {
      const user = await getAsync(
        `SELECT total_interviews, average_score, best_score, total_practice_time 
         FROM users WHERE id = ?`,
        [userId]
      );

      if (!user) {
        return {
          total_interviews: 0,
          average_score: 0,
          best_score: 0,
          total_practice_time: 0
        };
      }

      return {
        total_interviews: user.total_interviews || 0,
        average_score: user.average_score || 0,
        best_score: user.best_score || 0,
        total_practice_time: user.total_practice_time || 0
      };
    } catch (err) {
      console.error('Error in getUserStats:', err);
      throw err;
    }
  }
}

module.exports = UserService;
