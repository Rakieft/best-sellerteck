const PaymentModel = require('../models/paymentModel');
const asyncHandler = require('../utils/asyncHandler');

const getOrderPayments = asyncHandler(async (req, res) => {
  const payments = await PaymentModel.findByOrder(req.params.orderId);
  res.json({ success: true, data: payments });
});

module.exports = { getOrderPayments };
