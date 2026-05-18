import mongoose from "mongoose";

const partCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
    },
  },
  {
    timestamps: true,
  }
);

const PartCategory = mongoose.model("PartCategory", partCategorySchema);

export default PartCategory;
