const CartModel = require('../models/cartModel');
const ProductModel = require('../models/productModel');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const getCart = asyncHandler(async (req, res) => {
  const cart = await CartModel.getCartDetails(req.user.id);
  res.json({ success: true, data: cart });
});

const addOrUpdateCartItem = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.body.product_id);
  if (!product || product.status !== 'active') {
    throw new ApiError(404, 'Product unavailable');
  }

  if (Number(req.body.quantity) > Number(product.stock_quantity)) {
    throw new ApiError(400, 'Requested quantity exceeds current stock');
  }

  const cart = await CartModel.upsertItem(req.user.id, req.body.product_id, req.body.quantity);
  res.json({ success: true, message: 'Cart updated', data: cart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await CartModel.removeItem(req.user.id, req.params.itemId);
  res.json({ success: true, message: 'Item removed from cart', data: cart });
});

module.exports = { getCart, addOrUpdateCartItem, removeCartItem };
