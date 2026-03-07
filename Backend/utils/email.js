import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
    dotenv.config();

    console.log(`[EMAIL SERVICE] Attempting to send to: ${to}`);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 5000, // Faster timeout for debugging
        greetingTimeout: 5000,
        socketTimeout: 5000,
        logger: true, // Enable logging in Render logs
        debug: true
    });

    try {
        const info = await transporter.sendMail({
            from: `"Service-Bee" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log(`[SUCCESS] Email sent: ${info.messageId}`);
        return { success: true };
    } catch (error) {
        console.error("[CRITICAL] EMAIL SEND ERROR:", error.message);
        return { success: false, error: error.message };
    }
};
