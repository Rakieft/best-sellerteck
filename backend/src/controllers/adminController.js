const OrderModel = require('../models/orderModel');
const StatsModel = require('../models/statsModel');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await StatsModel.getAdminStats();
  res.json({ success: true, data: stats });
});

const listOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.findAll();
  res.json({ success: true, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await OrderModel.updateStatus(req.params.id, req.body.status, req.body.payment_status);
  res.json({ success: true, message: 'Order status updated', data: order });
});

module.exports = { getDashboardStats, listOrders, updateOrderStatus };
