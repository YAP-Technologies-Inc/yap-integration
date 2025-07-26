// src/app/profile/page.tsx
"use client";

import { useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import BottomNavBar from "@/components/layout/BottomNavBar";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import InfoListCard from "@/components/ui/InfoListCard";
import coin from "@/assets/coin.png";
import {
  TablerInfoCircle,
  TablerHelp,
  TablerFileTextShield,
  TablerChevronLeft,
} from "@/icons";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useOnChainBalance } from "@/hooks/useOnBlockChain";

type InfoPage = "menu" | "about" | "help" | "terms";

export default function ProfilePage() {
  const [activePage, setActivePage] = useState<InfoPage>("menu");
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const userId = user?.id ?? null;
  // find the Privy‐embedded wallet and grab its address
  const evmAddress =
    wallets.find((w) => w.walletClientType === "privy")?.address ?? "";

  // pull on‐chain balance (in YAP) for that address
  const {
    balance: onChainBalance,
    isLoading: isBalanceLoading,
    isError: balanceError,
  } = useOnChainBalance(evmAddress);

  // still fetch profile for name / language
  const {
    name,
    language,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfile(userId);

  // global loading / error
  if (profileLoading || isBalanceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile…</p>
      </div>
    );
  }
  if (profileError || balanceError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Failed to load account data.</p>
      </div>
    );
  }

  // shorthand for display
  const walletShort = evmAddress
    ? `${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}`
    : "Unknown";
  const firstInitial = name.charAt(0).toUpperCase() || "?";

  // use the on‐chain balance instead of stats.tokenBalance
  const tokenBalance = onChainBalance ?? 0;

  // menu vs info pages
  if (activePage !== "menu") {
    return (
      <div className="min-h-screen bg-background-primary p-6 flex flex-col">
        <button
          onClick={() => setActivePage("menu")}
          className="flex items-center text-gray-600 mb-6"
        >
          <TablerChevronLeft className="mr-1" />
          Back
        </button>
        <h1 className="text-xl font-bold text-secondary mb-4 capitalize">
          {activePage}
        </h1>
        <div className="text-sm text-[#444] leading-relaxed">
          {activePage === "about" && (
            <p>
              This app helps you learn languages while earning rewards. Built
              with love at YAP Tech.
            </p>
          )}
          {activePage === "help" && (
            <p>
              Need help? Contact us at support@goyap.ai or check out the FAQ on
              our site.
            </p>
          )}
          {activePage === "terms" && (
            <p>By using this app, you agree to our terms and conditions.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4">
        <div className="text-xl font-bold text-secondary text-center">
          Account
        </div>

        <div className="mt-4 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {firstInitial}
            </span>
          </div>
          <div className="mt-2 text-lg font-light text-secondary">{name}</div>
          {language && (
            <div className="text-sm text-[#666] mt-1">Learning: {language}</div>
          )}
        </div>

        <div className="mt-4 w-full flex justify-center">
          <Button
            label={`View Wallet (${walletShort})`}
            className="w-full text-black bg-white px-6 py-3 border-black rounded-xl shadow-md transition-colors"
            onClick={() =>
              evmAddress
                ? window.open(
                    `https://seitrace.com/address/${evmAddress}?chain=atlantic-2`,
                    "_blank"
                  )
                : alert("No wallet connected.")
            }
          />
        </div>

        <div className="w-full mt-6">
          <h2 className="text-md font-bold text-secondary mb-4 text-center">
            Statistics
          </h2>
          <div className="flex items-center justify-center gap-4">
            <StatCard icon="🔥" label="Streak" value={0 /* you can keep streak from stats */} />
            <StatCard
              icon={coin.src}
              label="Total $YAP"
              value={tokenBalance}
              isImage
            />
          </div>
        </div>

        <div className="w-full mt-6 pb-20">
          <h2 className="text-md font-bold text-secondary mb-3">Others</h2>
          <InfoListCard
            items={[
              {
                icon: <TablerInfoCircle />,
                label: "About app",
                onClick: () => setActivePage("about"),
              },
              {
                icon: <TablerHelp />,
                label: "Help & Support",
                onClick: () => setActivePage("help"),
              },
              {
                icon: <TablerFileTextShield />,
                label: "Terms & Conditions",
                onClick: () => setActivePage("terms"),
              },
            ]}
          />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
