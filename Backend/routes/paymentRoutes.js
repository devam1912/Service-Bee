import express from "express";
import {
    createOrder,
    verifyPayment,
    createPremiumOrder,
    verifyPremiumPayment,
    createUserSubscriptionOrder,
    verifyUserSubscription
} from "../controllers/paymentController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { createOrderSchema, verifyPaymentSchema } from "../validators/paymentValidators.js";
import { strictLimiter } from "../middleware/securityMiddleware.js";

const router = express.Router();

// Booking payments
router.post("/create-order", strictLimiter, protect, validate(createOrderSchema), createOrder);
router.post("/verify", strictLimiter, protect, validate(verifyPaymentSchema), verifyPayment);

// Premium Subscription payments (Company)
router.post("/premium/create-order", strictLimiter, protect, createPremiumOrder);
router.post("/premium/verify", strictLimiter, protect, verifyPremiumPayment);

// Premium Subscription payments (User)
router.post("/user/premium/create-order", strictLimiter, protect, createUserSubscriptionOrder);
router.post("/user/premium/verify", strictLimiter, protect, verifyUserSubscription);

export default router;
