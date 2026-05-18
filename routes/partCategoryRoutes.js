import express from "express";
import { protect, admin } from "../middlewares/authMiddleware.js";
import {
  addPartCategory,
  getPartCategories,
  updatePartCategory,
  deletePartCategory,
} from "../controllers/partCategoryController.js";

const router = express.Router();

router.get("/all-categories", getPartCategories);
router.post("/add-category", protect, admin, addPartCategory);
router.put("/update-category/:id", protect, admin, updatePartCategory);
router.delete("/delete-category/:id", protect, admin, deletePartCategory);

export default router;
