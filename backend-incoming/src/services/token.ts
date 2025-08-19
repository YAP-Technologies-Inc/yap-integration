// src/services/token.ts (or wherever sendYAPToWallet lives)
import { isAddress } from "../config/ethers.js";
import { distributeFromHotToUser } from "../blockchain/relayerDistribute.js";
import { buildPermitSignatureForHotWithSpender } from "../blockchain/permitSigner.js";
import { RELAYER_PRIVATE_KEY } from "../config/env.js";
import { Wallet, JsonRpcProvider } from "ethers";
import { SEI_RPC } from "../config/env.js";

export async function sendYAPToWallet(toAddress: string): Promise<string> {
  if (!isAddress(toAddress))
    throw new Error(`Invalid wallet address: ${toAddress}`);

  // derive spender from the same key the relayer uses
  const relayer = new Wallet(
    String(RELAYER_PRIVATE_KEY),
    new JsonRpcProvider(String(SEI_RPC)),
  );
  const spender = relayer.address;

  const now = Math.floor(Date.now() / 1000);
  const deadlineSec = now + 60 * 60; // 1 hour

  // HOT signs a permit specifically for *this* relayer address
  const {
    owner,
    spender: signedSpender,
    deadline,
    signature,
  } = await buildPermitSignatureForHotWithSpender("1", deadlineSec, spender);

  // sanity: should match
  if (signedSpender.toLowerCase() !== spender.toLowerCase()) {
    throw new Error(`signed spender ${signedSpender} != relayer ${spender}`);
  }

  // relayer executes permit + transferFrom(HOT -> user)
  const txHash = await distributeFromHotToUser({
    owner,
    spender,
    user: toAddress,
    amountStr: "1",
    deadline,
    signature,
  });

  return txHash;
}
