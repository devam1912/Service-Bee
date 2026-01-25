import express from "express";
import { getGlobalMessages, reportGlobalMessage } from "../controllers/globalChatController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { reportMessageSchema } from "../validators/globalChatValidators.js";
import { strictLimiter } from "../middleware/securityMiddleware.js";

const router = express.Router();

router.get("/messages", strictLimiter, protect, getGlobalMessages);
router.post("/report", strictLimiter, protect, validate(reportMessageSchema), reportGlobalMessage);

export default router;
