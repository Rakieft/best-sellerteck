const express = require('express');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { listUsers, updateUserStatus } = require('../controllers/userController');
const { paginationValidation, updateUserStatusValidation } = require('../validations/authValidation');

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/', validate(paginationValidation), listUsers);
router.patch('/:id/status', validate(updateUserStatusValidation), updateUserStatus);

module.exports = router;
