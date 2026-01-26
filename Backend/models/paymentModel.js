import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "Request", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true, index: true },

    provider: { type: String, enum: ["razorpay"], default: "razorpay" },

    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String },
    signature: { type: String },

    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },

    status: { type: String, enum: ["created", "paid", "failed", "refunded"], default: "created", index: true },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
