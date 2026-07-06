import nodemailer from "nodemailer";
import config from "./config.js";

const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: config.smtp_port,
    secure: config.smtp_port === 465,
    auth: {
        user: config.smtp_email,
        pass: config.smtp_password,
    },
});

(async () => {
    try {
        await transporter.verify();
        console.log("✅ Nodemailer is Ready to send Emails.");
    } catch (err) {
        console.error("❌ Nodemailer Error:");
        console.error(err);
    }
})();

export default transporter