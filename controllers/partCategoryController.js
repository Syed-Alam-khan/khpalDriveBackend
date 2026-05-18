import PartCategory from "../models/PartCategory.model.js";

// Add new category
export const addPartCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ success: false, message: "Category name is required" });
    }

    const categoryExists = await PartCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: "Category already exists" });
    }

    const category = await PartCategory.create({ name });
    res.status(201).json({ success: true, message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all categories
export const getPartCategories = async (req, res) => {
  try {
    const categories = await PartCategory.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: categories.length, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update category
export const updatePartCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await PartCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    category.name = name || category.name;
    const updatedCategory = await category.save();

    res.status(200).json({ success: true, message: "Category updated successfully", category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete category
export const deletePartCategory = async (req, res) => {
  try {
    const category = await PartCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    await category.deleteOne();
    res.status(200).json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
