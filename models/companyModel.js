import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    serviceCategory: {
        type: String,
        required: true 
    },
    services: [{
        type: String 
    }],
    city: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    role: {
  type: String,
  enum: ["company"],
  default: "company"
},
isVerified: {
  type: Boolean,
  default: false,
}

}, { timestamps: true });

const Company = mongoose.model("Company", companySchema);
export default Company;
