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

// List Products isAvailable true only
//list all these
//pid
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

export const listProducts = async (req, res) => {
  try {
    //if is ad min list all products
    if (req.user && req.user.role === "admin") {
      const allProducts = await Product.find().populate("category", "cid name");
      return res.status(200).json({ products: allProducts });
    }

    //else list only available products
    else {
      const products = await Product.find({ isAvailable: true }).populate(
        "category",
        "cid name"
      );
      res.status(200).json({ products });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Update menu item (admin)
export const updateProduct = async (req, res) => {
  try {
    const { pid } = req.params;
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

    const product = await Product.findOne({ pid });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (categoryCid) {
      const category = await Category.findOne({ cid: categoryCid });
      if (!category) {
        return res.status(400).json({ message: "Invalid category" });
      }
      product.category = category._id;
    }

    if (name) product.name = name;
    if (description) product.description = description;
    if (price !== undefined) product.price = price;
    if (images) product.images = images;
    if (isVeg !== undefined) product.isVeg = isVeg;
    if (isAvailable !== undefined) product.isAvailable = isAvailable;
    if (prepTimeMinutes !== undefined)
      product.prepTimeMinutes = prepTimeMinutes;
    if (taxRate !== undefined) product.taxRate = taxRate;
    if (tags) product.tags = tags;
    if (dailySpecial !== undefined) product.dailySpecial = dailySpecial;

    await product.save();
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete/Disable Product (admin)
export const softDeleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findOne({ pid });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    //soft delete - set isAvailable to false
    product.isAvailable = false;
    await product.save();

    res.status(200).json({ message: "Product disabled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Set Availability (isAvailable) (admin)
export const setProductAvailability = async (req, res) => {
  try {
    const { pid } = req.params;
    const { isAvailable } = req.body;

    const product = await Product.findOne({ pid });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isAvailable = isAvailable;
    await product.save();

    res.status(200).json({ message: "Product availability updated", product });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//delete permanently product (admin)
export const deleteProduct = async (req, res) => {
  try {
    const { pid } = req.params;

    const product = await Product.findOne({ pid });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.deleteOne({ pid });

    res.status(200).json({ message: "Product deleted permanently" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
