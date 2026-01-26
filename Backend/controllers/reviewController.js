import Review from "../models/reviewModel.js";
import Request from "../models/requestModel.js";
import Company from "../models/companyModel.js";

export const createReview = async (req, res) => {
  try {
    if (req.user.role !== "user") {
      return res.status(403).json({
        message: "Only users can write reviews",
      });
    }

    const { requestId, rating, comment } = req.body;

    if (!requestId || !rating) {
      return res.status(400).json({
        message: "Request ID and rating are required",
      });
    }

    const request = await Request.findById(requestId);

    if (!request) {
      return res.status(404).json({
        message: "Request not found",
      });
    }

    if (request.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You are not allowed to review this request",
      });
    }

    if (request.status !== "completed") {
      return res.status(400).json({
        message: "You can review only completed requests",
      });
    }

    const existingReview = await Review.findOne({ request: requestId });
    if (existingReview) {
      return res.status(400).json({
        message: "Review already submitted for this request",
      });
    }

    const review = await Review.create({
      user: req.user._id,
      company: request.company,
      request: requestId,
      rating,
      comment,
    });

    //find all the reviews
    const reviews = await Review.find({ company: request.company });

    //calculating avg
    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
    //find and update the company field
    await Company.findByIdAndUpdate(request.company, {
      rating: avgRating.toFixed(1),
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (error) {
    console.error("Review error", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
