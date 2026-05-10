const ProductModel = require('../models/productModel');
const ReviewModel = require('../models/reviewModel');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { buildPagination } = require('../utils/pagination');

const listProducts = asyncHandler(async (req, res) => {
  const pagination = buildPagination(req.query);
  const data = await ProductModel.findAll(req.query, pagination);
  res.json({ success: true, ...data, ...pagination });
});

const getProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  const reviews = await ReviewModel.findByProduct(req.params.id);
  res.json({ success: true, data: { ...product, reviews } });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.create(req.body);
  res.status(201).json({ success: true, message: 'Product created', data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await ProductModel.update(req.params.id, req.body);
  res.json({ success: true, message: 'Product updated', data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await ProductModel.delete(req.params.id);
  res.json({ success: true, message: 'Product deleted' });
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };
