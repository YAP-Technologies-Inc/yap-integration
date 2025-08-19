import { Router } from "express";
import { transporter } from "../config/mailer.js";
import { EMAIL_USER, EMAIL_TO, EMAIL_FROM } from "../config/env.js";

const router = Router();

// POST /api/report-form
router.post("/report-form", async (req, res) => {
  const { reason, explain } = req.body || {};
  if (!reason || !explain)
    return res.status(400).json({ error: "Missing fields" });

  try {
    await transporter.sendMail({
      from: `"YAP Reporter" <${EMAIL_FROM}>`, 
      to: EMAIL_TO,
      subject: `Issue Reported: ${reason}`,
      text: explain,
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error("Failed to send report:", err);
    res.status(500).json({ error: "Email send failed" });
  }
});

export default router;
