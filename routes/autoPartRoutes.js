import express from "express";
import {
  addAutoPart,
  getAllAutoParts,
  getAutoPartById,
  deleteAutoPart,
  updateAutoPartStatus,
} from "../controllers/autoPartController.js";
import { protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = express.Router();

router.post("/", protect, upload.array("images", 6), addAutoPart);
router.get("/", getAllAutoParts);
router.get("/:id", getAutoPartById);
router.delete("/:id", protect, deleteAutoPart);
router.put("/:id/status", protect, updateAutoPartStatus);

export default router;
