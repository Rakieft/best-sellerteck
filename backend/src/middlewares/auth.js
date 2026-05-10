const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/jwt');
const UserModel = require('../models/userModel');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : req.cookies?.token;

    if (!token) {
      return next(new ApiError(401, 'Authentication required'));
    }

    const decoded = verifyToken(token);
    const user = await UserModel.findById(decoded.id);

    if (!user || user.status !== 'active') {
      return next(new ApiError(401, 'User is unavailable or inactive'));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new ApiError(401, 'Invalid or expired token'));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'You are not allowed to access this resource'));
  }

  return next();
};

module.exports = { protect, authorize };
