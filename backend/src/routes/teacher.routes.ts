// src/routes/teacher.routes.ts
import { Router, Request, Response } from "express";
import { db } from "../config/db.js";
import { JsonRpcProvider, Wallet, Contract, ethers } from "ethers";
import {
  PRIVATE_KEY,
  TOKEN_ADDRESS,
  SEI_RPC,
  RELAYER_PRIVATE_KEY,
} from "../config/env.js";
import abi from "../abi/YapToken.json" with { type: "json" };

const router = Router();

// src/routes/teacher.routes.ts (top)
if (!SEI_RPC) throw new Error("SEI_RPC is not set");
if (!TOKEN_ADDRESS) throw new Error("TOKEN_ADDRESS is not set");
if (!RELAYER_PRIVATE_KEY) throw new Error("RELAYER_PRIVATE_KEY is not set"); // <- fix

const provider = new JsonRpcProvider(String(SEI_RPC));
const relayer = new Wallet(String(RELAYER_PRIVATE_KEY), provider);

const token = new Contract(String(TOKEN_ADDRESS), abi.abi, relayer);

// --- Helpers ---
function toLower(x: string) {
  return String(x || "").toLowerCase();
}
function asBigInt(v: unknown): bigint {
  if (typeof v === "bigint") return v;
  if (typeof v === "number") return BigInt(v);
  if (typeof v === "string") return BigInt(v);
  throw new Error("value must be a bigint/number/string");
}

// POST /api/request-spanish-teacher
// Body:
// {
//   "userId": "123",
//   "walletAddress": "0xUser...",
//   "permit": {
//     "owner": "0xUser...",
//     "spender": "0xRelayer...",     // should equal relayer.address
//     "value": "1000000000000000000",// amount in wei (e.g. 1e18 for 1 YAP)
//     "deadline": 1755600000,        // unix seconds
//     "signature": "0x..."           // EIP-712 signature from USER
//   }
// }
router.post("/request-spanish-teacher", async (req: Request, res: Response) => {
  const { userId, walletAddress, permit } = req.body || {};
  if (!userId || !walletAddress || !permit || !permit.signature) {
    return res.status(400).json({ error: "Missing permit fields" });
  }

  const { owner, spender, value, deadline, signature } = permit;
  if (
    process.env.RELAYER_ADDRESS &&
    relayer.address.toLowerCase() !== process.env.RELAYER_ADDRESS.toLowerCase()
  ) {
    throw new Error("RELAYER_PRIVATE_KEY != RELAYER_ADDRESS");
  }

  try {
    // Basic sanity checks
    if (toLower(owner) !== toLower(walletAddress)) {
      return res
        .status(400)
        .json({ error: "Permit owner must match walletAddress" });
    }
    if (toLower(spender) !== toLower(relayer.address)) {
      return res
        .status(400)
        .json({ error: "Permit spender must equal the relayer address" });
    }
    const now = Math.floor(Date.now() / 1000);
    if (Number(deadline) <= now) {
      return res.status(400).json({ error: "Permit deadline is expired" });
    }

    // Parse signature (ethers v6)
    const { v, r, s } = ethers.Signature.from(signature);

    const tx = await token.permitAndSpend(
      owner,
      asBigInt(value),
      asBigInt(deadline),
      v,
      r,
      s,
    );
    await tx.wait();

    // Record a 20-minute session keyed by userId
    await db.query(
      `INSERT INTO teacher_sessions (user_id, tx_hash, expires_at)
       VALUES ($1, $2, NOW() + interval '20 minutes')
       ON CONFLICT (user_id) DO UPDATE
         SET tx_hash = EXCLUDED.tx_hash,
             expires_at = NOW() + interval '20 minutes'`,
      [userId, tx.hash],
    );

    return res.json({ success: true, txHash: tx.hash });
  } catch (err: any) {
    console.error("permitAndSpend or DB error:", err);
    return res.status(500).json({ error: "Backend processing failed." });
  }
});

// GET /api/teacher-session/:userId
router.get("/teacher-session/:userId", async (req: Request, res: Response) => {
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
