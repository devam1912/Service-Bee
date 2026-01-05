import express from "express";
import {
  registerCompany,
  loginCompany,
} from "../controllers/companyController.js";
import Company from "../models/companyModel.js";

const router = express.Router();
router.get("/", async (req, res) => {
  const companies = await Company.find({ isVerified: true });
  res.json(companies);
});

router.post("/register", registerCompany);
router.post("/login", loginCompany);

export default router;
