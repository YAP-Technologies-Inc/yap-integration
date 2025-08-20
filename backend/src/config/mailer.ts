// backend/src/config/mailer.ts
import formData from "form-data";
import Mailgun from "mailgun.js";

const API_KEY = process.env.MAILGUN_API_KEY!;
const DOMAIN = process.env.MAILGUN_DOMAIN!;
const FROM = process.env.MAILGUN_FROM || "support@goyap.io";

const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: "api", key: API_KEY });

export async function sendMail({
  to,
  subject,
  text,
  html,
  replyTo,
}: {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  replyTo?: string;
}) {
  const message: any = {
    from: FROM,
    to,
    subject,
    ...(html ? { html } : {}),
    ...(text ? { text } : {}),
    ...(replyTo ? { "h:Reply-To": replyTo } : {}),
  };

  const result = await mg.messages.create(DOMAIN, message);
  return result; // { id, message }
}
