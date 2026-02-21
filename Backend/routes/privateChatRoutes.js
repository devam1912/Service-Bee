import express from "express";
import { getPrivateMessages } from "../controllers/privateChatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:partnerId", protect, getPrivateMessages);

export default router;
