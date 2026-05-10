const express = require('express');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { listCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { categoryValidation, idParamValidation } = require('../validations/catalogValidation');

const router = express.Router();

router.get('/', listCategories);
router.post('/', protect, authorize('admin'), validate(categoryValidation), createCategory);
router.put('/:id', protect, authorize('admin'), validate([...idParamValidation, ...categoryValidation]), updateCategory);
router.delete('/:id', protect, authorize('admin'), validate(idParamValidation), deleteCategory);

module.exports = router;
