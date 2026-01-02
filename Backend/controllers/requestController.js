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