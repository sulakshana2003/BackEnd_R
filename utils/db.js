import mongoose from "mongoose";
import "dotenv/config";

const mongoURL = process.env.MONGODB_URL;

export const connectDB = async () => {
  try {
    await mongoose.connect(mongoURL);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};
