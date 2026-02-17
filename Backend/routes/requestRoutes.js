import express from "express";
import {
  createRequest,
  getCompanyRequests,
  getUserRequests,
  updateRequestStatus,
} from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import { strictLimiter } from "../middleware/securityMiddleware.js";
import { validate } from "../middleware/validate.js";
import {
  createRequestSchema,
  updateRequestStatusSchema,
} from "../validators/requestValidators.js";

const router = express.Router();

router.post(
  "/",
  strictLimiter,
  protect,
  upload.array("attachments", 3),
  validate(createRequestSchema),
  createRequest
);

router.get("/", strictLimiter, protect, getUserRequests);

router.get("/company", strictLimiter, protect, getCompanyRequests);

router.patch(
  "/:requestId/status",
  strictLimiter,
  protect,
  validate(updateRequestStatusSchema),
  updateRequestStatus
);

export default router;
