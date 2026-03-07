import Company from "../models/companyModel.js";
import User from "../models/userModel.js";
import Request from "../models/requestModel.js";
import cloudinary from "../config/cloudinary.js";
import { SPOOKY_STATUS } from "../constants/spookyStatus.js";
import { getIO } from "../socket/socket.js";

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
      return res.status(403).json({ message: "Only users can create service requests" });
    }

    if (!req.user.termsAccepted) {
      return res.status(403).json({ message: "Please accept Terms & Conditions first." });
    }

    const body = req.body || {};
    const { companyId, serviceName, userNote, bookingDate, isCustom } = body;

    if (!companyId || !serviceName?.trim() || !bookingDate) {
      return res.status(400).json({ message: "Company, service and booking date are required" });
    }

    let company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "The chosen company was not found" });
    }

    if (!company.isActive) {
      return res.status(400).json({ message: "This provider is currently NOT active and not accepting new requests." });
    }

    let amount = 0;
    let negotiationStatus = "none";
    const customRequest = isCustom === "true" || isCustom === true;

    if (customRequest) {
      amount = 0;
      negotiationStatus = "pending";
    } else {
      const catalogItem = company.serviceCatalog?.find(s => s.name === serviceName);
      amount = catalogItem ? catalogItem.price : 199;
    }

    const requestedDateObj = new Date(bookingDate);
    const requestedDateStr = requestedDateObj.toISOString().split('T')[0];
    const todayStr = new Date().toISOString().split('T')[0];

    if (requestedDateStr < todayStr) {
      return res.status(400).json({ message: "Please choose a future date." });
    }

    let isArranged = false;
    let isUrgent = false;

    const buffer = new Date();
    buffer.setDate(buffer.getDate() + 2);
    const twoDaysLaterStr = buffer.toISOString().split('T')[0];

    if (requestedDateStr < twoDaysLaterStr) {
      if (!req.user.isPremium) {
        return res.status(400).json({
          message: "Standard bookings require at least 2 days of preparation. Upgrade to Premium for same-day or next-day services!"
        });
      }
      isUrgent = true;
    }

    const isHoliday = company.unavailableDates?.includes(requestedDateStr);

    if (isHoliday) {
      return res.status(400).json({ message: "The provider is on holiday for the selected date." });
    }

    if (!company.workingDays || company.workingDays.length === 0) {
      company.workingDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      company.dailySlotCapacity = company.dailySlotCapacity || 5;
      await company.save();
    }

    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[requestedDateObj.getDay()];
    const isWorkingDay = company.workingDays.includes(day);

    const startOfDay = new Date(requestedDateStr);
    const endOfDay = new Date(requestedDateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const bookedCount = await Request.countDocuments({
      company: companyId,
      bookingDate: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "accepted"] },
    });
    const isFull = bookedCount >= company.dailySlotCapacity;

    if (!isWorkingDay || isFull) {
      if (req.user.isPremium) {
        isArranged = true;
      } else {
        if (!isWorkingDay) return res.status(400).json({ message: `The provider does not operate on ${day}s.` });
        if (isFull) return res.status(400).json({ message: "All slots for this date are fully booked." });
      }
    }

    const existingRequest = await Request.findOne({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      status: { $in: ["pending", "accepted"] },
      paymentStatus: "paid"
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A similar request already exists." });
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

    const expiresAt = new Date(Date.now() + (req.user.isPremium ? 24 * 60 * 60 * 1000 : 2 * 60 * 60 * 1000));

    const request = await Request.create({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      userNote: userNote?.trim(),
      bookingDate,
      attachments,
      expiresAt,
      amount,
      isCustom: customRequest,
      negotiationStatus,
      paymentStatus: "pending",
      isConfirmed: false,
      isArranged,
      isUrgent
    });

    res.status(201).json({
      message: "Request created successfully",
      request,
      spookyStatus: SPOOKY_STATUS.pending,
    });
  } catch (error) {
    console.error("Booking Error:", error);
    res.status(500).json({ message: error.message || "Something went wrong on the server" });
  }
};

export const getCompanyRequests = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only service providers can view requests" });
    }

    const requests = await Request.find({ company: req.user._id })
      .populate("user", "name email mobile city")
      .sort({ createdAt: -1 });

    const spookyRequests = requests.map((r) => ({
      ...r.toObject(),
      spookyStatus: SPOOKY_STATUS[r.status],
    }));

    res.status(200).json({ message: "Requests retrieved successfully", requests: spookyRequests });
  } catch {
    res.status(500).json({ message: "Failed to retrieve company requests" });
  }
};

export const getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .populate("company", "name email mobile city serviceCategory rating")
      .sort({ createdAt: -1 });

    const spookyRequests = requests.map((r) => ({
      ...r.toObject(),
      spookyStatus: SPOOKY_STATUS[r.status],
    }));

    res.status(200).json({ message: "User requests retrieved successfully", requests: spookyRequests });
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve your requests" });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only companies can update request status" });
    }

    const { requestId } = req.params;
    const { status: newStatus } = req.body;

    if (!["accepted", "rejected", "completed"].includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status attempted" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to update this request" });
    }

    if (["completed", "rejected"].includes(request.status)) {
      return res.status(400).json({ message: "This request has already been finalized" });
    }

    const allowedTransitions = {
      pending: ["accepted", "rejected"],
      accepted: ["completed"],
    };

    if (!allowedTransitions[request.status]?.includes(newStatus)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    if (newStatus === "rejected") {
      const dbUser = await User.findById(request.user);
      if (dbUser?.isPremium) {
        const company = await Company.findById(request.company);
        if (company.premiumRejectionCount >= 3) {
          return res.status(400).json({ message: "You have reached the limit for rejecting premium requests (Max 3)." });
        }
        await Company.findByIdAndUpdate(request.company, { $inc: { premiumRejectionCount: 1 } });
      }
    }

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
    const io = getIO();

    io.to(`request:${request._id}`).emit("request:statusUpdated", payload);
    io.to(`user:${request.user}`).emit("request:statusUpdated", payload);
    io.to(`company:${request.company}`).emit("request:statusUpdated", payload);


    res.status(200).json({
      message: `Request has been ${newStatus}`,
      request,
      spookyStatus: SPOOKY_STATUS[request.status],
    });
  } catch {
    res.status(500).json({ message: "Failed to update request status" });
  }
};

export const offerPrice = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({ message: "Only companies can negotiate prices" });
    }

    const { requestId } = req.params;
    const { price } = req.body;

    if (!price || isNaN(price)) {
      return res.status(400).json({ message: "Please provide a valid fee" });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    request.amount = price;
    request.negotiationStatus = "price_offered";
    await request.save();

    const io = getIO();
    io.to(`request:${request._id}`).emit("request:priceOffered", { requestId, price });
    io.to(`user:${request.user}`).emit("request:priceOffered", { requestId, price });

    res.status(200).json({ message: "Price offer sent to user", request });
  } catch (error) {
    res.status(500).json({ message: "Failed to send offer" });
  }
};
