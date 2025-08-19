import {
  JsonRpcProvider,
  Wallet,
  Contract,
  isAddress,
  parseUnits,
} from "ethers";
import { PRIVATE_KEY, TOKEN_ADDRESS, SEI_RPC } from "./env.js";
import artifact from "../abi/YapToken.json" with { type: "json" };

export const provider = new JsonRpcProvider(SEI_RPC);
export const wallet = new Wallet(String(PRIVATE_KEY), provider);

export const tokenAbi = (artifact as any).abi;

export const getToken = () =>
  new Contract(String(TOKEN_ADDRESS), tokenAbi, wallet);

export { isAddress, parseUnits };
