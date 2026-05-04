import asyncHandler from "express-async-handler";
import Category from "../models/Category.model.js";

// @desc    Create a new category
// @route   POST /api/categories/add-category
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  const categoryExists = await Category.findOne({ name });

  if (categoryExists) {
    res.status(400);
    throw new Error("Category already exists");
  }

  const category = await Category.create({ name });

  if (category) {
    res.status(201).json({
      message: "Category created successfully",
      category,
    });
  } else {
    res.status(400);
    throw new Error("Invalid category data");
  }
});

// @desc    Get all categories
// @route   GET /api/categories/all-categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.json({
    message: "Categories fetched successfully",
    count: categories.length,
    categories,
  });
});

// @desc    Get category by ID
// @route   GET /api/categories/single-category/:id
// @access  Public
export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    res.json({
      message: "Category details fetched successfully",
      category,
    });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Update category
// @route   PUT /api/categories/update-category/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    category.name = req.body.name || category.name;
    const updatedCategory = await category.save();
    res.json({
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});

// @desc    Delete category
// @route   DELETE /api/categories/delete-category/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (category) {
    await category.deleteOne();
    res.json({ message: "Category removed successfully" });
  } else {
    res.status(404);
    throw new Error("Category not found");
  }
});
