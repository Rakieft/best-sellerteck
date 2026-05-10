const db = require('../config/db');

class CategoryModel {
  static async create(payload) {
    const [result] = await db.query(
      'INSERT INTO categories (name, slug, description, image_url) VALUES (?, ?, ?, ?)',
      [payload.name, payload.slug, payload.description || null, payload.image_url || null]
    );

    return this.findById(result.insertId);
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM categories ORDER BY name ASC');
    return rows;
  }

  static async findById(id) {
    const [rows] = await db.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
    return rows[0] || null;
  }

  static async update(id, payload) {
    await db.query(
      `UPDATE categories
       SET name = ?, slug = ?, description = ?, image_url = ?
       WHERE id = ?`,
      [payload.name, payload.slug, payload.description || null, payload.image_url || null, id]
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM categories WHERE id = ?', [id]);
  }
}

module.exports = CategoryModel;
