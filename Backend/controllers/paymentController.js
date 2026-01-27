import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Request from "../models/requestModel.js";
import { getIO } from "../socket/socket.js"; // ✅ FIX

/**
 * Lazy-init Razorpay so server doesn't crash on startup
 */
const getRazorpay = () => {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error("Razorpay keys missing");
  }

  return new Razorpay({ key_id, key_secret });
};

// POST /api/payments/create-order
export const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpay();
    const { requestId } = req.body;

    const request = await Request.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (String(request.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    if (request.paymentStatus === "paid") {
      return res.status(400).json({ message: "Already paid" });
    }

    const amount = request.amount || 199;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${requestId}_${Date.now()}`,
    });

    await Payment.create({
      requestId: request._id,
      userId: request.user,
      companyId: request.company,
      orderId: order.id,
      amount,
      currency: "INR",
      status: "created",
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/verify
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (String(payment.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const body = `${orderId}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();
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

    // ✅ REALTIME UPDATE
    const io = getIO();
    io.to(`request:${payment.requestId}`).emit("payment:confirmed", {
      requestId: payment.requestId,
    });

    res.json({ message: "Payment verified, booking confirmed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
