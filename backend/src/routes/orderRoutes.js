const express = require('express');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { createOrder, listMyOrders, getMyOrder, listPaymentOptions } = require('../controllers/orderController');
const { orderValidation } = require('../validations/commerceValidation');
const { idParamValidation } = require('../validations/catalogValidation');

const router = express.Router();

router.get('/payment-options', listPaymentOptions);
router.use(protect);
router.get('/', listMyOrders);
router.get('/:id', validate(idParamValidation), getMyOrder);
router.post('/', validate(orderValidation), createOrder);

module.exports = router;
