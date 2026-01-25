import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentValidators.js";
import { strictLimiter } from "../middleware/securityMiddleware.js";

const router = express.Router();

router.post("/create-order", strictLimiter, protect, validate(createOrderSchema), createOrder);
router.post("/verify", strictLimiter, protect, validate(verifyPaymentSchema), verifyPayment);

export default router;
