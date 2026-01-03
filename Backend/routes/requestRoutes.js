import express from "express";
import { createRequest,  getCompanyRequests } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/", protect, createRequest);
router.get("/company", protect, getCompanyRequests);

export default router;
