import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
    {
        subscriberId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'subscriberType', index: true },
        subscriberType: { type: String, enum: ["Company", "User"], required: true },
        orderId: { type: String, required: true, unique: true, index: true },
        paymentId: { type: String },
        signature: { type: String },
        amount: { type: Number, required: true },
        plan: { type: String, enum: ["monthly", "semi-annual", "yearly"], required: true },
        durationDays: { type: Number, required: true },
        status: { type: String, enum: ["created", "paid", "failed"], default: "created", index: true },
    },
    { timestamps: true }
);

const Subscription = mongoose.models.Subscription || mongoose.model("Subscription", subscriptionSchema);
export default Subscription;
