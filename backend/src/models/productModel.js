const db = require('../config/db');

class ProductModel {
  static async create(payload) {
    const [result] = await db.query(
      `INSERT INTO products
      (category_id, name, slug, brand, sku, short_description, description, price, sale_price, stock_quantity, image_url, is_featured, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.category_id,
        payload.name,
        payload.slug,
        payload.brand,
        payload.sku,
        payload.short_description || null,
        payload.description || null,
        payload.price,
        payload.sale_price || null,
        payload.stock_quantity,
        payload.image_url || null,
        payload.is_featured ? 1 : 0,
        payload.status || 'active'
      ]
    );

    return this.findById(result.insertId);
  }

  static buildFilters(filters) {
    const conditions = ['1=1'];
    const params = [];

    if (filters.search) {
      conditions.push('(p.name LIKE ? OR p.brand LIKE ? OR p.short_description LIKE ?)');
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    if (filters.category_id) {
      conditions.push('p.category_id = ?');
      params.push(filters.category_id);
    }

    if (filters.brand) {
      conditions.push('p.brand = ?');
      params.push(filters.brand);
    }

    if (filters.min_price) {
      conditions.push('COALESCE(p.sale_price, p.price) >= ?');
      params.push(filters.min_price);
    }

    if (filters.max_price) {
      conditions.push('COALESCE(p.sale_price, p.price) <= ?');
      params.push(filters.max_price);
    }

    if (filters.status) {
      conditions.push('p.status = ?');
      params.push(filters.status);
    }

    return { whereClause: conditions.join(' AND '), params };
  }

  static async findAll(filters, pagination) {
    const { whereClause, params } = this.buildFilters(filters);
    const orderBy = filters.sort === 'price_asc'
      ? 'effective_price ASC'
      : filters.sort === 'price_desc'
        ? 'effective_price DESC'
        : 'p.created_at DESC';
    const limit = Number(pagination.limit);
    const offset = Number(pagination.offset);

    const [rows] = await db.pool.query(
      `SELECT p.*, c.name AS category_name,
          COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
          COUNT(DISTINCT r.id) AS review_count,
          COALESCE(p.sale_price, p.price) AS effective_price
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE ${whereClause}
       GROUP BY p.id, c.name
       ORDER BY ${orderBy}
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const [countRows] = await db.query(`SELECT COUNT(*) AS total FROM products p WHERE ${whereClause}`, params);
    return { rows, total: countRows[0].total };
  }

  static async findById(id) {
    const [rows] = await db.query(
      `SELECT p.*, c.name AS category_name,
          COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
          COUNT(DISTINCT r.id) AS review_count
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN reviews r ON r.product_id = p.id
       WHERE p.id = ?
       GROUP BY p.id, c.name
       LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, payload) {
    await db.query(
      `UPDATE products
       SET category_id = ?, name = ?, slug = ?, brand = ?, sku = ?, short_description = ?, description = ?,
           price = ?, sale_price = ?, stock_quantity = ?, image_url = ?, is_featured = ?, status = ?
       WHERE id = ?`,
      [
        payload.category_id,
        payload.name,
        payload.slug,
        payload.brand,
        payload.sku,
        payload.short_description || null,
        payload.description || null,
        payload.price,
        payload.sale_price || null,
        payload.stock_quantity,
        payload.image_url || null,
        payload.is_featured ? 1 : 0,
        payload.status || 'active',
        id
      ]
    );

    return this.findById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM products WHERE id = ?', [id]);
  }
}

module.exports = ProductModel;
