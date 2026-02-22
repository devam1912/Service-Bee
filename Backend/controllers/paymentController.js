import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/paymentModel.js";
import Request from "../models/requestModel.js";
import Subscription from "../models/subscriptionModel.js";
import Company from "../models/companyModel.js";
import User from "../models/userModel.js";
import { getIO } from "../socket/socket.js";

/**
 * Lazy-init Razorpay
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

    const baseAmount = request.amount || 199;
    const userFee = baseAmount * 0.05;
    const totalCharged = baseAmount + userFee;

    const order = await razorpay.orders.create({
      amount: Math.round(totalCharged * 100),
      currency: "INR",
      receipt: `req_${String(requestId).slice(-10)}_${Date.now()}`,
    });

    await Payment.create({
      requestId: request._id,
      userId: request.user,
      companyId: request.company,
      orderId: order.id,
      amount: baseAmount,
      totalCharged: totalCharged,
      commissionBee: baseAmount * 0.10,
      currency: "INR",
      status: "created",
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      baseAmount,
      userFee
    });
  } catch (err) {
    console.error("[RAZORPAY ORDER ERROR]", err);
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

    const io = getIO();
    io.to(`request:${payment.requestId}`).emit("payment:confirmed", {
      requestId: payment.requestId,
    });

    res.json({ message: "Payment verified, booking confirmed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * PREMIUM SUBSCRIPTION LOGIC
 */

// POST /api/payments/premium/create-order
export const createPremiumOrder = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only providers can subscribe to premium" });
    }

    if (!req.user.isVerified) {
      return res.status(403).json({ message: "You must be verified by the admin to subscribe to premium" });
    }

    const razorpay = getRazorpay();
    const { plan } = req.body; // monthly, semi-annual, yearly

    let amount = 0;
    let durationDays = 0;

    if (plan === "monthly") {
      amount = 2000;
      durationDays = 30;
    } else if (plan === "semi-annual") {
      amount = 10000;
      durationDays = 180;
    } else if (plan === "yearly") {
      amount = 20000;
      durationDays = 365;
    } else {
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `pre_${String(req.user._id).slice(-10)}_${Date.now()}`,
    });

    await Subscription.create({
      subscriberId: req.user._id,
      subscriberType: "Company",
      orderId: order.id,
      amount,
      plan,
      durationDays,
      status: "created",
    });

    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan
    });
  } catch (err) {
    console.error("[RAZORPAY ERROR]", err);
    res.status(500).json({ message: `Hive payment system failure: ${err.message}` });
  }
};

// POST /api/payments/premium/verify
export const verifyPremiumPayment = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;

    const subscription = await Subscription.findOne({ orderId });
    if (!subscription) return res.status(404).json({ message: "Subscription record not found" });

    if (String(subscription.subscriberId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const body = `${orderId}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      subscription.status = "failed";
      await subscription.save();
      return res.status(400).json({ message: "Signature verification failed" });
    }

    // Success
    subscription.status = "paid";
    subscription.paymentId = razorpay_payment_id;
    subscription.signature = razorpay_signature;
    await subscription.save();

    // Update Company Premium Status
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + subscription.durationDays);

    await Company.findByIdAndUpdate(subscription.subscriberId, {
      isPremium: true,
      premiumExpiresAt: expirationDate
    });

    res.json({ message: "Premium subscription activated successfully!", expiresAt: expirationDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// --- USER SUBSCRIPTIONS ---

export const createUserSubscriptionOrder = async (req, res) => {
  try {
    console.log("[USER PREM] Initiation started for user:", req.user?._id, "Plan:", req.body?.plan);
    const razorpay = getRazorpay();
    const { plan } = req.body;
    let amount = 0;
    let durationDays = 0;

    if (plan === "monthly") {
      amount = 500;
      durationDays = 30;
    } else if (plan === "semi-annual") {
      amount = 2500;
      durationDays = 180;
    } else if (plan === "yearly") {
      amount = 4000;
      durationDays = 365;
    } else {
      console.log("[USER PREM] Invalid plan received:", plan);
      return res.status(400).json({ message: "Invalid subscription plan" });
    }

    console.log("[USER PREM] Creating Razorpay order...");
    const orderData = {
      amount: amount * 100,
      currency: "INR",
      receipt: `usr_pre_${String(req.user._id).slice(-10)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(orderData);
    console.log("[USER PREM] Order created:", order.id);

    console.log("[USER PREM] Creating Subscription record...");
    await Subscription.create({
      subscriberId: req.user._id,
      subscriberType: "User",
      orderId: order.id,
      amount,
      plan,
      durationDays,
      status: "created",
    });

    console.log("[USER PREM] Success response sending...");
    res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan
    });
  } catch (err) {
    console.error("[USER PREM ERROR]", err);
    res.status(500).json({ message: `Hive payment system failure: ${err.message}` });
  }
};

export const verifyUserSubscription = async (req, res) => {
  try {
    const { orderId, razorpay_payment_id, razorpay_signature } = req.body;

    const subscription = await Subscription.findOne({ orderId });
    if (!subscription || subscription.subscriberType !== "User") {
      return res.status(404).json({ message: "User subscription record not found" });
    }

    if (String(subscription.subscriberId) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const body = `${orderId}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== razorpay_signature) {
      subscription.status = "failed";
      await subscription.save();
      return res.status(400).json({ message: "Signature verification failed" });
    }

    subscription.status = "paid";
    subscription.paymentId = razorpay_payment_id;
    subscription.signature = razorpay_signature;
    await subscription.save();

    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + subscription.durationDays);

    await User.findByIdAndUpdate(subscription.subscriberId, {
      isPremium: true,
      premiumExpiresAt: expirationDate
    });

    res.json({ message: "User Emergency Access (Premium) activated successfully!", expiresAt: expirationDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

