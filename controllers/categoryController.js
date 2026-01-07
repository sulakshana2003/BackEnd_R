// name;
// catId
// description;
// image(optional);
// isActive;
// sortOrder;

// [ ] Category model created
// [ ] Create category (admin)(catogary id should be unique)
// [ ] Update category (admin)
// [ ] Delete/Disable category (admin)
// [ ] List categories (public)

import Category from "../models/category.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description, image, sortOrder } = req.body;
    const uniqueId = "Cat_" + name.trim().toLowerCase().replace(/\s+/g, "_");

    const category = new Category({
      cid: uniqueId,
      name,
      description,
      image,
      sortOrder,
    });
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// List Categories
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      sortOrder: 1,
    });
    res.status(200).json({ categories });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const { cid } = req.params;
    const { name, description, image, isActive, sortOrder } = req.body;

    const category = await Category.findOne({ cid });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (description) category.description = description;
    if (image) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;

    await category.save();
    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete/Disable Category
export const deleteCategory = async (req, res) => {
  try {
    const { cid } = req.params;

    const category = await Category.findOne({ cid });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Soft delete by setting isActive to false
    category.isActive = false;
    await category.save();

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
