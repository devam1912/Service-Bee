import PrivateMessage from "../models/privateMessageModel.js";

export const getPrivateMessages = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const userId = req.user._id;

        const messages = await PrivateMessage.find({
            $or: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        return res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("GET PRIVATE MESSAGES ERROR:", error);
        return res.status(500).json({ message: "Failed to fetch messages" });
    }
};
