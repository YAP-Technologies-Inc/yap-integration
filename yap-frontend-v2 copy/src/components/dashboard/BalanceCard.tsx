import coin from '@/assets/coin.png';
import { usePrivy } from '@privy-io/react-auth';
import { useUserStats } from '@/hooks/useUserStats';
import Image from 'next/image';

export default function BalanceCard() {
  const { user } = usePrivy();
  const userId = user?.id ?? null;

  const {
    stats,
    isLoading,
    isError,
  } = useUserStats(userId);

  if (isLoading) {
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

  if (isError || !stats) {
    return (
      <div className="bg-white w-full rounded-xl shadow px-6 py-4 flex items-center justify-between border-b-2 border-red-200 text-red-500">
        <span>Error fetching balance</span>
      </div>
    );
  }

  return (
    <div className="bg-white w-full rounded-xl shadow px-6 py-4 flex items-center justify-between border-b-3 border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm text-secondary font-medium mb-1">
          Available Balance
        </span>
        <span className="text-2xl font-bold text-secondary">
          {stats.tokenBalance}
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
