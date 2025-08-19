import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const provider = new ethers.JsonRpcProvider(
  "https://evm-rpc-testnet.sei-apis.com",
);

const tokenAbi = [
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

const tokenAddress = process.env.TOKEN_ADDRESS;
const treasuryAddress = process.env.TREASURY_ADDRESS;
const initialSupply = ethers.parseUnits("1000000", 18); // 1,000,000 YAP

async function audit() {
  const token = new ethers.Contract(tokenAddress, tokenAbi, provider);

  const [totalSupply, treasuryBalance, decimals] = await Promise.all([
    token.totalSupply(),
    token.balanceOf(treasuryAddress),
    token.decimals(),
  ]);

  const burned = initialSupply - totalSupply;

  console.log("--- YAP SUPPLY AUDIT ---");
  console.log(
    `Initial Supply:   ${ethers.formatUnits(initialSupply, decimals)} YAP`,
  );
  console.log(
    `Current Supply:   ${ethers.formatUnits(totalSupply, decimals)} YAP`,
  );
  console.log(`Burned Tokens:    ${ethers.formatUnits(burned, decimals)} YAP`);
  console.log(
    `Treasury Balance: ${ethers.formatUnits(treasuryBalance, decimals)} YAP`,
  );
  console.log(
    `Check: Burned + Treasury = ${ethers.formatUnits(burned + treasuryBalance, decimals)} YAP`,
  );
}

audit().catch(console.error);
