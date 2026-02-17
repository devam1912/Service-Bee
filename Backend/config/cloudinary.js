import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

console.log("🔧 Cloudinary Config:", {
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY ? "✓ Loaded" : "✗ Missing",
  api_secret: process.env.API_SECRET ? "✓ Loaded" : "✗ Missing"
});

export default cloudinary;
