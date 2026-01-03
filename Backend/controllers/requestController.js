import Company from "../models/companyModel.js";
import Request from "../models/requestModel.js";

export const createRequest = async (req, res) => {
    try {
        if (req.user.role !== "user") {
            return res.status(403).json({
                message: "Only users can create service requests"
            })
        }
        const { companyId, serviceName, userNote } = req.body;
        if (!companyId || !serviceName) {
            return res.status(400).json({
                message: "Company and service name are required"
            });
        }
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found"
            });
        }
        const request = await Request.create({
            user: req.user._id,
            company: companyId,
            serviceName,
            userNote,
            status: "pending"
        });

        res.status(201).json({
            message: "Service request created successfully",
            request
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

export const getCompanyRequests = async (req, res) => {
  try {
    if (req.user.role !== "company") {
      return res.status(403).json({
        message: "Only companies can view incoming requests"
      });
    }

    const requests = await Request.find({ company: req.user._id })
      .populate("user", "name email mobile city")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Requests fetched successfully",
      requests
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
