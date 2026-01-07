import express from "express";
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { isAdmin } from "../middleware/auth.js";

const categoryRouter = express.Router();

//categoryRouter.get("/", getAllCategories);
categoryRouter.post("/", isAdmin, createCategory);
categoryRouter.get("/", listCategories);
categoryRouter.put("/:cid", isAdmin, updateCategory);
categoryRouter.post("/:cid", isAdmin, deleteCategory); // this is soft delete

export default categoryRouter;
