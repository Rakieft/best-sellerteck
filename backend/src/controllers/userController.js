const UserModel = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');
const { buildPagination } = require('../utils/pagination');

const listUsers = asyncHandler(async (req, res) => {
  const pagination = buildPagination(req.query);
  const data = await UserModel.list(pagination);
  res.json({ success: true, ...data, ...pagination });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await UserModel.updateStatus(req.params.id, req.body.status);
  res.json({ success: true, message: 'User status updated', data: user });
});

module.exports = { listUsers, updateUserStatus };
