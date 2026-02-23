// Backend/socket/index.js
import { socketAuth } from "./auth.js";
import GlobalMessage from "../models/globalMessageModel.js";
import PrivateMessage from "../models/privateMessageModel.js";

export default function initSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🟢 backend socket connected:", socket.id);

    socket.on("join:global", () => {
      socket.join("global");
    });

    socket.on("sendGlobalMessage", async ({ text }) => {
      const msg = await GlobalMessage.create({
        senderId: socket.actor?.id,
        senderType: socket.actor?.type,
        text: text.trim(),
        status: "visible",
      });

      const populatedMsg = await GlobalMessage.findById(msg._id).populate("senderId", "name");
      io.to("global").emit("global:newMessage", populatedMsg);
    });

    // --- Private Chat ---
    socket.on("join:private", ({ partnerId }) => {
      const roomId = [socket.actor.id, partnerId].sort().join("-");
      socket.join(roomId);
      console.log(`👤 actor ${socket.actor.id} joined private room: ${roomId}`);
    });

    socket.on("sendPrivateMessage", async ({ receiverId, receiverType, text }) => {
      if (!text || !receiverId) return;

      const msg = await PrivateMessage.create({
        senderId: socket.actor.id,
        senderType: socket.actor.type,
        receiverId,
        receiverType,
        text: text.trim()
      });

      const roomId = [socket.actor.id, receiverId].sort().join("-");
      io.to(roomId).emit("private:newMessage", msg);
    });

    socket.on("join:request", ({ requestId }) => {
      socket.join(`request:${requestId}`);
      console.log(`📡 actor ${socket.actor.id} joined request room: request:${requestId}`);
    });

    socket.on("disconnect", () => {
      console.log("🔴 socket disconnected:", socket.id);
    });
  });
}

