import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Define separate descriptive routes
router.post("/add-category", protect, admin, createCategory);
router.get("/all-categories", getCategories);
router.get("/single-category/:id", getCategoryById);
router.put("/update-category/:id", protect, admin, updateCategory);
router.delete("/delete-category/:id", protect, admin, deleteCategory);

export default router;
