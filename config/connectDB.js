import mongoose from "mongoose";
import dotenv from "dotenv"
dotenv.config()

const connectDB = async()=>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("DB connected")
    } catch (error) {
        console.log("DB connection fail", error);
        process.exit(1);
    }
};
export default connectDB
