// BalanceCard.tsx
// This component displays the user's balance in the dashboard.
// It shows the amount of $YAP tokens the user has.
// The balance is fetched from the mock user profile and displayed with a coin icon for now

import { mockUserProfile } from '@/mock/mockUser';
import coin from '@/assets/coin.png';

export default function BalanceCard() {
  return (
    <div className="bg-white w-full rounded-xl shadow px-6 py-4 flex items-center justify-between border-b-2 border-gray-200">
      <div className="flex flex-col">
        <span className="text-sm text-[#5C4B4B] font-medium mb-1">
          Available Balance
        </span>
        <span className="text-2xl font-bold text-secondary">
          {mockUserProfile.tokenBalance.toLocaleString()}{' '}
          <span className="text-base font-semibold">YAP</span>
        </span>
      </div>
      <img src={coin.src} alt="Coin" className="w-10 h-10" />
    </div>
  );
}
