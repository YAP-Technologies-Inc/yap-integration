import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

// GET /api/profile/:userId
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await db.query(
      "SELECT name, language_to_learn, created_at FROM users WHERE user_id=$1",
      [userId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err: any) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
