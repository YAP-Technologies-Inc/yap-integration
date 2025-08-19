// backend/src/config/mailer.ts (or .js)
import dns from "node:dns";
import nodemailer from "nodemailer";
import {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_FROM,
} from "./env.js";

// Prefer IPv4 to avoid any IPv6 routing hiccups
dns.setDefaultResultOrder?.("ipv4first");

const host = EMAIL_HOST!;
const port = Number(EMAIL_PORT || 587);
const secure = port === 465; // true only for 465 (SMTPS)

export const transporter = nodemailer.createTransport({
  host,               // smtp.gmail.com
  port,               // 587 (STARTTLS) or 465 (SMTPS)
  secure,             // true if 465, else false
  auth: {
    user: EMAIL_USER, // your full Gmail/Workspace address
    pass: EMAIL_PASS, // Google App Password (NOT your normal password)
  },
  // shorter timeouts so failures show quickly
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 20000,
  tls: {
    // Gmail presents a valid cert; keep this true
    rejectUnauthorized: true,
    servername: host,
  },
});

// Optional: verify at startup so you see a clear log
export async function verifyMailer() {
  try {
    await transporter.verify();
  } catch (e) {
    console.error("[mailer] verify failed:", e);
  }
}
