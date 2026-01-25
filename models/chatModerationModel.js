import mongoose from "mongoose";

const chatModerationSchema = new mongoose.Schema(
  {
    bannedWords: { type: [String], default: ["madarchod", "bhosdike", "chutiya", "randi"] },

    // muted users cannot send messages for a period
    muted: [
      {
        actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
        actorType: { type: String, enum: ["User", "Company"], required: true },
        until: { type: Date, required: true },
        reason: { type: String, default: "" },
      },
    ],

    // banned users cannot use global chat at all
    banned: [
      {
        actorId: { type: mongoose.Schema.Types.ObjectId, required: true },
        actorType: { type: String, enum: ["User", "Company"], required: true },
        reason: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("ChatModeration", chatModerationSchema);
