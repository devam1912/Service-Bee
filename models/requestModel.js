import mongoose from "mongoose";

const requestSchema = new mongoose.Schema({
  user:
   { type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true },
  company:
   { type: mongoose.Schema.Types.ObjectId, ref: "Company",
     required: true },
  serviceName: 
  { type: String,
     required: true },

  bookingDate: 
  { type: Date,
     required: true ,
    default: Date.now}, //  slot date

  status: {
    type: String,
    enum: ["pending", "accepted", "rejected", "completed"],
    default: "pending"
  },

  expiresAt: { type: Date, 
     default: null 
  }, // auto-vanish

  userNote: String,

  attachments: [{
    url: String,
    type: { type: String, enum: ["image", "video"], default: "image" },
    _id: false
  }]
}, { timestamps: true });

requestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto delete

export default mongoose.model("Request", requestSchema);
