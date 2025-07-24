// BalanceCard.tsx
// This component displays the user's balance in the dashboard.
// It shows the amount of $YAP tokens the user has.
// The balance is fetched from the mock user profile and displayed with a coin icon for now

import coin from '@/assets/coin.png';
import { useWallets } from '@privy-io/react-auth';
import { useOnChainBalance } from '@/hooks/useOnBlockChain';
import Image from 'next/image';

export default function BalanceCard() {
  const { wallets } = useWallets();
  const evmAddress = wallets?.[0]?.address || null;
  const { balance: onChainBalance, isLoading: isBalanceLoading } =
    useOnChainBalance(evmAddress);

  if (isBalanceLoading) {
    return (
      <div className="bg-white w-full rounded-xl shadow px-6 py-4 flex items-center justify-between border-b-2 border-gray-200">
        <div className="flex flex-col">
          <span className="text-sm text-[#5C4B4B] font-medium mb-1">
            Loading balance...
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white w-full rounded-xl shadow px-6 py-4 flex items-center justify-between border-b-2 border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm text-[#5C4B4B] font-medium mb-1">
          Available Balance
        </span>
        <span className="text-2xl font-bold text-secondary">
          {onChainBalance ?? 0}
          <span className="text-base font-semibold"> YAP</span>
        </span>
      </div>
      <Image
        src={coin}
        height={50}
        width={50}
        alt="Coin"
        className="w-10 h-10"
      />
    </div>
  );
}
