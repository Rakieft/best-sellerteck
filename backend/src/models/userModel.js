const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const env = require('../config/env');

class UserModel {
  static async create(payload) {
    const hashedPassword = await bcrypt.hash(payload.password, env.bcryptSaltRounds);
    const [result] = await db.query(
      `INSERT INTO users (first_name, last_name, email, phone, password_hash, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [payload.first_name, payload.last_name, payload.email, payload.phone || null, hashedPassword, payload.role || 'client']
    );

    return this.findById(result.insertId);
  }

  static async findByEmail(email) {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    return rows[0] || null;
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT id, first_name, last_name, email, phone, role, status, avatar_url, created_at, updated_at
       FROM users WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async list({ limit, offset }) {
    const [rows] = await db.query(
      `SELECT id, first_name, last_name, email, phone, role, status, created_at
       FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [countRows] = await db.query('SELECT COUNT(*) AS total FROM users');
    return { rows, total: countRows[0].total };
  }

  static async comparePassword(plainPassword, passwordHash) {
    return bcrypt.compare(plainPassword, passwordHash);
  }

  static async storePasswordResetToken(userId, rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires_at = ? WHERE id = ?',
      [tokenHash, expiresAt, userId]
    );
  }

  static async findByResetToken(rawToken) {
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const [rows] = await db.query(
      `SELECT * FROM users
       WHERE reset_token = ? AND reset_token_expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
    return rows[0] || null;
  }

  static async resetPassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, env.bcryptSaltRounds);
    await db.query(
      `UPDATE users
       SET password_hash = ?, reset_token = NULL, reset_token_expires_at = NULL
       WHERE id = ?`,
      [hashedPassword, userId]
    );
    return this.findById(userId);
  }

  static async updateStatus(userId, status) {
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    return this.findById(userId);
  }
}

module.exports = UserModel;
