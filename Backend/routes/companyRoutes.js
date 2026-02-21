import express from "express";
import { registerCompany, loginCompany, verifyCompanyOTP } from "../controllers/companyController.js";
import Company from "../models/companyModel.js";
import { SPOOKY_AURA } from "../constants/spookyTrust.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { isVerified: true };
    if (city) {
      filter.city = new RegExp(city, 'i'); // Case-insensitive city search
    }

    const companies = await Company.find(filter).sort({ trustScore: -1 });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/verify-otp", verifyCompanyOTP);

export default router;
