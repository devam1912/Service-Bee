import express from "express";
import { getGlobalMessages, reportGlobalMessage } from "../controllers/globalChatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/messages", protect, getGlobalMessages);
router.post("/report", protect, reportGlobalMessage);

export default router;
