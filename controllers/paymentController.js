import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Request from "../models/requestModel.js";

/**
 * Lazy-init Razorpay so the server doesn't crash on startup
 * if env variables are missing or dotenv loads later.
 */
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay keys missing: set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Backend/.env"
    );
  }

  return new Razorpay({ key_id, key_secret });
};

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();

    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: "requestId is required" });

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // ensure only owner can pay
    if (String(request.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // prevent double pay
    if (request.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    // pricing logic (replace later with real calculation)
    const amount = request.amount || 199;

    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `rcpt_${requestId}_${Date.now()}`,
    });

    await Payment.create({
      requestId: request._id,
      userId: request.userId,
      companyId: request.companyId,
      orderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    });

    return res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "orderId, razorpay_payment_id, and razorpay_signature are required",
      });
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Payment order not found" });

    // only that user can verify
    if (String(payment.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const body = `${orderId}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expected === razorpay_signature;

    if (!isValid) {
      payment.status = "failed";
      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      await payment.save();

      await Request.findByIdAndUpdate(payment.requestId, {
        paymentStatus: "failed",
        isConfirmed: false,
      });

      return res.status(400).json({ message: "Payment verification failed" });
    }

    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    await payment.save();

    await Request.findByIdAndUpdate(payment.requestId, {
      paymentStatus: "paid",
      isConfirmed: true,
    });

    return res.json({ message: "Payment verified, booking confirmed" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
