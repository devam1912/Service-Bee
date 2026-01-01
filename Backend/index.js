import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDb.js";
import testRoute from "./routes/testRoute.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT;

// middleware
app.use(express.json());

// routes
app.use("/api", testRoute);
app.use("/api/users", userRoutes);

// connect DB
connectDB();

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
