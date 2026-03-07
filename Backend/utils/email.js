import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text, html) => {
    // Re-config dotenv just in case it's missed in some contexts
    dotenv.config();

    console.log(`[EMAIL SERVICE] Attempting to send to: ${to}`);
    console.log(`[DEBUG] Auth: ${process.env.EMAIL_USER} | Pass length: ${process.env.EMAIL_PASS?.length || 0}`);

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
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
        return true;
    } catch (error) {
        console.error("[CRITICAL] EMAIL SEND ERROR:", error.message);
        if (error.code === 'EAUTH') {
            console.error("Authentication failed. Check if App Password is correct.");
        }
        return false;
    }
};
