import express from "express";
import { createReview, getCompanyReviews } from "../controllers/reviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createReview);
router.get("/company/:companyId", getCompanyReviews);

export default router;