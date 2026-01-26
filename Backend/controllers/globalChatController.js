import GlobalMessage from "../models/globalMessageModel.js";
import ChatModeration from "../models/chatModerationModel.js";

const getModerationDoc = async () => {
  let doc = await ChatModeration.findOne();
  if (!doc) doc = await ChatModeration.create({});
  return doc;
};

// GET /api/global-chat/messages?limit=50
export const getGlobalMessages = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "50", 10), 200);

    const messages = await GlobalMessage.find({ status: "visible" })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({ messages: messages.reverse() });
  } catch {
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// POST /api/global-chat/report
export const reportGlobalMessage = async (req, res) => {
  try {
    const { messageId, reason } = req.body;
    if (!messageId) return res.status(400).json({ message: "messageId is required" });

    const msg = await GlobalMessage.findById(messageId);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    msg.reportsCount = (msg.reportsCount || 0) + 1;
    await msg.save();

    res.json({ message: "Reported", reportsCount: msg.reportsCount });
  } catch {
    res.status(500).json({ message: "Failed to report message" });
  }
};

// ========== ADMIN ==========

// GET /api/admin/global-chat/reports?min=3
export const getReportedMessages = async (req, res) => {
  try {
    const min = Math.max(parseInt(req.query.min || "3", 10), 1);

    const messages = await GlobalMessage.find({ reportsCount: { $gte: min } })
      .sort({ reportsCount: -1, createdAt: -1 })
      .limit(200);

    res.json({ messages });
  } catch {
    res.status(500).json({ message: "Failed to fetch reports" });
  }
};

// PATCH /api/admin/global-chat/hide
export const hideMessage = async (req, res) => {
  try {
    const { messageId, reason } = req.body;
    if (!messageId) return res.status(400).json({ message: "messageId is required" });

    const msg = await GlobalMessage.findByIdAndUpdate(
      messageId,
      { status: "hidden", moderationReason: reason || "hidden by admin" },
      { new: true }
    );

    if (!msg) return res.status(404).json({ message: "Message not found" });

    res.json({ message: "Message hidden", msg });
  } catch {
    res.status(500).json({ message: "Failed to hide message" });
  }
};

// PATCH /api/admin/global-chat/mute
export const muteActor = async (req, res) => {
  try {
    const { actorId, actorType, minutes, reason } = req.body;
    if (!actorId || !actorType || !minutes) {
      return res.status(400).json({ message: "actorId, actorType, minutes are required" });
    }

    const until = new Date(Date.now() + Number(minutes) * 60 * 1000);
    const doc = await getModerationDoc();

    // remove old mute if exists
    doc.muted = (doc.muted || []).filter(
      (m) => !(m.actorType === actorType && m.actorId.toString() === actorId.toString())
    );

    doc.muted.push({ actorId, actorType, until, reason: reason || "" });
    await doc.save();

    res.json({ message: "Muted", until });
  } catch {
    res.status(500).json({ message: "Failed to mute" });
  }
};

// PATCH /api/admin/global-chat/ban
export const banActor = async (req, res) => {
  try {
    const { actorId, actorType, reason } = req.body;
    if (!actorId || !actorType) {
      return res.status(400).json({ message: "actorId and actorType are required" });
    }

    const doc = await getModerationDoc();

    const already = (doc.banned || []).some(
      (b) => b.actorType === actorType && b.actorId.toString() === actorId.toString()
    );
    if (!already) {
      doc.banned.push({ actorId, actorType, reason: reason || "" });
    }

    await doc.save();
    res.json({ message: "Banned" });
  } catch {
    res.status(500).json({ message: "Failed to ban" });
  }
};

// PATCH /api/admin/global-chat/banned-words
export const updateBannedWords = async (req, res) => {
  try {
    const { words } = req.body;
    if (!Array.isArray(words)) return res.status(400).json({ message: "words must be an array" });

    const cleaned = words
      .map((w) => String(w || "").trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 500);

    const doc = await getModerationDoc();
    doc.bannedWords = cleaned;
    await doc.save();

    res.json({ message: "Updated banned words", count: cleaned.length });
  } catch {
    res.status(500).json({ message: "Failed to update banned words" });
  }
};
