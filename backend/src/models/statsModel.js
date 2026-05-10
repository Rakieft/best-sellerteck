const db = require('../config/db');

class StatsModel {
  static async getAdminStats() {
    const [[users]] = await db.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[products]] = await db.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[orders]] = await db.query('SELECT COUNT(*) AS totalOrders, COALESCE(SUM(total_amount), 0) AS revenue FROM orders');
    const [[pending]] = await db.query("SELECT COUNT(*) AS pendingOrders FROM orders WHERE status = 'pending'");

    return {
      totalUsers: users.totalUsers,
      totalProducts: products.totalProducts,
      totalOrders: orders.totalOrders,
      revenue: orders.revenue,
      pendingOrders: pending.pendingOrders
    };
  }
}

module.exports = StatsModel;
