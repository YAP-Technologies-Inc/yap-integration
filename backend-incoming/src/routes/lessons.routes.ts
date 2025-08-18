import { Router } from "express";
import { db } from "../config/db.js";
import { sendYAPToWallet } from "../services/token.js";

const router = Router();

// POST /api/complete-lesson
router.post("/complete-lesson", async (req, res) => {
  const { userId, walletAddress, lessonId } = req.body;
  try {
    const { rows: already } = await db.query(
      `SELECT 1 FROM user_lessons WHERE user_id=$1 AND lesson_id=$2`,
      [userId, lessonId],
    );
    if (already.length) {
      return res.status(400).json({ error: "Lesson already completed." });
    }

    const txHash = await sendYAPToWallet(walletAddress);

    await db.query(
      `INSERT INTO user_lessons (user_id, lesson_id, completed_at, tx_hash)
       VALUES ($1, $2, NOW(), $3)`,
      [userId, lessonId, txHash],
    );

    await db.query(
      `INSERT INTO user_stats (user_id, token_balance, current_streak, highest_streak, total_yap_earned)
       VALUES ($1, 1, 0, 0, 1)
       ON CONFLICT (user_id) DO UPDATE
         SET token_balance    = user_stats.token_balance + 1,
             total_yap_earned = user_stats.total_yap_earned + 1,
             updated_at       = NOW()`,
      [userId],
    );

    res.json({ success: true, txHash });
  } catch (err: any) {
    console.error("Lesson completion error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/user-lessons/:userId
router.get("/user-lessons/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result = await db.query(
      "SELECT lesson_id FROM user_lessons WHERE user_id=$1",
      [userId],
    );
    const completedLessons = result.rows.map(
      (r: { lesson_id: string }) => r.lesson_id,
    );
    res.json({ completedLessons });
  } catch (err) {
    console.error("Error fetching user lessons:", err);
    res.status(500).json({ error: "Failed to fetch completed lessons" });
  }
});

export default router;
