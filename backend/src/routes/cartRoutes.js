const express = require('express');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const { getCart, addOrUpdateCartItem, removeCartItem } = require('../controllers/cartController');
const { cartItemValidation, removeCartItemValidation } = require('../validations/commerceValidation');

const router = express.Router();

router.use(protect);
router.get('/', getCart);
router.post('/items', validate(cartItemValidation), addOrUpdateCartItem);
router.delete('/items/:itemId', validate(removeCartItemValidation), removeCartItem);

module.exports = router;
