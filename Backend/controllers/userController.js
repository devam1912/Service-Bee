import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import validator from "validator";
import { sendEmail } from "../utils/email.js";
import { getOtpTemplate } from "../utils/emailTemplates.js";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);



export const registerUser = async (req, res) => {
  try {
    const { name, email: rawEmail, password, mobile, address, city } = req.body;
    const email = rawEmail?.toLowerCase();

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
      getOtpTemplate(otp, name, "Account Verification")
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
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      return res.status(404).json({ message: "No account found with this email." });
    }

    console.log(`[LOGIN] Matching password for ${email}...`);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log(`[LOGIN] Password mismatch for ${email}`);
      return res.status(401).json({ message: "Invalid password. Try again." });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send OTP via Email
    console.log(`[LOGIN] Sending OTP to ${user.email}...`);
    const result = await sendEmail(
      user.email,
      "Login OTP - Service Bee",
      `Your login OTP is: ${otp}.`,
      getOtpTemplate(otp, user.name, "Secure Login")
    );

    if (!result.success) {
      console.error(`[LOGIN] Failed to send email to ${user.email}: ${result.error}`);

      // Render Free Tier blocks SMTP (Ports 465/587) causing timeouts.
      // Immediate Rescue Workaround:
      if (result.error.toLowerCase().includes("timeout")) {
        user.otp = "123456";
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        return res.status(200).json({
          message: "Render Free Tier blocked the email. Use default OTP: 123456",
          email: user.email
        });
      }

      return res.status(500).json({ message: `Email Error: ${result.error}` });
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
    const { email: rawEmail, otp: rawOtp } = req.body;
    const email = rawEmail?.toLowerCase();
    const otp = rawOtp?.toString().trim();

    console.log(`[VERIFY] Attempt for ${email}. Provided: "${otp}"`);

    const user = await User.findOne({ email });

    if (user) {
      console.log(`[VERIFY] User found. Stored: "${user.otp}". Expired: ${user.otpExpires < new Date()}`);
    }

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

export const resendOTP = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendEmail(
      email,
      "Login OTP - Service Bee",
      `Your new OTP is: ${otp}`,
      getOtpTemplate(otp, user.name, "OTP Resend")
    );
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const googleAuthUser = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email: rawEmail, name } = payload;
    const email = rawEmail?.toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      // Create new user with dummy password and fields since Google doesn't provide them
      const generatedPassword = crypto.randomBytes(16).toString("hex");
      const hashPassword = await bcrypt.hash(generatedPassword, 10);

      user = await User.create({
        name,
        email,
        password: hashPassword,
        mobile: "Provided via Google",
        address: "Provided via Google",
        city: "Provided via Google",
        role: "user",
        termsAccepted: true,
        isVerified: true
      });
    }

    // Ensure they are verified if logging in with Google
    user.isVerified = true;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES }
    );

    res.status(200).json({
      message: "Login successful",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile
      }
    });

  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(500).json({ message: "Google Authentication Failed. Ensure GOOGLE_CLIENT_ID is correct." });
  }
};
