import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name:
  {
    type: String,
    required: true,
    trim: true
  },
  email:
  {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password:
  {
    type: String,
    required: true
  },
  mobile:
  {
    type: String,
    required: true
  },
  description:
    String,
  serviceCategory: { type: String, required: true },
  services: [String],
  city:
    { type: String, required: true },

  workingDays: {
    type: [String],
    enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    default: ["Mon", "Tue", "Wed", "Thu", "Fri"]
  },
  dailySlotCapacity: {
    type: Number,
    default: 5,
    min: 1
  },
  termsAccepted: {
    type: Boolean,
    default: false
  },
  termsAcceptedAt: {
    type: Date,
    default: null
  },
  trustScore: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  role: { type: String, enum: ["company"], default: "company" },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const Company = mongoose.models.Company || mongoose.model("Company", companySchema);
export default Company;
