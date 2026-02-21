import express from "express";
import { aiSearchServices } from "../controllers/aiController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/search", protect, aiSearchServices);

export default router;
