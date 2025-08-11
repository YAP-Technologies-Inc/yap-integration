import { useWallets } from "@privy-io/react-auth";
import { useOnChainBalance } from "@/hooks/useOnBlockChain";

export default function BalanceCard() {
  const { wallets } = useWallets();
  const wallet = wallets.find((w) => w.walletClientType === "privy");
  const evmAddress = wallet?.address ?? null;

  const { balance, isError } = useOnChainBalance(evmAddress);

  // ✅ Don't render if balance is undefined (still loading)
  if (balance === undefined) return null;

  if (isError) {
    return (
      <div className="bg-white w-full rounded-3xl shadow px-4 py-4 flex items-center justify-between border-b-3 border-red-200 text-red-500">
        <span>Error fetching balance</span>
      </div>
    );
  }

  return (
    <div className="bg-white w-full rounded-3xl shadow px-4 py-4 flex items-center justify-between border-b-3 border-[#e3ded3]">
      <div className="flex flex-col">
        <span className="text-sm text-secondary font-normal mb-1">
          Available Balance
        </span>
        <span className="text-2xl font-bold text-secondary">
          {balance}
          <span className="text-base font-semibold"> YAP</span>
        </span>
      </div>
      <img
        src="/assets/coin.png"
        alt="Coin"
        className="w-14 h-14"
      />
    </div>
  );
}
