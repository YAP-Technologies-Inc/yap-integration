import { getToken, isAddress, parseUnits } from "../config/ethers.js";

export async function sendYAPToWallet(toAddress: string): Promise<string> {
  if (!isAddress(toAddress)) throw new Error(`Invalid wallet address: ${toAddress}`);
  const token = getToken();
  const tx = await token.transfer(toAddress, parseUnits("1", 18));
  await tx.wait();
  return tx.hash;
}
