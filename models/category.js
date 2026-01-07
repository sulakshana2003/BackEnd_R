// name;
// description;
// image(optional);
// isActive;
// sortOrde;

import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    cid: { type: String, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
