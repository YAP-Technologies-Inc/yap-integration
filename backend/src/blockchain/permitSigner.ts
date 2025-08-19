// src/blockchain/permitSigner.ts
import {
  JsonRpcProvider,
  Wallet,
  Contract,
  TypedDataDomain,
  parseUnits,
} from "ethers";
import { SEI_RPC, TOKEN_ADDRESS, HOT_PRIVATE_KEY } from "../config/env.js";
import artifact from "../abi/YapToken.json" with { type: "json" };

const provider = new JsonRpcProvider(String(SEI_RPC));
const token = new Contract(
  String(TOKEN_ADDRESS),
  (artifact as any).abi,
  provider,
);

/**
 * HOT signs EIP-2612 permit authorizing `relayerAddress` to spend `amountStr` YAP.
 */
export async function buildPermitSignatureForHotWithSpender(
  amountStr: string, // e.g. "1"
  deadlineSec: number, // unix seconds in the future
  relayerAddress: string,
) {
  const hot = new Wallet(String(HOT_PRIVATE_KEY), provider);

  const name = await token.name();
  const chainId = (await provider.getNetwork()).chainId;
  const nonce = await token.nonces(hot.address);
  const value = parseUnits(amountStr, 18);
  const deadline = BigInt(deadlineSec);

  const domain: TypedDataDomain = {
    name,
    version: "1",
    chainId,
    verifyingContract: String(TOKEN_ADDRESS),
  };

  const types = {
    Permit: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const message = {
    owner: hot.address,
    spender: relayerAddress,
    value,
    nonce,
    deadline,
  };

  const signature = await hot.signTypedData(domain, types, message);
  return {
    owner: hot.address,
    spender: relayerAddress,
    value,
    deadline,
    signature,
  };
}
