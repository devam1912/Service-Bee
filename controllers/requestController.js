import Company from "../models/companyModel.js";
import Request from "../models/requestModel.js";
import cloudinary from "../config/cloudinary.js";
import { SPOOKY_STATUS } from "../constants/spookyStatus.js";

/**
 * 👻 CREATE REQUEST (User)
 */
export const createRequest = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "👻 Only mortals (users) can summon service requests",
      });
    }

    // 🔐 Multer-safe body fallback
    const body = req.body || {};
    const { companyId, serviceName, userNote, bookingDate } = body;

    if (!companyId || !serviceName?.trim() || !bookingDate) {
      return res.status(400).json({
        message: "📅 Company, service and booking date are required",
      });
    }

    // 🏢 Fetch company
    let company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({
        message: "🪦 The chosen company spirit was not found",
      });
    }

    // 🧠 Auto-heal old companies (no workingDays)
    if (!company.workingDays || company.workingDays.length === 0) {
      company.workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      company.dailySlotCapacity = company.dailySlotCapacity || 5;
      await company.save();
    }

    // 📆 Working day check
    const day = new Date(bookingDate).toLocaleDateString("en-US", { weekday: "short" });
    if (!company.workingDays.includes(day)) {
      return res.status(400).json({
        message: `❌ This spirit does not operate on ${day}`,
      });
    }

    // 🔐 Slot capacity check
    const bookedCount = await Request.countDocuments({
      company: companyId,
      bookingDate: new Date(bookingDate),
      status: { $in: ["pending", "accepted"] },
    });

    if (bookedCount >= company.dailySlotCapacity) {
      return res.status(400).json({
        message: "🚫 All slots for this date are already haunted",
      });
    }

    // 👀 Prevent duplicate active requests
    const existingRequest = await Request.findOne({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "👀 A similar haunting request already exists",
      });
    }

    // 📎 Attachments
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

    // ⏳ Auto-expiry (30 mins)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const request = await Request.create({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      userNote: userNote?.trim(),
      bookingDate,
      attachments,
      expiresAt,
    });

    res.status(201).json({
      message: "👻 Your haunted slot has been successfully summoned",
      request,
      spookyStatus: SPOOKY_STATUS.pending,
    });
  } catch (error) {
    console.error("CREATE REQUEST ERROR:", error);
    res.status(500).json({
      message: "🕯️ Something dark went wrong on the server",
    });
  }
};



/**
 * 🧛 GET COMPANY REQUESTS (Company)
 */
export const getCompanyRequests = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "🧛 Only service providers can view these hauntings",
      });
    }

    const requests = await Request.find({ company: req.user._id })
      .populate("user", "name email mobile city")
      .sort({ createdAt: -1 });

    const spookyRequests = requests.map((r) => ({
      ...r.toObject(),
      spookyStatus: SPOOKY_STATUS[r.status],
    }));

    res.status(200).json({
      message: "🔮 All active hauntings have been revealed",
      requests: spookyRequests,
    });
  } catch (error) {
    res.status(500).json({
      message: "🕯️ Failed to summon company requests",
    });
  }
};

/**
 * 🪦 UPDATE REQUEST STATUS (Company)
 */
export const updateRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "🧛 Only companies can alter the fate of a request",
      });
    }

    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        message: "🕯️ Invalid ritual (status) attempted",
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        message: "🪦 This request spirit no longer exists",
      });
    }

    if (request.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "⛔ You are not bound to this request",
      });
    }

    if (["completed", "rejected"].includes(request.status)) {
      return res.status(400).json({
        message: "🪦 This request has already been sealed",
      });
    }

    if (status === "completed" && request.status !== "accepted") {
      return res.status(400).json({
        message: "⚠️ Only possessed requests can be exorcised",
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `🧙 Request has been ${status}`,
      request,
      spookyStatus: SPOOKY_STATUS[request.status],
    });
  } catch (error) {
    res.status(500).json({
      message: "🕯️ Dark forces interrupted the ritual",
    });
  }
};
