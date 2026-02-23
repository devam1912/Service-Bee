import Message from "../models/messageModel.js";
import PrivateMessage from "../models/privateMessageModel.js";
import Request from "../models/requestModel.js";
import { getIO } from "../socket/socket.js";

export const sendRequestMessage = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { text, type, offerAmount } = req.body;
        const senderId = req.user._id;
        const senderType = req.user.role === "company" ? "Company" : "User";

        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });

        // RESTRICTION: Chat only before completion or rejection
        if (request.status === "completed" || request.status === "rejected") {
            const statusMsg = request.status === "completed"
                ? "🕯️ The ritual is complete; the spirits have departed. No further messages can be cast."
                : "🚫 This request has been rejected. The communication line is closed.";
            return res.status(400).json({ message: statusMsg });
        }

        const newMessage = await Message.create({
            request: requestId,
            senderId,
            senderType,
            text,
            type: type || "text",
            offerAmount
        });

        // Real-time broadcast
        const io = getIO();
        io.to(`request:${requestId}`).emit("new_private_message", newMessage);

        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: "Failed to send message" });
    }
};

export const getRequestMessages = async (req, res) => {
    try {
        const { requestId } = req.params;
        const messages = await Message.find({ request: requestId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch messages" });
    }
};

export const getPrivateMessages = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const myId = req.user._id;

        const messages = await PrivateMessage.find({
            $or: [
                { senderId: myId, receiverId: partnerId },
                { senderId: partnerId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch private messages" });
    }
};
