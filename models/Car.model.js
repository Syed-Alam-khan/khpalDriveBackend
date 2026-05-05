import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    model: {
      type: String,
      required: [true, "Car model is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Hybrid", "Electric", "CNG", "LPG"],
      required: [true, "Fuel type is required"],
    },
    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      required: [true, "Transmission is required"],
    },
    engineCC: {
      type: String,
      required: [true, "Engine capacity (e.g., 1800cc) is required"],
    },
    condition: {
      type: String,
      enum: ["New", "Used"],
      required: [true, "Condition is required"],
    },
    type: {
      type: String,
      enum: ["Cut", "Non Cut", "Import", "Local"],
      required: [true, "Car type (Cut, Non Cut, Import, or Local) is required"],
    },
    images: [
      {
        type: String,
      },
    ],
    location: {
      type: String,
      required: [true, "Location for pickup/inspection is required"],
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Car category is required"],
    },
    mileage: {
      type: String,
      required: [true, "Mileage is required"],
    },
    status: {
      type: String,
      enum: ["sold", "unsold"],
      default: "unsold",
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better searching
carSchema.index({ carName: "text", model: "text" });
carSchema.index({ price: 1 });

const Car = mongoose.model("Car", carSchema);

export default Car;
