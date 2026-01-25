import { socketAuth } from "./auth.js";
import Request from "../models/requestModel.js";
import Message from "../models/messageModel.js";
import GlobalMessage from "../models/globalMessageModel.js";
import ChatModeration from "../models/chatModerationModel.js";
import User from "../models/UserModel.js";
import Company from "../models/companyModel.js";

const normalizeText = (s = "") =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const containsBannedWord = (text, bannedWords = []) => {
  const normalized = ` ${normalizeText(text)} `;
  return bannedWords.some((w) => {
    const ww = normalizeText(w);
    if (!ww) return false;
    return normalized.includes(` ${ww} `);
  });
};

const getModerationDoc = async () => {
  let doc = await ChatModeration.findOne();
  if (!doc) doc = await ChatModeration.create({});
  return doc;
};

const hasAcceptedTerms = async (actor) => {
  if (!actor?.id || !actor?.type) return false;

  if (actor.type === "User") {
    const u = await User.findById(actor.id).select("termsAccepted");
    return !!u?.termsAccepted;
  }

  if (actor.type === "Company") {
    const c = await Company.findById(actor.id).select("termsAccepted");
    return !!c?.termsAccepted;
  }

  return false;
};

// simple per-socket spam limiter: 5 messages per 10 seconds
const spamWindowMs = 10 * 1000;
const spamLimit = 5;

export default function initSocket(io) {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    socket._spam = { windowStart: Date.now(), count: 0 };

    const spamCheck = () => {
      const now = Date.now();
      if (now - socket._spam.windowStart > spamWindowMs) {
        socket._spam.windowStart = now;
        socket._spam.count = 0;
      }
      socket._spam.count += 1;
      return socket._spam.count <= spamLimit;
    };

    /**
     * Dashboard rooms (for realtime booking/payment updates)
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
     * Request room (private chat + request/payment realtime)
     */
    socket.on("join:request", async (requestId) => {
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

      socket.join(`request:${requestId}`);
    });

    /**
     * Backward compatible event name
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

      socket.join(`request:${requestId}`);
      socket.join(requestId);
    });

    /**
     * Private request message
     */
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

      io.to(`request:${requestId}`).emit("newMessage", message);
      io.to(requestId).emit("newMessage", message); // legacy
    });

    /**
     * ✅ GLOBAL COMMUNITY CHAT
     */
    socket.on("join:global", async () => {
      const ok = await hasAcceptedTerms(socket.actor);
      if (!ok) {
        socket.emit("global:error", { message: "Please accept Terms & Conditions first." });
        return;
      }
      socket.join("global");
    });

    socket.on("sendGlobalMessage", async ({ text }) => {
      try {
        if (!text?.trim()) return;

        // ✅ terms enforcement
        const ok = await hasAcceptedTerms(socket.actor);
        if (!ok) {
          socket.emit("global:error", { message: "Please accept Terms & Conditions first." });
          return;
        }

        // spam check
        if (!spamCheck()) {
          socket.emit("global:error", { message: "Slow down. Too many messages." });
          return;
        }

        const moderation = await getModerationDoc();

        // banned check
        const isBanned = moderation.banned?.some(
          (b) =>
            b.actorType === socket.actor.type &&
            b.actorId.toString() === socket.actor.id.toString()
        );
        if (isBanned) {
          socket.emit("global:error", { message: "You are banned from global chat." });
          return;
        }

        // muted check
        const now = new Date();
        const muteEntry = moderation.muted?.find(
          (m) =>
            m.actorType === socket.actor.type &&
            m.actorId.toString() === socket.actor.id.toString() &&
            new Date(m.until) > now
        );
        if (muteEntry) {
          socket.emit("global:error", {
            message: `You are muted until ${new Date(muteEntry.until).toLocaleString()}`,
          });
          return;
        }

        // abusive words check (block)
        const bannedWords = moderation.bannedWords || [];
        if (containsBannedWord(text, bannedWords)) {
          socket.emit("global:error", { message: "Message blocked due to abusive words." });
          return;
        }

        const msg = await GlobalMessage.create({
          senderId: socket.actor.id,
          senderType: socket.actor.type,
          text: text.trim(),
          status: "visible",
        });

        io.to("global").emit("global:newMessage", msg);
      } catch (err) {
        socket.emit("global:error", { message: "Global chat failed." });
      }
    });
  });
}
