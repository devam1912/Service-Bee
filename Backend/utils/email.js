import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "devamtanna01@gmail.com",
        pass: "ooij kqxr socn xppv"
    }
});

export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Service-Bee" <devamtanna01@gmail.com>',
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
