import AutoPart from "../models/AutoPart.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

// Add new auto part
export const addAutoPart = async (req, res) => {
  try {
    const {
      title,
      price,
      category,
      condition,
      manufacturer,
      compatibleMake,
      compatibleModel,
      compatibleYearRange,
      description,
      location,
      contactPreference,
    } = req.body;

    const files = req.files;
    const images = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);
        if (result && result.secure_url) {
          images.push(result.secure_url);
        }
      }
    }

    if (images.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one image is required.",
      });
    }

    const newPart = new AutoPart({
      title,
      price,
      category,
      condition,
      manufacturer,
      compatibleMake,
      compatibleModel,
      compatibleYearRange,
      description,
      location,
      contactPreference,
      images,
      seller: req.user._id,
    });

    const savedPart = await newPart.save();

    res.status(201).json({
      success: true,
      message: "Auto Part added successfully",
      part: savedPart,
    });
  } catch (error) {
    console.error("Error in addAutoPart:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add Auto Part.",
    });
  }
};

// Get all auto parts
export const getAllAutoParts = async (req, res) => {
  try {
    const parts = await AutoPart.find()
      .populate("seller", "name phoneNumber email role imageUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: parts.length,
      parts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get Auto Parts.",
    });
  }
};

// Get single auto part
export const getAutoPartById = async (req, res) => {
  try {
    const part = await AutoPart.findById(req.params.id)
      .populate("seller", "name phoneNumber email role imageUrl");

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Auto Part not found",
      });
    }

    part.views += 1;
    await part.save();

    res.status(200).json({
      success: true,
      part,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get Auto Part.",
    });
  }
};

// Delete auto part
export const deleteAutoPart = async (req, res) => {
  try {
    const part = await AutoPart.findById(req.params.id);
    
    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Auto Part not found",
      });
    }

    // Check ownership or admin
    if (part.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this Auto Part",
      });
    }

    // Delete images
    if (part.images && part.images.length > 0) {
      for (const img of part.images) {
        if (img.includes('cloudinary.com')) {
          await deleteFromCloudinary(img);
        } else {
          const filePath = path.join("uploads", img);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        }
      }
    }

    await part.deleteOne();

    res.status(200).json({
      success: true,
      message: "Auto Part deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete Auto Part.",
    });
  }
};

// Update status
export const updateAutoPartStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const part = await AutoPart.findById(req.params.id);

    if (!part) {
      return res.status(404).json({
        success: false,
        message: "Auto Part not found",
      });
    }

    if (part.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this Auto Part",
      });
    }

    part.status = status;
    await part.save();

    res.status(200).json({
      success: true,
      message: "Auto Part status updated successfully",
      part,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update Auto Part status.",
    });
  }
};
