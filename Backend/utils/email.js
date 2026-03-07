import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Service-Bee" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log("Email sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("EMAIL SEND ERROR:", error);
        return false;
    }
};
