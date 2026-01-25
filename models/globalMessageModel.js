import mongoose from "mongoose";

const globalMessageSchema = new mongoose.Schema(
  {
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    senderType: { type: String, enum: ["User", "Company"], required: true },
    text: { type: String, required: true, trim: true },

    status: { type: String, enum: ["visible", "hidden"], default: "visible", index: true },
    moderationReason: { type: String, default: "" },

    reportsCount: { type: Number, default: 0, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("GlobalMessage", globalMessageSchema);
