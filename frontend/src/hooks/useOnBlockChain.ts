// src/hooks/useOnChainBalance.ts
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';
import useSWR from 'swr';

const SEI_RPC = 'https://evm-rpc-testnet.sei-apis.com';
const YAP_CONTRACT = '0xaD8503294dE1b31490DDd0c9D0a8B62AB4Ab3538';
const CW20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

const fetchBalance = async (address: string) => {
  const provider = new JsonRpcProvider(SEI_RPC);
  const contract = new Contract(YAP_CONTRACT, CW20_ABI, provider);
  const [rawBalance, decimals] = await Promise.all([
    contract.balanceOf(address),
    contract.decimals(),
  ]);

  return parseFloat(formatUnits(rawBalance, decimals));
};

export function useOnChainBalance(evmAddress: string | null) {
  const { data, error, isLoading } = useSWR(
    () => (evmAddress ? `onchain-${evmAddress}` : null),
    () => fetchBalance(evmAddress!),
  );

  return {
    balance: data,
    isLoading,
    isError: !!error,
  };
}
