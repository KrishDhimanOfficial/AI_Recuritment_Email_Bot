import transporter from "../config/mailer.config.js";
import config from "../config/config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getTemplate(templateName, name) {
    const templatePath = path.join(__dirname, "../templates", templateName);
    const template = fs.readFileSync(templatePath, "utf-8");
    return template.replace(/{{CandidateName}}/g, name || "Candidate");
}

export async function sendEmail(type, email, name) {
    let subject = "";
    let html = "";

    switch (type) {
        case "internship":
            subject = "Internship Application Status";
            html = getTemplate("intership.email.html", name);
            break;

        case "fresher":
            subject = "Application Update";
            html = getTemplate("fresher.email.html", name);
            break;

        case "experienced":
            subject = "Your Application Has Been Received";
            html = getTemplate("expericend.email.html", name);
            break;

        default:
            subject = "Application Status";
            html = getTemplate("default.email.html", name);
            break;
    }

    return await transporter.sendMail({
        from: `<${config.smtp_email}>`,
        to: email,
        subject,
        html,
    });
}