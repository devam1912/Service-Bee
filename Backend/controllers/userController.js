import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import validator from "validator";
import { sendEmail } from "../utils/email.js";
import crypto from "crypto";


export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile, address, city } = req.body;

    if (!name || !email || !password || !mobile) {
      return res.status(400).json({ message: "Name, email, password and mobile are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    if (!validator.isMobilePhone(mobile, 'any')) {
      return res.status(400).json({ message: "Enter a valid mobile number" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // Generate OTP for registration verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours for first signup

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      mobile,
      address,
      city,
      role: "user",
      termsAccepted: false,
      otp,
      otpExpires,
      isVerified: false
    });

    // Send OTP via Email
    await sendEmail(
      user.email,
      "Welcome to Service Bee - Verify Your Account",
      `Your verification OTP is: ${otp}.`,
      `<h1>Welcome to Service Bee</h1><p>Thank you for joining! Your verification OTP is: <strong>${otp}</strong>.</p>`
    );

    return res.status(201).json({
      message: "User registered. Please verify your OTP.",
      userId: user._id,
      email: user.email
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via Email
    const emailSent = await sendEmail(
      user.email,
      "Login OTP - Service Bee",
      `Your login OTP is: ${otp}. It expires in 10 minutes.`,
      `<h1>Login Verification</h1><p>Your login OTP is: <strong>${otp}</strong>. It expires in 10 minutes.</p>`
    );

    if (!emailSent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      message: "OTP sent to your email",
      email: user.email
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({ message: "Login failed" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP and verify user
    user.otp = null;
    user.otpExpires = null;
    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city
      }
    });
  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};

