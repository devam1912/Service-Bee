import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Company from "../models/companyModel.js";

export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let actor = await User.findById(decoded.id).select("-password");
    let type = "User";

    if (!actor) {
      actor = await Company.findById(decoded.id).select("-password");
      type = "Company";
    }

    if (!actor) {
      return next(new Error("Authentication error: Actor not found"));
    }

    socket.actor = {
      id: actor._id,
      type: type,
      name: actor.name || actor.companyName // Fallback for company name if different
    };

    next();
  } catch (err) {
    console.error("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
};
