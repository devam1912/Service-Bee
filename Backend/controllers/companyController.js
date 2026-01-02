import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Company from "../models/companyModel.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || "7d",
  });
};

export const registerCompany = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      mobile,
      serviceCategory,
      services,
      city,
      description,
    } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

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
    });

    res.status(201).json({
      message: "Company registered successfully",
      companyId: company._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    res.status(200).json({
      message: "Company login successful",
      token: generateToken(company._id),
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        role: company.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
