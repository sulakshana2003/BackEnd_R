import express from "express";
import {
  createProduct,
  listProducts,
} from "../controllers/productController.js";
import { isAdmin } from "../middleware/auth.js";

const productRouter = express.Router();

productRouter.post("/", isAdmin, createProduct);
productRouter.get("/", listProducts);

export default productRouter;
