// pid
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

// [ ] MenuItem model created
// [ ] Create menu item (admin)
// [ ] Update menu item (admin)
// [ ] Delete/Disable menu item (admin)
// [ ] List menu items (public)
// [ ] Search + filter menu items (category, tags, price)
// [ ] Set availability (isAvailable)
// [ ] Upload images (supabase) (optional)

import Product from "../models/product.js";
import Category from "../models/category.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      categoryCid,
      description,
      price,
      images,
      isVeg,
      isAvailable,
      prepTimeMinutes,
      taxRate,
      tags,
      dailySpecial,
    } = req.body;

    //generate product id(pid) base on p + 0000001 to incremental
    let productId = "p00001";
    const lastProduct = await Product.findOne().sort({ _id: -1 });
    if (lastProduct) {
      const lastIdNum = parseInt(lastProduct.pid.slice(1));
      const newIdNum = lastIdNum + 1;
      productId = "p" + newIdNum.toString().padStart(5, "0");
    }

    const category = await Category.findOne({ cid: categoryCid });
    if (!category) {
      return res.status(400).json({ message: "Invalid category" });
    }

    const product = new Product({
      pid: productId,
      name,
      category: category._id,
      description,
      price,
      images,
      isVeg,
      isAvailable,
      prepTimeMinutes,
      taxRate,
      tags,
      dailySpecial,
    });
    await product.save();
    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
