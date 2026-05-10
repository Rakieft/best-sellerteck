const { body, param } = require('express-validator');

const cartItemValidation = [
  body('product_id').isInt({ min: 1 }),
  body('quantity').isInt({ min: 1, max: 20 })
];

const removeCartItemValidation = [param('itemId').isInt({ min: 1 })];
const orderIdParamValidation = [param('orderId').isInt({ min: 1 })];

const orderValidation = [
  body('payment_method').isIn(['moncash', 'natcash', 'paypal', 'card']),
  body('delivery_name').trim().notEmpty().isLength({ min: 2, max: 120 }),
  body('delivery_phone').trim().notEmpty().isLength({ min: 8, max: 20 }),
  body('delivery_email').trim().isEmail().normalizeEmail(),
  body('delivery_address').trim().notEmpty().isLength({ min: 5, max: 255 }),
  body('delivery_city').trim().notEmpty().isLength({ min: 2, max: 120 }),
  body('delivery_notes').optional().trim().isLength({ max: 500 })
];

const orderStatusValidation = [
  param('id').isInt({ min: 1 }),
  body('status').isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']),
  body('payment_status').isIn(['pending', 'authorized', 'paid', 'failed', 'refunded'])
];

const reviewValidation = [
  body('product_id').isInt({ min: 1 }),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().trim().isLength({ max: 150 }),
  body('comment').optional().trim().isLength({ max: 1200 })
];

module.exports = {
  cartItemValidation,
  removeCartItemValidation,
  orderIdParamValidation,
  orderValidation,
  orderStatusValidation,
  reviewValidation
};
