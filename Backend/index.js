import dotenv from "dotenv";
dotenv.config();

import dns from "dns";
dns.setDefaultResultOrder("ipv4first"); // Force IPv4 to prevent ENETUNREACH on Render's IPv6-less containers

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
import { sendEmail } from "./utils/email.js";


const app = express();

// 1. ABSOLUTE FIRST: CORS Manual Handler
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 2. Security (Helmet/Other)
applySecurity(app);

// 3. Body Parser
app.use(express.json());

// Basic Health Check (visible in browser to confirm deployment)
app.get("/api/hive-status", (req, res) => res.json({ status: "Bee-hive is Buzzing! 🐝", env: process.env.NODE_ENV || 'dev' }));

app.get("/api/test-email", async (req, res) => {
  const { to } = req.query;
  if (!to) return res.status(400).json({ message: "Provide '?to=' param" });

  const result = await sendEmail(
    to,
    "Bee Hive Test",
    "If you see this, Render email sending is ALIVE! 🧪",
    "<h1>🧪 Render Email Test</h1><p>The hive is working!</p>"
  );

  if (result.success) return res.json({ message: "Test email sent successfully!" });
  return res.status(500).json({
    message: "Email sending FAILED on Render.",
    smtp_error: result.error,
    tip: "Verify App Password in Render Env Vars."
  });
});

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
