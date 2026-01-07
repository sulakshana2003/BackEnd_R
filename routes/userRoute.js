import express from "express";
import { registerUser, loginUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/reg", registerUser);
userRouter.post("/login", loginUser);

export default userRouter;
