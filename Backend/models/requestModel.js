import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema({
     user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true
    },
    serviceName: {
        type: String,
        required: true
    },
    requestDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ["pending", "accepted", "rejected", "completed"],
        default: "pending"
    },
    userNote: {
        type: String
    }
},{timestamps:true})

const Request = mongoose.model("Request", serviceRequestSchema);
export default Request