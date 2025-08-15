import { Router } from "express";
import { db } from "../config/db.js";
import { JsonRpcProvider, Wallet, Contract, ethers } from "ethers";
import { PRIVATE_KEY, TOKEN_ADDRESS, SEI_RPC } from "../config/env.js";
import artifact from "../abi/YapToken.json" with { type: "json" };

const provider = new JsonRpcProvider(SEI_RPC);
const wallet = new Wallet(String(PRIVATE_KEY), provider);
const token = new Contract(String(TOKEN_ADDRESS), (artifact as any).abi, wallet);

const router = Router();

// POST /api/complete-daily-quiz
router.post("/complete-daily-quiz", async (req, res) => {
  const { userId, walletAddress } = req.body || {};
  if (!userId || !walletAddress) return res.status(400).json({ error: "Missing fields" });

  try {
    const { rows } = await db.query(
      `SELECT id FROM daily_quiz WHERE user_id=$1 AND date = CURRENT_DATE`,
      [userId]
    );
    if (rows.length > 0) return res.status(409).json({ error: "Already completed today" });

    const oneYap = ethers.parseUnits("1", 18);
    const tx = await token.transfer(walletAddress, oneYap);
    await tx.wait();

    await db.query(
      `INSERT INTO daily_quiz (user_id, tx_hash, reward_sent)
       VALUES ($1, $2, true)`,
      [userId, tx.hash]
    );
    return res.json({ success: true, txHash: tx.hash });
  } catch (err: any) {
    console.error("Error completing daily quiz:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

// GET /api/daily-quiz-status/:userId
router.get("/daily-quiz-status/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT 1 FROM daily_quiz WHERE user_id=$1 AND date = CURRENT_DATE`,
      [userId]
    );
    return res.json({ completed: rows.length > 0 });
  } catch (err: any) {
    console.error("Quiz status check error:", err);
    return res.status(500).json({ error: "Internal error" });
  }
});

export default router;
