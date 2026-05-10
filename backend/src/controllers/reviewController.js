const ReviewModel = require('../models/reviewModel');
const asyncHandler = require('../utils/asyncHandler');

const createReview = asyncHandler(async (req, res) => {
  const review = await ReviewModel.create({ ...req.body, user_id: req.user.id });
  res.status(201).json({ success: true, message: 'Review submitted', data: review });
});

module.exports = { createReview };
