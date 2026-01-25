import { socketAuth } from "./auth.js";
import Request from "../models/requestModel.js";
import Message from "../models/messageModel.js";

export default function initSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    /**
     * Dashboard rooms (for realtime booking/payment updates)
     * Frontend will call these right after socket connects.
     */
    socket.on("join:user", (userId) => {
      if (socket.actor.type !== "User") return;
      if (socket.actor.id.toString() !== userId.toString()) return;
      socket.join(`user:${userId}`);
    });

    socket.on("join:company", (companyId) => {
      if (socket.actor.type !== "Company") return;
      if (socket.actor.id.toString() !== companyId.toString()) return;
      socket.join(`company:${companyId}`);
    });

    /**
     * Request room (for request/payment realtime updates + chat)
     * Only allows join if the actor is bound to that request.
     */
    socket.on("join:request", async (requestId) => {
      const request = await Request.findById(requestId);
      if (!request) return;

      // if request is completed, we don't allow joining chat/updates room
      if (request.status === "completed") return;

      const isUser =
        socket.actor.type === "User" &&
        request.user.toString() === socket.actor.id.toString();

      const isCompany =
        socket.actor.type === "Company" &&
        request.company.toString() === socket.actor.id.toString();

      if (!isUser && !isCompany) return;

      socket.join(`request:${requestId}`);
    });

    /**
     * Backward compatible: your existing event name
     * Joins the same room as join:request (but old room name was just requestId)
     */
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

      // join new standard room
      socket.join(`request:${requestId}`);

      // optionally also join legacy room so old frontend still works
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

      // Emit to the new standard room
      io.to(`request:${requestId}`).emit("newMessage", message);

      // Emit to legacy room too (safe)
      io.to(requestId).emit("newMessage", message);
    });
  });
}
