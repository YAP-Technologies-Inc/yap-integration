import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

// GET /api/user-stats/:userId
router.get("/user-stats/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT token_balance, current_streak, highest_streak, total_yap_earned, updated_at
       FROM user_stats WHERE user_id=$1`,
      [userId],
    );
    if (rows.length === 0)
      return res.status(404).json({ error: "Stats not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching user stats:", err);
    res.status(500).json({ error: "Failed to fetch user stats" });
  }
});

// POST /api/user-stats/:userId/streak
router.post("/user-stats/:userId/streak", async (req, res) => {
  const { userId } = req.params;
  const { currentStreak, highestStreak } = req.body;
  try {
    await db.query(
      `UPDATE user_stats
         SET current_streak=$2,
             highest_streak=GREATEST(highest_streak, $3),
             updated_at=NOW()
       WHERE user_id=$1`,
      [userId, currentStreak, highestStreak],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error updating streak:", err);
    res.status(500).json({ error: "Failed to update streak" });
  }
});

export default router;
