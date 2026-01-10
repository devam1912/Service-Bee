import express from "express";
import {
  createRequest,
  getCompanyRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  upload.array("attachments", 3),
  createRequest
);

router.get("/company", protect, getCompanyRequests);

router.patch("/:requestId/status", protect, updateRequestStatus);

export default router;
