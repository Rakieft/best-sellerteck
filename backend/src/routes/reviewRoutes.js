const express = require('express');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { createReview } = require('../controllers/reviewController');
const { reviewValidation } = require('../validations/commerceValidation');

const router = express.Router();

router.post('/', protect, validate(reviewValidation), createReview);

module.exports = router;
