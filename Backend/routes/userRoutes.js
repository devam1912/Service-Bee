import express from "express";
import { registerUser, loginUser, verifyOTP } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOTP);
router.get("/profile", protect, (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});


export default router;

