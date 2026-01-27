import express from "express";
import dotenv from "dotenv";
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
import globalChatRoutes from "./routes/globalChatRoutes.js";
import adminGlobalChatRoutes from "./routes/adminGlobalChatRoutes.js";
import termsRoutes from "./routes/termsRoutes.js";

import initSocket from "./socket/index.js";
import { setIO } from "./socket/socket.js"; // ✅ ADD THIS

dotenv.config();

const app = express();
app.use(express.json());
applySecurity(app);

// routes
app.use("/api", testRoute);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/global-chat", globalChatRoutes);
app.use("/api/admin/global-chat", adminGlobalChatRoutes);
app.use("/api/terms", termsRoutes);

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
