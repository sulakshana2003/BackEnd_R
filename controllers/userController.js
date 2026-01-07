// Register user (hash password, create user)
// Login user (verify password, issue JWT/access token)
// Login with Google(Email verification dont required)
// Email verification (send code/link, verify)
// Forgot password (generate reset token, email it)
// Reset password (validate token, update password)
// Get current user profile (/me)
// Update profile (name/phone/password)
// Role/permissions:
// Normal user vs admin/staff
// Middleware: auth, isAdmin, hasRole

import User from "../models/user.js";
import OTP from "../models/otp.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";
import nodemailer from "nodemailer";

// Register a new user
export const registerUser = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email and password are required" });
    }
    if (role == "admin") {
      if (req.user != null) {
        if (req.user.role != "admin") {
          return res
            .status(403)
            .json({ message: "Only admin can create another admin" });
        }
      } else {
        return res.status(403).json({
          message:
            "you are not authorized to create an admin user. Please login first",
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      phone,
      password: passwordHash,
      role,
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active
    if (!user.isActive || user.isBlocked) {
      return res.status(403).json({ message: "User is not active" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const payload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//is admin middleware

export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Admin access required" });
  }
};

//has role middleware

export const hasRole = (roles) => {
  return (req, res, next) => {
    if (req.user && roles.includes(req.user.role)) {
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  };
};

//Login with Google(Email verification dont required)

export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;
    if (!tokenId) {
      return res.status(400).json({ message: "Token ID is required" });
    }
    const googleUser = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokenId}` } }
    );

    const { email, name, picture } = googleUser.data;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({
        name,
        email,
        password: "",
        role: "customer",
        image: picture,
      });
      await user.save();
    }

    const payload = {
      id: user._id,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      image: user.image,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Forgot password (generate reset otp, email it)[otp has a model]

const transport = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete existing OTPs for the user
    await OTP.deleteMany({ userId: user._id });
    // Save OTP to database (you need to create an OTP model for this)
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now
    const otpEntry = new OTP({
      userId: user._id,
      otpCode: otp,
      expiresAt,
    });
    await otpEntry.save();
    // await OTPModel.create({ userId: user._id, otp, expiresAt: Date.now() + 3600000 });
    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It is valid for 1 hour.`,
    };

    await transport.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Reset password (validate otp, update password, delete otp)

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email, OTP and new password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otpEntry = await OTP.findOne({ userId: user._id, otpCode: otp });
    if (!otpEntry || otpEntry.expiresAt < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update user's password
    user.password = passwordHash;
    await user.save();

    // Delete OTP entry
    await OTP.deleteMany({ userId: user._id });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current user profile (/me)
export const getCurrentUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update profile (name/phone/password) // password must changed with otp
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { name, phone } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.status(200).json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
