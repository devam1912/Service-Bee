import express from "express";
import { registerCompany, loginCompany, verifyCompanyOTP, getCompanyProfile } from "../controllers/companyController.js";
import Company from "../models/companyModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { city } = req.query;
    const filter = { isVerified: true };
    if (city) {
      filter.city = new RegExp(city, 'i'); // Case-insensitive city search
    }

    // Sort by isPremium first (priority), then by trustScore
    const companies = await Company.find(filter).sort({ isPremium: -1, trustScore: -1 });
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch companies" });
  }
});

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/verify-otp", verifyCompanyOTP);
router.get("/profile", protect, getCompanyProfile);

export default router;
