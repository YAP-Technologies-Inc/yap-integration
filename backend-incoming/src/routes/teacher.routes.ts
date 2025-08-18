import { Router } from "express";
import { db } from "../config/db.js";
import { JsonRpcProvider, Wallet, Contract, ethers } from "ethers";
import { PRIVATE_KEY, TOKEN_ADDRESS, SEI_RPC } from "../config/env.js";
import artifact from "../abi/YapToken.json" with { type: "json" };

const provider = new JsonRpcProvider(SEI_RPC);
const signer = new Wallet(String(PRIVATE_KEY), provider);
const token = new Contract(
  String(TOKEN_ADDRESS),
  (artifact as any).abi,
  signer,
);

const router = Router();

// POST /api/request-spanish-teacher
router.post("/request-spanish-teacher", async (req, res) => {
  const { userId, walletAddress, permit } = req.body || {};
  if (!userId || !walletAddress || !permit || !permit.signature) {
    return res.status(400).json({ error: "Missing permit fields" });
  }
  const { owner, spender, value, deadline, signature } = permit;

  try {
    const { v, r, s } = ethers.Signature.from(signature);

    const permitTx = await token.permit(
      owner,
      spender,
      value,
      deadline,
      v,
      r,
      s,
    );
    await permitTx.wait();

    const spendAmount = BigInt(value);
    const spendTx = await token.spendTokenFrom(owner, spendAmount);
    await spendTx.wait();

    await db.query(
      `INSERT INTO teacher_sessions (user_id, tx_hash, expires_at)
       VALUES ($1, $2, NOW() + interval '20 minutes')
       ON CONFLICT (user_id) DO UPDATE
         SET tx_hash = EXCLUDED.tx_hash,
             expires_at = NOW() + interval '20 minutes'`,
      [userId, spendTx.hash],
    );

    return res.json({ success: true, txHash: spendTx.hash });
  } catch (err: any) {
    console.error("Permit or DB error:", err);
    return res.status(500).json({ error: "Backend processing failed." });
  }
});

// GET /api/teacher-session/:userId
router.get("/teacher-session/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT expires_at,
              GREATEST(EXTRACT(EPOCH FROM (expires_at - NOW())) * 1000, 0) AS remaining_ms
       FROM teacher_sessions
       WHERE user_id=$1
       ORDER BY expires_at DESC
       LIMIT 1`,
      [userId],
    );

    if (!rows.length) return res.json({ hasAccess: false, remainingMs: 0 });

    const expiresAt = rows[0].expires_at;
    const remainingMs = Number(rows[0].remaining_ms || 0);

    return res.json({
      hasAccess: remainingMs > 0,
      remainingMs,
      expiresAt: new Date(expiresAt).toISOString(),
    });
  } catch (err: any) {
    console.error("Session check failed:", err);
    return res.status(500).json({ error: "Failed to check session" });
  }
});

export default router;
