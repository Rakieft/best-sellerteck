const CategoryModel = require('../models/categoryModel');
const asyncHandler = require('../utils/asyncHandler');

const listCategories = asyncHandler(async (req, res) => {
  const data = await CategoryModel.findAll();
  res.json({ success: true, data });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.create(req.body);
  res.status(201).json({ success: true, message: 'Category created', data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await CategoryModel.update(req.params.id, req.body);
  res.json({ success: true, message: 'Category updated', data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await CategoryModel.delete(req.params.id);
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
