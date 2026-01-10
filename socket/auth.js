import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Company from "../models/companyModel.js";

export const socketAuth = async (socket, next) => {
  try {
    const { token, actorType } = socket.handshake.auth;

    if (!token || !actorType) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (actorType === "user") {
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("User not found"));

      socket.actor = {
        id: user._id,
        type: "User",
      };
    } 
    else if (actorType === "company") {
      const company = await Company.findById(decoded.id);
      if (!company) return next(new Error("Company not found"));

      socket.actor = {
        id: company._id,
        type: "Company",
      };
    } 
    else {
      return next(new Error("Invalid actor type"));
    }

    next();
  } catch (error) {
    next(new Error("Invalid or expired token"));
  }
};
