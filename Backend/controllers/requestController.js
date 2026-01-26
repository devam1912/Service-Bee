import Company from "../models/companyModel.js";
import Request from "../models/requestModel.js";
import cloudinary from "../config/cloudinary.js";
import { SPOOKY_STATUS } from "../constants/spookyStatus.js";
import { io } from "../index.js";

const calculateTrustScore = async (companyId) => {
  const completed = await Request.countDocuments({ company: companyId, status: "completed" });
  const rejected = await Request.countDocuments({ company: companyId, status: "rejected" });

  const company = await Company.findById(companyId);
  if (!company) return;

  const score = Math.max(company.rating * 20 + completed - rejected * 5, 0);
  company.trustScore = score;
  await company.save();
};

export const createRequest = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({ message: "👻 Only mortals (users) can summon service requests" });
    }

    // ✅ TERMS ENFORCEMENT
    if (!req.user.termsAccepted) {
      return res.status(403).json({ message: "Please accept Terms & Conditions first." });
    }

    const body = req.body || {};
    const { companyId, serviceName, userNote, bookingDate } = body;

    if (!companyId || !serviceName?.trim() || !bookingDate) {
      return res.status(400).json({ message: "📅 Company, service and booking date are required" });
    }

    let company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "🪦 The chosen company spirit was not found" });
    }

    if (!company.workingDays || company.workingDays.length === 0) {
      company.workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      company.dailySlotCapacity = company.dailySlotCapacity || 5;
      await company.save();
    }

    const day = new Date(bookingDate).toLocaleDateString("en-US", { weekday: "short" });
    if (!company.workingDays.includes(day)) {
      return res.status(400).json({ message: `❌ This spirit does not operate on ${day}` });
    }

    const bookedCount = await Request.countDocuments({
      company: companyId,
      bookingDate: new Date(bookingDate),
      status: { $in: ["pending", "accepted"] },
    });

    if (bookedCount >= company.dailySlotCapacity) {
      return res.status(400).json({ message: "🚫 All slots for this date are already haunted" });
    }

    const existingRequest = await Request.findOne({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({ message: "👀 A similar haunting request already exists" });
    }

    let attachments = [];
    if (Array.isArray(req.files) && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "service-bee/requests" }
        );
        attachments.push({ url: result.secure_url, type: "image" });
      }
    }

    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const request = await Request.create({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      userNote: userNote?.trim(),
      bookingDate,
      attachments,
      expiresAt,

      paymentStatus: "pending",
      isConfirmed: false,
    });

    res.status(201).json({
      message: "👻 Your haunted slot has been successfully summoned",
      request,
      spookyStatus: SPOOKY_STATUS.pending,
    });
  } catch (error) {
    res.status(500).json({ message: "🕯️ Something dark went wrong on the server" });
  }
};

export const getCompanyRequests = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "🧛 Only service providers can view these hauntings" });
    }

    const requests = await Request.find({ company: req.user._id })
      .populate("user", "name email mobile city")
      .sort({ createdAt: -1 });

    const spookyRequests = requests.map((r) => ({
      ...r.toObject(),
      spookyStatus: SPOOKY_STATUS[r.status],
    }));

    res.status(200).json({ message: "🔮 All active hauntings have been revealed", requests: spookyRequests });
  } catch {
    res.status(500).json({ message: "🕯️ Failed to summon company requests" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "🧛 Only companies can alter the fate of a request" });
    }

    const { requestId } = req.params;
    const { status: newStatus } = req.body;

    if (!["accepted", "rejected", "completed"].includes(newStatus)) {
      return res.status(400).json({ message: "🕯️ Invalid ritual (status) attempted" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "🪦 This request spirit no longer exists" });
    }

    if (request.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "⛔ You are not bound to this request" });
    }

    if (["completed", "rejected"].includes(request.status)) {
      return res.status(400).json({ message: "🪦 This request has already been sealed" });
    }

    const allowedTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["completed"],
    };

    if (!allowedTransitions[request.status]?.includes(newStatus)) {
      return res.status(400).json({ message: "🕯️ Invalid status transition" });
    }

    // ✅ PAYMENT GATE
    if (newStatus === "accepted") {
      if (request.paymentStatus !== "paid" || request.isConfirmed !== true) {
        return res.status(400).json({
          message: "Booking not confirmed. Payment pending.",
        });
      }
    }

    request.status = newStatus;
    await request.save();

    if (["completed", "rejected"].includes(newStatus)) {
      await calculateTrustScore(request.company);
    }

    const payload = {
      requestId: request._id,
      status: request.status,
      spookyStatus: SPOOKY_STATUS[request.status],
      paymentStatus: request.paymentStatus,
      isConfirmed: request.isConfirmed,
    };

    io.to(`request:${request._id}`).emit("request:statusUpdated", payload);
    io.to(`user:${request.user}`).emit("request:statusUpdated", payload);
    io.to(`company:${request.company}`).emit("request:statusUpdated", payload);

    res.status(200).json({
      message: `🧙 Request has been ${newStatus}`,
      request,
      spookyStatus: SPOOKY_STATUS[request.status],
    });
  } catch {
    res.status(500).json({ message: "🕯️ Dark forces interrupted the ritual" });
  }
};
