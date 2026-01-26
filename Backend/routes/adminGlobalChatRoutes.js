import express from "express";
import {
  getReportedMessages,
  hideMessage,
  muteActor,
  banActor,
  updateBannedWords,
} from "../controllers/globalChatController.js";
import { protectAdmin } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/reports", protectAdmin, getReportedMessages);
router.patch("/hide", protectAdmin, hideMessage);
router.patch("/mute", protectAdmin, muteActor);
router.patch("/ban", protectAdmin, banActor);
router.patch("/banned-words", protectAdmin, updateBannedWords);

export default router;
