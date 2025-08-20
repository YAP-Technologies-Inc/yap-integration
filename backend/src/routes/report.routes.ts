// backend/src/routes/reportForm.routes.ts
import { Router } from "express";
import { sendMail } from "../config/mailer.js";

const router = Router();

const REPORTS_TO = process.env.REPORTS_TO!;

router.post("/report-form", async (req, res) => {
  const { reason, explain, replyTo } = req.body || {};
  if (!reason || !explain) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // Optional: lightweight input hardening
  const subject = `Issue Reported: ${String(reason).slice(0, 120)}`;
  const plain = String(explain).slice(0, 10_000);

  // Optional: include a simple HTML body for better readability
  const html = `
    <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Arial">
      <h2>Issue Reported</h2>
      <p><b>Reason:</b> ${escapeHtml(String(reason))}</p>
      <p><b>Details:</b></p>
      <pre style="white-space:pre-wrap;background:#f6f8fa;padding:12px;border-radius:6px;border:1px solid #eaecef">${escapeHtml(plain)}</pre>
    </div>
  `;

  try {
    await sendMail({
      to: REPORTS_TO,
      subject,
      text: plain,
      html,
      replyTo, 
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to send report:", err?.message || err);
    res.status(500).json({ error: "Email send failed" });
  }
});

// tiny util to avoid accidental HTML injection in the email
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export default router;
