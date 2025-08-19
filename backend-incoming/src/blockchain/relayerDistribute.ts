// src/blockchain/relayerDistribute.ts
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  Signature,
  parseUnits,
} from "ethers";
import { SEI_RPC, TOKEN_ADDRESS, RELAYER_PRIVATE_KEY } from "../config/env.js";
import artifact from "../abi/YapToken.json" with { type: "json" };

const provider = new JsonRpcProvider(String(SEI_RPC));
const relayer = new Wallet(String(RELAYER_PRIVATE_KEY), provider);
const token = new Contract(
  String(TOKEN_ADDRESS),
  (artifact as any).abi,
  relayer,
);

/**
 * Uses a HOT-signed permit to transfer YAP from HOT -> user.
 * Pass the exact owner/spender from the signer result to prevent mismatches.
 */
export async function distributeFromHotToUser(params: {
  owner: string; // HOT address from the signer output
  spender: string; // should equal relayer.address
  user: string; // recipient
  amountStr: string; // e.g. "1"
  deadline: bigint; // must match signature
  signature: string; // HOT's signature from buildPermitSignatureForHotWithSpender
}) {
  const { owner, spender, user, amountStr, deadline, signature } = params;

  // Safety checks to avoid the "unknown custom error" from mismatched owner/spender
  if (spender.toLowerCase() !== relayer.address.toLowerCase()) {
    throw new Error(`permit spender ${spender} != relayer ${relayer.address}`);
  }

  const amount = parseUnits(amountStr, 18);
  const { v, r, s } = Signature.from(signature);

  // 1) Permit: HOT -> relayer for `amount`
  const ptx = await token.permit(owner, spender, amount, deadline, v, r, s);
  await ptx.wait();

  // 2) Spend: transferFrom(HOT -> user) using that allowance
  const tx = await token.transferFrom(owner, user, amount);
  await tx.wait();
  return tx.hash;
}
