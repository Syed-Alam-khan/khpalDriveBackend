import express from "express";
import {
  createCar,
  getCars,
  getCarById,
  updateCar,
  deleteCar,
  getMyCars,
  markCarAsSold,
} from "../controllers/carController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = express.Router();

// Define separate descriptive routes
router.post("/add-car", protect, upload.array("images", 10), createCar);
router.get("/all-cars", getCars);
router.get("/my-cars", protect, getMyCars);
router.get("/single-car/:id", getCarById);
router.put("/update-car/:id", protect, upload.array("images", 10), updateCar);
router.delete("/delete-car/:id", protect, deleteCar);
router.put("/mark-as-sold/:id", protect, markCarAsSold);

export default router;
