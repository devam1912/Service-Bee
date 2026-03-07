import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Company from "../models/companyModel.js";
import { sendEmail } from "../utils/email.js";
import { getOtpTemplate } from "../utils/emailTemplates.js";
import validator from "validator";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

export const registerCompany = async (req, res) => {
  try {
    const {
      name,
      email: rawEmail,
      password,
      mobile,
      serviceCategory,
      services,
      city,
      description,
    } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email || !password || !name || !mobile) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Enter a valid email" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP for registration verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const company = await Company.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      serviceCategory,
      services,
      city,
      description,
      role: "company",
      otp,
      otpExpires,
      isVerified: false
    });

    // Send OTP via Email
    await sendEmail(
      company.email,
      "Welcome to Service Bee - Verify Your Business",
      `Your business verification OTP is: ${otp}.`,
      getOtpTemplate(otp, name, "Business Verification")
    );

    res.status(201).json({
      message: "Company registered. Please verify your OTP.",
      companyId: company._id,
      email: company.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginCompany = async (req, res) => {
  try {
    const { email: rawEmail, password } = req.body;
    const email = rawEmail?.toLowerCase();

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    company.otp = otp;
    company.otpExpires = otpExpires;
    await company.save();

    // Send OTP via Email
    const result = await sendEmail(
      company.email,
      "Company Login OTP - Service Bee",
      `Your login OTP is: ${otp}.`,
      getOtpTemplate(otp, company.name, "Company Access")
    );

    if (!result.success) {
      console.error(`[COMPANY LOGIN] Failed to send email: ${result.error}`);

      // Render Free Tier blocks SMTP (Ports 465/587) causing timeouts.
      if (result.error.toLowerCase().includes("timeout")) {
        company.otp = "123456";
        company.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await company.save();
        return res.status(200).json({
          message: "Render Free Tier blocked the email. Use default OTP: 123456",
          email: company.email
        });
      }

      return res.status(500).json({ message: `Email Error: ${result.error}` });
    }

    return res.status(200).json({
      message: "OTP sent to your email",
      email: company.email
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyCompanyOTP = async (req, res) => {
  try {
    const { email: rawEmail, otp: rawOtp } = req.body;
    const email = rawEmail?.toLowerCase();
    const otp = rawOtp?.toString().trim();

    console.log(`[VERIFY] Company attempt for ${email}. Provided: "${otp}"`);

    const company = await Company.findOne({ email });

    if (company) {
      console.log(`[VERIFY] Company found. Stored: "${company.otp}". Expired: ${company.otpExpires < new Date()}`);
    }

    if (!company || company.otp !== otp || company.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Clear OTP (Keep isVerified false until admin approved)
    company.otp = null;
    company.otpExpires = null;
    await company.save();

    return res.status(200).json({
      message: "Company login successful",
      token: generateToken(company._id),
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        role: company.role,
        city: company.city,
        trustScore: company.trustScore,
        rating: company.rating
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const resendCompanyOTP = async (req, res) => {
  try {
    const { email: rawEmail } = req.body;
    const email = rawEmail?.toLowerCase();

    if (!email) return res.status(400).json({ message: "Email is required" });

    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ message: "Company not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    company.otp = otp;
    company.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await company.save();

    await sendEmail(
      email,
      "Login OTP - Service Bee",
      `Your new OTP is: ${otp}`,
      getOtpTemplate(otp, company.name, "Company OTP Resend")
    );
    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.user._id).select("-password -otp -otpExpires");
    if (!company) {
      return res.status(404).json({ message: "Company profile not found" });
    }
    res.status(200).json({ company });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

export const updateUnavailableDates = async (req, res) => {
  try {
    const { dates } = req.body; // Array of YYYY-MM-DD
    if (!Array.isArray(dates)) return res.status(400).json({ message: "Dates must be an array" });

    const company = await Company.findById(req.user._id);
    if (!company) return res.status(404).json({ message: "Company not found" });

    company.unavailableDates = dates;
    await company.save();

    res.json({ message: "Holiday calendar updated", unavailableDates: company.unavailableDates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateServiceCatalog = async (req, res) => {
  try {
    const { catalog } = req.body; // Array of { name, price, description }

    if (!Array.isArray(catalog)) {
      return res.status(400).json({ message: "Catalog must be an array" });
    }

    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.serviceCatalog = catalog;
    await company.save();

    res.status(200).json({
      message: "Service catalog updated",
      catalog: company.serviceCatalog
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleActiveStatus = async (req, res) => {
  try {
    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isActive = !company.isActive;
    await company.save();

    res.status(200).json({
      message: `Operational status updated to ${company.isActive ? "Active" : "Inactive"}`,
      isActive: company.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
