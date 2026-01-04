import Company from "../models/companyModel.js";
import Request from "../models/requestModel.js";
import cloudinary from "../config/cloudinary.js";

export const createRequest = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Only users can create service requests",
      });
    }

    const { companyId, serviceName, userNote } = req.body;

    if (!companyId || !serviceName?.trim()) {
      return res.status(400).json({
        message: "Company ID and service name are required",
      });
    }

    const company = await Company.findById(companyId).select("_id");
    if (!company) {
      return res.status(404).json({
        message: "Company not found",
      });
    }

    const existingRequest = await Request.findOne({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have an active request for this service",
      });
    }

   let attachments = [];

if (Array.isArray(req.files) && req.files.length > 0) {
  for (const file of req.files) {
    const result = await cloudinary.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: "service-bee/requests",
      }
    );

    attachments.push({
      url: result.secure_url,
      type: "image",
    });
  }
}


    const request = await Request.create({
      user: req.user._id,
      company: companyId,
      serviceName: serviceName.trim(),
      userNote: userNote?.trim(),
      attachments,
    });

    res.status(201).json({
      message: "Service request created successfully",
      request,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCompanyRequests = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "Only companies can view incoming requests",
      });
    }

    const requests = await Request.find({ company: req.user._id })
      .populate("user", "name email mobile city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Requests fetched successfully",
      requests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRequestStatus = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "Only companies can update request status",
      });
    }

    const { requestId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status update",
      });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.company.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not authorized to update this request",
      });
    }

    if (["completed", "rejected"].includes(request.status)) {
      return res.status(400).json({
        message: "This request is already closed",
      });
    }

    if (status === "completed" && request.status !== "accepted") {
      return res.status(400).json({
        message: "Only accepted requests can be completed",
      });
    }

    request.status = status;
    await request.save();

    res.status(200).json({
      message: `Request ${status} successfully`,
      request,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
