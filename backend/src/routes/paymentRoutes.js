const express = require('express');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { getOrderPayments } = require('../controllers/paymentController');
const { orderIdParamValidation } = require('../validations/commerceValidation');

const router = express.Router();

router.get('/orders/:orderId', protect, authorize('admin'), validate(orderIdParamValidation), getOrderPayments);

module.exports = router;
