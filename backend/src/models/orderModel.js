const db = require('../config/db');

class OrderModel {
  static async createOrder(payload) {
    const connection = await db.pool.getConnection();

    try {
      await connection.beginTransaction();

      const [orderResult] = await connection.execute(
        `INSERT INTO orders
        (user_id, order_number, status, payment_status, payment_method, subtotal, shipping_fee, tax_amount, total_amount, currency, delivery_name, delivery_phone, delivery_email, delivery_address, delivery_city, delivery_notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          payload.user_id,
          payload.order_number,
          payload.status || 'pending',
          payload.payment_status || 'pending',
          payload.payment_method,
          payload.subtotal,
          payload.shipping_fee || 0,
          payload.tax_amount || 0,
          payload.total_amount,
          payload.currency || 'HTG',
          payload.delivery_name,
          payload.delivery_phone,
          payload.delivery_email,
          payload.delivery_address,
          payload.delivery_city,
          payload.delivery_notes || null
        ]
      );

      for (const item of payload.items) {
        await connection.execute(
          `INSERT INTO order_items
          (order_id, product_id, product_name, quantity, unit_price, line_total)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [orderResult.insertId, item.product_id, item.product_name, item.quantity, item.unit_price, item.line_total]
        );

        await connection.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await connection.commit();
      const [rows] = await connection.execute('SELECT * FROM orders WHERE id = ? LIMIT 1', [orderResult.insertId]);
      return rows[0];
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByUser(userId) {
    const [rows] = await db.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows;
  }

  static async findById(id) {
    const [orders] = await db.query('SELECT * FROM orders WHERE id = ? LIMIT 1', [id]);
    const order = orders[0] || null;
    if (!order) return null;

    const [items] = await db.query('SELECT * FROM order_items WHERE order_id = ?', [id]);
    return { ...order, items };
  }

  static async findAll() {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    return rows;
  }

  static async updateStatus(id, status, paymentStatus) {
    await db.query('UPDATE orders SET status = ?, payment_status = ? WHERE id = ?', [status, paymentStatus, id]);
    return this.findById(id);
  }
}

module.exports = OrderModel;
