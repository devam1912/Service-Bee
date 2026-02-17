import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import Admin from "./models/adminModel.js";
import connectDB from "./config/connectDB.js";

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();

        const existingAdmin = await Admin.findOne({ email: "admin@servicebee.com" });
        if (existingAdmin) {
            console.log("Admin already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash("admin123", 10);
        await Admin.create({
            email: "admin@servicebee.com",
            password: hashedPassword
        });

        console.log("Admin created successfully");
    } catch (error) {
        console.error("Error seeding admin:", error);
    } finally {
        mongoose.disconnect();
    }
};

seedAdmin();
