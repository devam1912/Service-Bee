import express from "express";
import { adminLogin } from "../controllers/adminController.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";
import Company from "../models/companyModel.js";
import User from "../models/userModel.js";
import Request from "../models/requestModel.js";
import Subscription from "../models/subscriptionModel.js";

const router = express.Router();

router.post("/login", adminLogin);

router.get("/stats", protectAdmin, async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const companyCount = await Company.countDocuments({ isVerified: true });
    const pendingCount = await Company.countDocuments({ isVerified: false });

    // Profit Calculation Logic: Sum of all request prices * platform fee (e.g. 10%)
    const requests = await Request.find({ status: "completed" });
    const totalRequestRevenue = requests.reduce((sum, req) => sum + (req.price || 0), 0);
    const platformCommission = totalRequestRevenue * 0.10; // 10% commission

    // Subscription Revenue (100% Admin Profit)
    const activeSubscriptions = await Subscription.find({ status: "paid" });
    const totalSubscriptionRevenue = activeSubscriptions.reduce((sum, s) => sum + (s.amount || 0), 0);

    const totalProfit = platformCommission + totalSubscriptionRevenue;

    res.json({
      users: userCount,
      companies: companyCount,
      pending: pendingCount,
      profit: totalProfit.toFixed(2),
      revenue: (totalRequestRevenue + totalSubscriptionRevenue).toFixed(2),
      subscriptionEarnings: totalSubscriptionRevenue.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

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

router.delete("/users/:id", protectAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

router.delete("/companies/:id", protectAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }
    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: "Company removed" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete company" });
  }
});

export default router;
