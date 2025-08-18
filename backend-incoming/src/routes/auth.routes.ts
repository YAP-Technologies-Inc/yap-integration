import { Router } from "express";
import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const router = Router();

// POST /api/auth/secure-signup
router.post("/auth/secure-signup", async (req, res) => {
  try {
    const { user_id, name, language_to_learn } = req.body;
    if (!user_id || !name || !language_to_learn) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields" });
    }

    await db.query(
      `INSERT INTO users (user_id, name, language_to_learn)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE
         SET name = EXCLUDED.name,
             language_to_learn = EXCLUDED.language_to_learn`,
      [user_id, name, language_to_learn],
    );

    await db.query(
      `INSERT INTO user_stats (user_id, token_balance, current_streak, highest_streak, total_yap_earned)
       VALUES ($1, 0, 1, 1, 0)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id],
    );

    res.json({
      success: true,
      user_id,
      message: "User (and stats) saved to DB successfully",
    });
  } catch (err: any) {
    console.error("Secure signup error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "Email and password are required." });
    }

    const result = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (result.rows.length === 0) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid email or password." });
    }

    const token = crypto.randomBytes(32).toString("hex");

    res.json({
      success: true,
      userId: user.user_id,
      token,
      name: user.name,
      email: user.email,
      sei_address: user.sei_address,
      eth_address: user.eth_address,
      message: "Login successful!",
    });
  } catch (err: any) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
