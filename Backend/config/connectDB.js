import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGODB_URL;

    if (!uri) {
      console.error("DB connection fail: Missing MONGO_URI or MONGODB_URL in Backend/.env");
      process.exit(1);
    }

    await mongoose.connect(uri);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("DB connection fail", error);
    process.exit(1);
  }
};

export default connectDB;
