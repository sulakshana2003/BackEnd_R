// name
// category (ref → Category)
// description
// price
// images (array)
// isVeg (boolean, optional)
// isAvailable (boolean)
// prepTimeMinutes (optional)
// taxRate (optional)
// tags  (array of strings, optional)
// dailySpecial (boolean, optional)

import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    pid: { type: String, unique: true },
    name: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    description: { type: String },
    price: { type: Number, required: true },
    images: [{ type: String }],
    isVeg: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    prepTimeMinutes: { type: Number },
    taxRate: { type: Number },
    tags: [{ type: String }],
    dailySpecial: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
