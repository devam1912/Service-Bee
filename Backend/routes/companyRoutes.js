import express from "express";
import { registerCompany, loginCompany } from "../controllers/companyController.js";
import Company from "../models/companyModel.js";
import { SPOOKY_AURA } from "../constants/spookyTrust.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const companies = await Company.find({ isVerified: true }).sort({ trustScore: -1 });

  const hauntedCompanies = companies.map(c => {
    let aura = SPOOKY_AURA.CURSED;
    if (c.trustScore >= 80) aura = SPOOKY_AURA.ASCENDED;
    else if (c.trustScore >= 50) aura = SPOOKY_AURA.POSSESSED;
    else if (c.trustScore >= 20) aura = SPOOKY_AURA.HAUNTED;

    return { ...c.toObject(), aura };
  });

  res.json({ companies: hauntedCompanies });
});

router.post("/register", registerCompany);
router.post("/login", loginCompany);

export default router;
