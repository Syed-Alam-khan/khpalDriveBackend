import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import upload from "../middlewares/multerMiddleware.js";
import { protect, admin } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/register", upload.single("imageUrl"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("imageUrl"), updateUserProfile);

// Admin only routes
router.route("/")
  .get(protect, admin, getUsers);

router.route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, upload.single("imageUrl"), updateUser)
  .delete(protect, admin, deleteUser);

export default router;
