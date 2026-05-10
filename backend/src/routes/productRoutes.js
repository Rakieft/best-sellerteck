const express = require('express');
const validate = require('../middlewares/validate');
const { protect, authorize } = require('../middlewares/auth');
const { listProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { productValidation, productQueryValidation, idParamValidation } = require('../validations/catalogValidation');

const router = express.Router();

router.get('/', validate(productQueryValidation), listProducts);
router.get('/:id', validate(idParamValidation), getProduct);
router.post('/', protect, authorize('admin'), validate(productValidation), createProduct);
router.put('/:id', protect, authorize('admin'), validate([...idParamValidation, ...productValidation]), updateProduct);
router.delete('/:id', protect, authorize('admin'), validate(idParamValidation), deleteProduct);

module.exports = router;
