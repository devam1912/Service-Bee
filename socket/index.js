import { socketAuth } from "./auth.js";
import Request from "../models/requestModel.js";
import Message from "../models/messageModel.js";

export default function initSocket(io) {
    io.use(socketAuth);

    io.on("connection", (socket) => {

        socket.on("joinRequest", async (requestId) => {
            const request = await Request.findById(requestId);
            if (!request) return;

            if (request.status === "completed") return;

            const isUser =
                socket.actor.type === "User" &&
                request.user.toString() === socket.actor.id.toString();

            const isCompany =
                socket.actor.type === "Company" &&
                request.company.toString() === socket.actor.id.toString();

            if (!isUser && !isCompany) return;

            socket.join(requestId);
        });

        socket.on("sendMessage", async ({ requestId, text }) => {
            if (!text?.trim()) return;

            const request = await Request.findById(requestId);
            if (!request) return;

            if (request.status === "completed") return;
            const isUser =
                socket.actor.type === "User" &&
                request.user.toString() === socket.actor.id.toString();

            const isCompany =
                socket.actor.type === "Company" &&
                request.company.toString() === socket.actor.id.toString();

            if (!isUser && !isCompany) return;

            const message = await Message.create({
                request: requestId,
                senderId: socket.actor.id,
                senderType: socket.actor.type,
                text: text.trim(),
                readBy: [
                    {
                        senderId: socket.actor.id,
                        senderType: socket.actor.type,
                    },
                ],
            });

            io.to(requestId).emit("newMessage", message);
        });
    });
}
