const db = require('../config/db');

class PaymentModel {
  static async create(payload) {
    const [result] = await db.query(
      `INSERT INTO payments
      (order_id, provider, transaction_reference, amount, currency, status, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.order_id,
        payload.provider,
        payload.transaction_reference || null,
        payload.amount,
        payload.currency || 'HTG',
        payload.status || 'initiated',
        JSON.stringify(payload.metadata || {})
      ]
    );

    const [rows] = await db.query('SELECT * FROM payments WHERE id = ? LIMIT 1', [result.insertId]);
    return rows[0] || null;
  }

  static async findByOrder(orderId) {
    const [rows] = await db.query('SELECT * FROM payments WHERE order_id = ?', [orderId]);
    return rows;
  }
}

module.exports = PaymentModel;
