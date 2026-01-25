import { z } from "zod";

export const createOrderSchema = z.object({
  requestId: z.string().min(10, "requestId required"),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().min(5, "orderId required"),
  razorpay_payment_id: z.string().min(5, "payment id required"),
  razorpay_signature: z.string().min(5, "signature required"),
});
