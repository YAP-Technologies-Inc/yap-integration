import { Router } from "express";
import { getToken, isAddress, parseUnits } from "../config/ethers.js";
import { sendYAPToWallet } from "../services/token.js";

const router = Router();

router.post("/redeem-yap", async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress || !isAddress(walletAddress)) {
      return res.status(400).json({ success: false, error: "Invalid wallet address" });
    }
    const token = getToken();
    const tx = await token.transfer(walletAddress, parseUnits("1", 18));
    await tx.wait();
    res.json({ success: true, txHash: tx.hash });
  } catch (err: any) {
    console.error("YAP transfer failed:", err);
    res.status(500).json({ success: false, error: "Transfer failed" });
  }
});

export default router;
