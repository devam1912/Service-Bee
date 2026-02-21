import { GoogleGenerativeAI } from "@google/generative-ai";
import Company from "../models/companyModel.js";

export const aiSearchServices = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are an AI assistant for "Service-Bee", a service provider platform. 
      The user is searching for: "${query}".
      Based on this query, extract the most relevant service category.
      Common categories include: Plumbing, Electrical, Cleaning, Gardening, Pest Control, Carpentry, Painting, Appliance Repair, HVAC, Moving.
      Return ONLY the category name. If none match exactly, return the closest logical category.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const category = response.text().trim();

        // Find companies matching this category
        const companies = await Company.find({
            $or: [
                { serviceCategory: { $regex: category, $options: "i" } },
                { services: { $regex: category, $options: "i" } }
            ],
            isVerified: true
        });

        return res.status(200).json({
            success: true,
            category,
            companies
        });
    } catch (error) {
        console.error("AI SEARCH ERROR:", error);
        return res.status(500).json({ message: "AI search failed" });
    }
};
