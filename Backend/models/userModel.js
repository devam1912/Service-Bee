import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    termsAccepted: {
        type: Boolean,
        default: false
    },
    termsAcceptedAt: {
        type: Date,
        default: null
    },

    role: {
        type: String,
        enum: ["user"],
        default: "user"
    },
    otp: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // Premium Fields
    isPremium: { type: Boolean, default: false },
    premiumExpiresAt: { type: Date, default: null }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;



