import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDb.js";
import testRoute from "./routes/testRoute.js";
import userRoutes from "./routes/userRoutes.js";
import requestRoutes from "./routes/requestRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js"
dotenv.config();

const app = express();
const port = process.env.PORT;

// middleware
app.use(express.json());

// routes
app.use("/api", testRoute);
app.use("/api/users", userRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/reviews", reviewRoutes);

// connect DB
connectDB();

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
