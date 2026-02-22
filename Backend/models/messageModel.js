import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Request",
      required: true,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    senderType: {
      type: String,
      enum: ["User", "Company"],
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["text", "offer"],
      default: "text"
    },
    offerAmount: Number,

    readBy: [
      {
        senderId: mongoose.Schema.Types.ObjectId,
        senderType: {
          type: String,
          enum: ["User", "Company"],
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
