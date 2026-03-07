import mongoose from "mongoose";
import User from "./models/userModel.js";
import Company from "./models/companyModel.js";
import Admin from "./models/adminModel.js";
import dotenv from "dotenv";
dotenv.config();

const normalizeDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("Connected to DB for normalization...");

        const users = await User.find({});
        for (const user of users) {
            if (user.email !== user.email.toLowerCase()) {
                console.log(`Normalizing user: ${user.email} -> ${user.email.toLowerCase()}`);
                user.email = user.email.toLowerCase();
                await user.save();
            }
        }

        const companies = await Company.find({});
        for (const company of companies) {
            if (company.email !== company.email.toLowerCase()) {
                console.log(`Normalizing company: ${company.email} -> ${company.email.toLowerCase()}`);
                company.email = company.email.toLowerCase();
                await company.save();
            }
        }

        const admins = await Admin.find({});
        for (const admin of admins) {
            if (admin.email !== admin.email.toLowerCase()) {
                console.log(`Normalizing admin: ${admin.email} -> ${admin.email.toLowerCase()}`);
                admin.email = admin.email.toLowerCase();
                await admin.save();
            }
        }

        console.log("Normalization complete!");
        process.exit(0);
    } catch (err) {
        console.error("Normalization failed:", err);
        process.exit(1);
    }
};

normalizeDB();
