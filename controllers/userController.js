import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";
import generateToken from "../utils/generateToken.js";
import fs from "fs";
import path from "path";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// @desc    Register new user
// @route   POST /api/users/register
// @access  Public
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phoneNumber, role } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  let imageUrl = null;
  if (req.file) {
    const result = await uploadOnCloudinary(req.file.path);
    if (result && result.secure_url) {
      imageUrl = result.secure_url;
    } else {
      res.status(400);
      throw new Error("Failed to upload profile image");
    }
  }

  if (!imageUrl) {
    res.status(400);
    throw new Error("Profile image is required");
  }

  const user = await User.create({
    name,
    email,
    password,
    phoneNumber,
    role,
    imageUrl,
  });

  if (user) {
    const token = generateToken(res, user._id);

    res.status(201).json({
      message: "User registered successfully - V4 - FORCED_TOKEN",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        imageUrl: user.imageUrl,
      }
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = generateToken(res, user._id);
    res.json({
      message: "Logged in successfully - V4 - FORCED_TOKEN",
      token: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        imageUrl: user.imageUrl,
      }
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Logout user / clear cookie
// @route   POST /api/users/logout
// @access  Public
export const logoutUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Logged out successfully" });
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      message: "User profile fetched successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        imageUrl: user.imageUrl,
      }
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;

    // Password Update Logic with Old Password Verification
    if (req.body.password) {
      if (!req.body.oldPassword) {
        res.status(400);
        throw new Error("Current password is required to set a new password");
      }
      
      const isMatch = await user.matchPassword(req.body.oldPassword);
      if (!isMatch) {
        res.status(401);
        throw new Error("Current password is incorrect");
      }
      
      user.password = req.body.password;
    }

    if (req.file) {
      if (user.imageUrl) {
        if (user.imageUrl.includes('cloudinary.com')) {
          await deleteFromCloudinary(user.imageUrl);
        } else {
          const oldPath = path.join("uploads", user.imageUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }
      const result = await uploadOnCloudinary(req.file.path);
      if (result && result.secure_url) {
        user.imageUrl = result.secure_url;
      }
    }

    const updatedUser = await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        imageUrl: updatedUser.imageUrl,
      }
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json({
    message: "Users fetched successfully",
    count: users.length,
    users,
  });
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    res.json({
      message: "User details fetched successfully",
      user,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phoneNumber = req.body.phoneNumber || user.phoneNumber;
    user.role = req.body.role || user.role;

    if (req.body.password) {
      user.password = req.body.password;
    }

    if (req.file) {
      if (user.imageUrl) {
        if (user.imageUrl.includes('cloudinary.com')) {
          await deleteFromCloudinary(user.imageUrl);
        } else {
          const oldPath = path.join("uploads", user.imageUrl);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }
      const result = await uploadOnCloudinary(req.file.path);
      if (result && result.secure_url) {
        user.imageUrl = result.secure_url;
      }
    }

    const updatedUser = await user.save();

    res.json({
      message: "User updated successfully",
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phoneNumber,
        role: updatedUser.role,
        imageUrl: updatedUser.imageUrl,
      }
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    if (user.imageUrl) {
      if (user.imageUrl.includes('cloudinary.com')) {
        await deleteFromCloudinary(user.imageUrl);
      } else {
        const filePath = path.join("uploads", user.imageUrl);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await user.deleteOne();
    res.json({ message: "User removed successfully" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});
