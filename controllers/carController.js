import asyncHandler from "express-async-handler";
import Car from "../models/Car.model.js";
import Category from "../models/Category.model.js";
import fs from "fs";
import path from "path";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

// @desc    Create a new car listing
// @route   POST /api/cars/add-car
// @access  Private
export const createCar = asyncHandler(async (req, res) => {
  const {
    model,
    price,
    fuelType,
    transmission,
    engineCC,
    condition,
    type,
    location,
    category,
    mileage,
  } = req.body;

  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await uploadOnCloudinary(file.path);
      if (result && result.secure_url) {
        images.push(result.secure_url);
      }
    }
  }

  if (images.length === 0) {
    res.status(400);
    throw new Error("At least one image is required");
  }

  // Validate Category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Invalid category. Please select a valid category created by Admin.");
  }

  const car = await Car.create({
    model,
    price,
    fuelType,
    transmission,
    engineCC,
    condition,
    type,
    images,
    location,
    category,
    mileage,
    seller: req.user._id,
  });

  if (car) {
    res.status(201).json({
      message: "Car listing created successfully",
      car,
    });
  } else {
    res.status(400);
    throw new Error("Invalid car data");
  }
});

// @desc    Get all car listings
// @route   GET /api/cars/all-cars
// @access  Public
export const getCars = asyncHandler(async (req, res) => {
  const { search, brand, minPrice, maxPrice, fuelType, transmission, category, type } = req.query;

  let query = { status: "unsold" };

  if (search) {
    query.$text = { $search: search };
  }
  if (brand) {
    query.carName = { $regex: brand, $options: "i" };
  }
  if (fuelType) {
    query.fuelType = fuelType;
  }
  if (transmission) {
    query.transmission = transmission;
  }
  if (category) {
    query.category = category;
  }
  if (type) {
    query.type = type;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const cars = await Car.find(query)
    .sort({ createdAt: -1 })
    .populate("seller", "name phoneNumber imageUrl")
    .populate("category", "name");
    
  res.json({
    message: "Car listings fetched successfully",
    count: cars.length,
    cars,
  });
});

// @desc    Get car details by ID
// @route   GET /api/cars/single-car/:id
// @access  Public
export const getCarById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if ID is valid
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error("Invalid Car ID");
  }

  // Use findByIdAndUpdate to increment views WITHOUT triggering full document validation or save hooks
  // This is safer for public routes that populate fields
  const car = await Car.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  )
  .populate("seller", "name phoneNumber imageUrl")
  .populate("category", "name");

  if (car) {
    res.json({
      message: "Car details fetched successfully",
      car,
    });
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});

// @desc    Update car listing
// @route   PUT /api/cars/update-car/:id
// @access  Private
export const updateCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (car) {
    // Check if user is owner or admin
    if (car.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to update this listing");
    }

    car.carName = req.body.carName || car.carName;
    car.model = req.body.model || car.model;
    car.price = req.body.price || car.price;
    car.fuelType = req.body.fuelType || car.fuelType;
    car.transmission = req.body.transmission || car.transmission;
    car.engineCC = req.body.engineCC || car.engineCC;
    car.condition = req.body.condition || car.condition;
    car.type = req.body.type || car.type;
    car.location = req.body.location || car.location;
    car.year = req.body.year || car.year;
    car.mileage = req.body.mileage || car.mileage;
    car.status = req.body.status || car.status;

    if (req.body.category) {
      const categoryExists = await Category.findById(req.body.category);
      if (!categoryExists) {
        res.status(400);
        throw new Error("Invalid category. Please select a valid category created by Admin.");
      }
      car.category = req.body.category;
    }

    if (req.files && req.files.length > 0) {
      // Upload new images
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadOnCloudinary(file.path);
        if (result && result.secure_url) {
          newImages.push(result.secure_url);
        }
      }

      if (newImages.length > 0) {
        // Delete old images
        for (const img of car.images) {
          if (img.includes('cloudinary.com')) {
            await deleteFromCloudinary(img);
          } else {
            const filePath = path.join("uploads", img);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
        car.images = newImages;
      }
    }

    const updatedCar = await car.save();
    res.json({
      message: "Car listing updated successfully",
      car: updatedCar,
    });
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});

// @desc    Delete car listing
// @route   DELETE /api/cars/delete-car/:id
// @access  Private
export const deleteCar = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (car) {
    // Check if user is owner or admin
    if (car.seller.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      res.status(403);
      throw new Error("Not authorized to delete this listing");
    }

    // Delete images
    for (const img of car.images) {
      if (img.includes('cloudinary.com')) {
        await deleteFromCloudinary(img);
      } else {
        const filePath = path.join("uploads", img);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await car.deleteOne();
    res.json({ message: "Car listing removed successfully" });
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});

// @desc    Get user's car listings
// @route   GET /api/cars/my-cars
// @access  Private
export const getMyCars = asyncHandler(async (req, res) => {
  const cars = await Car.find({ seller: req.user._id })
    .sort({ createdAt: -1 })
    .populate("category", "name");
  res.json({
    message: "Your car listings fetched successfully",
    count: cars.length,
    cars,
  });
});

// @desc    Mark car as sold
// @route   PUT /api/cars/mark-as-sold/:id
// @access  Private
export const markCarAsSold = asyncHandler(async (req, res) => {
  const car = await Car.findById(req.params.id);

  if (car) {
    // Check if user is owner
    if (car.seller.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error("Not authorized to mark this car as sold");
    }

    car.status = "sold";
    const updatedCar = await car.save();
    res.json({
      message: "Car marked as sold successfully",
      car: updatedCar,
    });
  } else {
    res.status(404);
    throw new Error("Car not found");
  }
});
