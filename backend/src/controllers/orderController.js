const CartModel = require('../models/cartModel');
const OrderModel = require('../models/orderModel');
const PaymentModel = require('../models/paymentModel');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { getPaymentProvider, listPaymentProviders } = require('../services/paymentService');

const buildOrderNumber = () => `BST-${Date.now()}`;

const createOrder = asyncHandler(async (req, res) => {
  const provider = getPaymentProvider(req.body.payment_method);
  if (!provider) {
    throw new ApiError(400, 'Unsupported payment method');
  }

  const cartState = await CartModel.getCartDetails(req.user.id);
  if (!cartState.items.length) {
    throw new ApiError(400, 'Cart is empty');
  }

  const subtotal = cartState.total;
  const shippingFee = subtotal >= 50000 ? 0 : 1500;
  const taxAmount = 0;
  const totalAmount = subtotal + shippingFee + taxAmount;

  const order = await OrderModel.createOrder({
    user_id: req.user.id,
    order_number: buildOrderNumber(),
    payment_method: req.body.payment_method,
    subtotal,
    shipping_fee: shippingFee,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    delivery_name: req.body.delivery_name,
    delivery_phone: req.body.delivery_phone,
    delivery_email: req.body.delivery_email,
    delivery_address: req.body.delivery_address,
    delivery_city: req.body.delivery_city,
    delivery_notes: req.body.delivery_notes,
    items: cartState.items.map((item) => ({
      product_id: item.product_id,
      product_name: item.name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      line_total: item.line_total
    }))
  });

  await PaymentModel.create({
    order_id: order.id,
    provider: provider.key,
    amount: totalAmount,
    status: 'initiated',
    metadata: { providerLabel: provider.label, integrationReady: false }
  });

  await CartModel.clearCart(cartState.cart.id);

  res.status(201).json({ success: true, message: 'Order created successfully', data: order });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await OrderModel.findByUser(req.user.id);
  res.json({ success: true, data: orders });
});

const getMyOrder = asyncHandler(async (req, res) => {
  const order = await OrderModel.findById(req.params.id);
  if (!order || Number(order.user_id) !== Number(req.user.id)) {
    throw new ApiError(404, 'Order not found');
  }

  res.json({ success: true, data: order });
});

const listPaymentOptions = asyncHandler(async (req, res) => {
  res.json({ success: true, data: listPaymentProviders() });
});

module.exports = { createOrder, listMyOrders, getMyOrder, listPaymentOptions };
