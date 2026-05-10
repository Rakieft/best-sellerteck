const { body, param, query } = require('express-validator');

const categoryValidation = [
  body('name').trim().notEmpty().isLength({ min: 2, max: 120 }),
  body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/),
  body('description').optional().trim().isLength({ max: 500 }),
  body('image_url').optional().trim().isURL()
];

const productValidation = [
  body('category_id').isInt({ min: 1 }),
  body('name').trim().notEmpty().isLength({ min: 2, max: 160 }),
  body('slug').trim().notEmpty().matches(/^[a-z0-9-]+$/),
  body('brand').trim().notEmpty().isLength({ min: 2, max: 120 }),
  body('sku').trim().notEmpty().isLength({ min: 3, max: 120 }),
  body('short_description').optional().trim().isLength({ max: 255 }),
  body('description').optional().trim().isLength({ max: 4000 }),
  body('price').isFloat({ min: 0 }),
  body('sale_price').optional({ nullable: true }).isFloat({ min: 0 }),
  body('stock_quantity').isInt({ min: 0 }),
  body('image_url').optional().trim().isURL(),
  body('is_featured').optional().isBoolean(),
  body('status').optional().isIn(['draft', 'active', 'archived'])
];

const productQueryValidation = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category_id').optional().isInt({ min: 1 }),
  query('min_price').optional().isFloat({ min: 0 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('sort').optional().isIn(['latest', 'price_asc', 'price_desc'])
];

const idParamValidation = [param('id').isInt({ min: 1 })];

module.exports = {
  categoryValidation,
  productValidation,
  productQueryValidation,
  idParamValidation
};
