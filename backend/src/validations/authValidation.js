const { body, param, query } = require('express-validator');

const registerValidation = [
  body('first_name').trim().notEmpty().isLength({ min: 2, max: 80 }),
  body('last_name').trim().notEmpty().isLength({ min: 2, max: 80 }),
  body('email').trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ min: 8, max: 20 }),
  body('password').isLength({ min: 8 }).matches(/[A-Z]/).matches(/[0-9]/)
];

const loginValidation = [
  body('email').trim().isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const forgotPasswordValidation = [body('email').trim().isEmail().normalizeEmail()];
const resetPasswordValidation = [param('token').notEmpty(), body('password').isLength({ min: 8 })];
const updateUserStatusValidation = [param('id').isInt(), body('status').isIn(['active', 'suspended'])];
const paginationValidation = [query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 })];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateUserStatusValidation,
  paginationValidation
};
