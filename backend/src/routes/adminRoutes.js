const express = require('express');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { getDashboardStats, listOrders, updateOrderStatus } = require('../controllers/adminController');
const { orderStatusValidation } = require('../validations/commerceValidation');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/stats', getDashboardStats);
router.get('/orders', listOrders);
router.patch('/orders/:id/status', validate(orderStatusValidation), updateOrderStatus);

module.exports = router;
