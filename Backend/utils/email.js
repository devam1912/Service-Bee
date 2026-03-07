import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
    dotenv.config();

    console.log(`[EMAIL SERVICE] Attempting to send to: ${to}`);

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 10000,
        logger: true,
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
