import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";

import connectDB from "./config/connectDB.js";
import { applySecurity } from "./middleware/securityMiddleware.js";

import testRoute from "./routes/testRoute.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

import termsRoutes from "./routes/termsRoutes.js";
import privateChatRoutes from "./routes/privateChatRoutes.js";

import initSocket from "./socket/index.js";
import { setIO } from "./socket/socket.js"; // ✅ ADD THIS


const app = express();
// 1. Security (CORS/Helmet) must be first
applySecurity(app);

// 2. Body Parser
app.use(express.json());

// Basic Health Check (visible in browser to confirm deployment)
app.get("/", (req, res) => res.json({ status: "Bee-hive is Buzzing! 🐝", env: process.env.NODE_ENV || 'dev' }));

app.get("/api/hive-check", (req, res) => {
  res.json({
    email_user: !!process.env.EMAIL_USER,
    email_pass: !!process.env.EMAIL_PASS,
    mongo_url: !!process.env.MONGODB_URL,
    jwt_secret: !!process.env.JWT_SECRET,
    cloudinary: !!process.env.CLOUD_NAME,
    razorpay: !!process.env.RAZORPAY_KEY_ID
  });
});

// routes
app.use("/api", testRoute);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);

app.use("/api/terms", termsRoutes);
app.use("/api/private-chat", privateChatRoutes);

// DB
connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// ✅ REGISTER SOCKET INSTANCE GLOBALLY
setIO(io);

// ✅ INITIALIZE SOCKET LISTENERS
initSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
