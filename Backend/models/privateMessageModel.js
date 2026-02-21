import mongoose from "mongoose";

const privateMessageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'senderType'
    },
    senderType: {
        type: String,
        required: true,
        enum: ['User', 'Company']
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'receiverType'
    },
    receiverType: {
        type: String,
        required: true,
        enum: ['User', 'Company']
    },
    text: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['sent', 'delivered', 'read'],
        default: 'sent'
    },
    attachments: [{
        url: String,
        type: { type: String, enum: ["image", "video"], default: "image" },
        _id: false
    }]
}, { timestamps: true });

export default mongoose.model("PrivateMessage", privateMessageSchema);
