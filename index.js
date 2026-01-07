import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./utils/db.js";
import { authMiddleware } from "./middleware/auth.js";
import userRouter from "./routes/userRoute.js";
import categoryRouter from "./routes/categoryRoute.js";

// Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();
app.use(authMiddleware);

//routes
app.use("/api/users", userRouter);
app.use("/api/cat", categoryRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
