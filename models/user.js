// name
// email (unique, optional if phone login)
// phone (unique if using OTP/login)
// password (if email/password login)
// role (customer | cashier | waiter | kitchen | admin)
// isActive
// timestamps

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["customer", "cashier", "waiter", "kitchen", "admin"],
      default: "customer",
    },
    isActive: { type: Boolean, default: true },
    isBlocked: { type: Boolean, default: false },
    image: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
