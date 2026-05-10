const express = require('express');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const {
  authLimiter,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  me
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require('../validations/authValidation');

const router = express.Router();

router.post('/register', authLimiter, validate(registerValidation), register);
router.post('/login', authLimiter, validate(loginValidation), login);
router.post('/logout', logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordValidation), forgotPassword);
router.post('/reset-password/:token', authLimiter, validate(resetPasswordValidation), resetPassword);
router.get('/me', protect, me);

module.exports = router;
