import mongoose from "mongoose";

const autoPartSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    category: {
      type: String, // E.g., Engine, Electrical, Body, Suspension, Tires/Rims
      required: [true, "Category is required"],
    },
    condition: {
      type: String,
      enum: ["Brand New / OEM", "Used / Aftermarket", "New", "Used"],
      required: [true, "Condition is required"],
    },
    manufacturer: {
      type: String,
      default: "",
    },
    compatibleMake: {
      type: String,
      default: "",
    },
    compatibleModel: {
      type: String,
      default: "",
    },
    compatibleYearRange: {
      type: String,
      default: "", // E.g. "2018 - 2022"
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    contactPreference: {
      type: String,
      enum: ["Phone", "WhatsApp", "Both"],
      default: "Both",
    },
    images: [
      {
        type: String,
      },
    ],
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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

autoPartSchema.index({ title: "text", category: "text" });
autoPartSchema.index({ price: 1 });

const AutoPart = mongoose.model("AutoPart", autoPartSchema);

export default AutoPart;
