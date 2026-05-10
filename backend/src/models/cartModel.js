const db = require('../config/db');

class CartModel {
  static async getOrCreateCart(userId) {
    const [existing] = await db.query('SELECT * FROM carts WHERE user_id = ? LIMIT 1', [userId]);
    if (existing[0]) {
      return existing[0];
    }

    const [result] = await db.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
    const [rows] = await db.query('SELECT * FROM carts WHERE id = ? LIMIT 1', [result.insertId]);
    return rows[0];
  }

  static async getCartDetails(userId) {
    const cart = await this.getOrCreateCart(userId);
    const [items] = await db.query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.slug, p.image_url,
              COALESCE(p.sale_price, p.price) AS unit_price,
              (ci.quantity * COALESCE(p.sale_price, p.price)) AS line_total,
              p.stock_quantity
       FROM cart_items ci
       INNER JOIN products p ON p.id = ci.product_id
       WHERE ci.cart_id = ?`,
      [cart.id]
    );

    const total = items.reduce((sum, item) => sum + Number(item.line_total), 0);
    return { cart, items, total };
  }

  static async upsertItem(userId, productId, quantity) {
    const cart = await this.getOrCreateCart(userId);
    const [existing] = await db.query(
      'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ? LIMIT 1',
      [cart.id, productId]
    );

    if (existing[0]) {
      await db.query('UPDATE cart_items SET quantity = ? WHERE id = ?', [quantity, existing[0].id]);
    } else {
      await db.query('INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)', [cart.id, productId, quantity]);
    }

    return this.getCartDetails(userId);
  }

  static async removeItem(userId, itemId) {
    const cart = await this.getOrCreateCart(userId);
    await db.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, cart.id]);
    return this.getCartDetails(userId);
  }

  static async clearCart(cartId) {
    await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
  }
}

module.exports = CartModel;
