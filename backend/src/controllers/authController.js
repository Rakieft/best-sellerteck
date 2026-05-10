const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const UserModel = require('../models/userModel');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/jwt');
const env = require('../config/env');
const { sendPasswordResetEmail } = require('../services/emailService');

const authLimiter = rateLimit({
  windowMs: env.rateLimitWindowMs,
  max: env.authRateLimitMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again later.' }
});

const buildAuthResponse = (user) => {
  const token = signToken({ id: user.id, role: user.role });
  return { token, user };
};

const register = asyncHandler(async (req, res) => {
  const existingUser = await UserModel.findByEmail(req.body.email);
  if (existingUser) {
    throw new ApiError(409, 'An account already exists with this email');
  }

  const user = await UserModel.create(req.body);
  const auth = buildAuthResponse(user);

  res.status(201).json({ success: true, message: 'Account created successfully', ...auth });
});

const login = asyncHandler(async (req, res) => {
  const user = await UserModel.findByEmail(req.body.email);
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isValid = await UserModel.comparePassword(req.body.password, user.password_hash);
  if (!isValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const safeUser = await UserModel.findById(user.id);
  const auth = buildAuthResponse(safeUser);
  res.json({ success: true, message: 'Login successful', ...auth });
});

const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logout successful. Remove the token on the client side.' });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const user = await UserModel.findByEmail(req.body.email);
  if (!user) {
    return res.json({ success: true, message: 'If the email exists, a reset link has been prepared.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await UserModel.storePasswordResetToken(user.id, resetToken);

  const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;
  await sendPasswordResetEmail({ email: user.email, resetUrl });

  return res.json({
    success: true,
    message: 'Password reset instructions generated successfully',
    resetToken: env.env === 'development' ? resetToken : undefined
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const user = await UserModel.findByResetToken(req.params.token);
  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  await UserModel.resetPassword(user.id, req.body.password);
  res.json({ success: true, message: 'Password reset successful' });
});

const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = {
  authLimiter,
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
  me
};
