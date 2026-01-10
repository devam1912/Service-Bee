import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import validator from "validator";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, mobile, address, city } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    if (!password || password.length < 8) {
      return res.status(400).json({ message: "Enter a strong password" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashPassword,
      mobile,
      address,
      city
    });

    res.status(201).json({
      message: "User Signup Successfully",
      userId: user._id
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
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

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        city: user.city
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
