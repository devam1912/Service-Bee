// Backend/socket/index.js
import { socketAuth } from "./auth.js";
import GlobalMessage from "../models/globalMessageModel.js";

export default function initSocket(io) {
  // 🔴 THIS WAS MISSING
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log("🟢 backend socket connected:", socket.id);
    console.log("actor:", socket.actor);

    socket.on("join:global", () => {
      console.log("📥 join:global received from", socket.id);
      socket.join("global");
    });

    socket.on("sendGlobalMessage", async ({ text }) => {
      console.log("📥 sendGlobalMessage:", text);

      const msg = await GlobalMessage.create({
        senderId: socket.actor?.id || "public",
        senderType: socket.actor?.type || "Public",
        text: text.trim(),
        status: "visible",
      });


      const populatedMsg = await GlobalMessage.findById(msg._id).populate("senderId", "name");
      io.to("global").emit("global:newMessage", populatedMsg);
    });
  });
}
