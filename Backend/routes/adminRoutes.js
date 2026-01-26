import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import Company from "../models/companyModel.js";
import User from "../models/UserModel.js";
import Request from "../models/requestModel.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/users", protectAdmin, async (_, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

router.get("/companies", protectAdmin, async (_, res) => {
  const companies = await Company.find();
  res.json(companies);
});

router.patch(
  "/companies/:id/verify",
  protectAdmin,
  async (req, res) => {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isVerified = true;
    await company.save();

    res.json({
      message: "Company verified successfully",
      companyId: company._id,
    });
  }
);

router.get("/requests", protectAdmin, async (_, res) => {
  const requests = await Request.find()
    .populate("user", "name email")
    .populate("company", "name email");
  res.json(requests);
});

export default router;
