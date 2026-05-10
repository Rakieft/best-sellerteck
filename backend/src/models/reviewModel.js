const db = require('../config/db');

class ReviewModel {
  static async create(payload) {
    const [result] = await db.query(
      'INSERT INTO reviews (user_id, product_id, rating, title, comment) VALUES (?, ?, ?, ?, ?)',
      [payload.user_id, payload.product_id, payload.rating, payload.title || null, payload.comment || null]
    );

    return this.findById(result.insertId);
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async findByProduct(productId) {
    const [rows] = await db.query(
      `SELECT r.*, u.first_name, u.last_name
       FROM reviews r
       INNER JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [productId]
    );
    return rows;
  }
}

module.exports = ReviewModel;
