import express from "express";
import { acceptTerms, getTermsStatus } from "../controllers/termsController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", protect, getTermsStatus);
router.post("/accept", protect, acceptTerms);

export default router;
