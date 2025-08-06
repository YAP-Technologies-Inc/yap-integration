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
  TablerBrandDiscordFilled,
  TablerChevronRight,
} from "@/icons";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useOnChainBalance } from "@/hooks/useOnBlockChain";
import { useUserStats } from "@/hooks/useUserStats";
import { useToast } from "@/components/ui/ToastProvider";

type InfoPage = "menu" | "about" | "help" | "terms";

export default function ProfilePage() {
  const [activePage, setActivePage] = useState<InfoPage>("menu");
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { pushToast } = useToast();
  const userId = user?.id ?? null;
  const evmAddress =
    wallets.find((w) => w.walletClientType === "privy")?.address ?? "";
  const {
    balance: onChainBalance,
    isLoading: isBalanceLoading,
    isError: balanceError,
  } = useOnChainBalance(evmAddress);
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useUserStats(userId);

  const {
    name,
    language,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfile(userId);

  const isLoading = profileLoading || isBalanceLoading || !evmAddress;
  const hasError = profileError || balanceError;

  const walletShort = evmAddress
    ? `${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}`
    : null;

  if (isLoading || !walletShort) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading profile…</p>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>Failed to load account data.</p>
      </div>
    );
  }

  const firstInitial = name.charAt(0).toUpperCase() || "?";
  const totalStreak = stats?.currentStreak ?? 0;

  // If user navigated to info sub-page
  if (activePage !== "menu") {
    return (
      <div className="min-h-[100dvh] bg-background-primary px-4 pt-4 flex flex-col">
        {/* Back Button + Title Row */}
        <div className="flex items-center px-1 mb-4 gap-3">
          <button
            onClick={() => setActivePage("menu")}
            aria-label="Back"
            className="flex items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-muted transition-colors active:scale-95"
          >
            <TablerChevronLeft className="w-5 h-5 text-secondary" />
          </button>
          <h1 className="text-lg font-semibold text-secondary capitalize tracking-tight">
            {activePage}
          </h1>
        </div>

        {/* Page Content */}
        <div className="text-sm text-muted-foreground text-gray-500 leading-relaxed px-1 lg:px-12 space-y-4">
          {activePage === "about" && (
            <p>
              This app is designed to help users achieve fluency in their target
              language through immersive speaking practice. By engaging in
              conversations, users can improve their speed, fluency, accent, and
              overall language proficiency. The app leverages an advanced AI
              system to evaluate your speech on multiple dimensions, including
              pronunciation accuracy, intonation, and how closely your accent
              matches that of a native speaker.
              <br />
              <br />
              Built with love ❤️ by the YAP team.
            </p>
          )}

          {activePage === "help" && (
            <div className="flex flex-col items-start space-y-2">
              <p>
                Need assistance? We&apos;re here to help! For any questions or
                to report bugs, feel free to reach out to us.
              </p>
              <a
                href="https://discord.com/invite/6uZFtMhM2z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-500 hover:underline"
              >
                <TablerBrandDiscordFilled className="mr-2" />
                Join our Discord for support
              </a>
            </div>
          )}

          {activePage === "terms" && (
            <>
              <p>
                By using this app, you agree to the following terms and
                conditions:
              </p>
              <ul className="list-disc pl-5 space-y-2 marker:text-secondary">
                <li>This app is provided "as is" without any warranties.</li>
                <li>
                  We are not responsible for any data loss or inaccuracies.
                </li>
                <li>
                  Users must not misuse the app or engage in any illegal
                  activities.
                </li>
                <li>
                  All rewards and features are subject to change during the
                  testing phase.
                </li>
              </ul>
              <p>
                Please note that this app is currently in testing, and your
                feedback is highly appreciated to improve the experience.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }
  return (
    <div className="bg-background-primary min-h-[100dvh] flex flex-col items-center pb-nav">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4">
        <div className="text-xl font-bold text-secondary text-center">
          Account
        </div>

        <div className="mt-1 flex flex-col items-center">
          <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-md bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900">
            <span className="text-white text-3xl font-bold">
              {firstInitial}
            </span>
          </div>

          <div className="mt-1 text-lg font-semibold text-secondary">
            {name}
          </div>
        </div>

        <div className="mt-4 w-full flex justify-center px-4">
          <button
            className="w-full rounded-xl border border-border/40 bg-white/90 px-6 py-4 shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 text-sm font-semibold text-secondary flex items-center justify-center gap-2 backdrop-blur-sm"
            onClick={() =>
              evmAddress
                ? window.open(
                    `https://seitrace.com/address/${evmAddress}?chain=atlantic-2`,
                    "_blank"
                  )
                : pushToast("No wallet connected.", "error")
            }
            style={{ borderColor: "rgba(0,0,0,0.15)" }}
          >
            <span>View Wallet</span>
            <span className="text-muted-foreground">({walletShort})</span>
          </button>
        </div>

        <div className="w-full mt-4 flex flex-col items-center o">
          <h2 className="text-md font-bold text-secondary mb-2 self-start lg:px-0 lg:max-w-4xl w-full">
            Statistics
          </h2>

          <div className="flex gap-4 overflow-x-auto no-scrollbar px-4 w-full justify-start lg:justify-between lg:max-w-4xl lg:px-0">
            <StatCard icon="🔥" label="Streak" value={totalStreak} />
            <StatCard icon="📚" label="Language" value={language} />
            <StatCard
              icon={coin.src}
              label="Total $YAP"
              value={onChainBalance ?? 0}
              isImage
            />
          </div>
        </div>

        <div className="w-full mt-4 flex flex-col items-start">
          <h2 className="text-md font-bold text-secondary mb-2">Others</h2>
          <div className="flex flex-col gap-2 w-full px-2">
            {[
              {
                icon: (
                  <TablerInfoCircle className="w-5 h-5 text-muted-foreground" />
                ),
                label: "About app",
                onClick: () => setActivePage("about"),
              },
              {
                icon: <TablerHelp className="w-5 h-5 text-muted-foreground" />,
                label: "Help & Support",
                onClick: () => setActivePage("help"),
              },
              {
                icon: (
                  <TablerFileTextShield className="w-5 h-5 text-muted-foreground" />
                ),
                label: "Terms & Conditions",
                onClick: () => setActivePage("terms"),
              },
            ].map(({ icon, label, onClick }) => (
              <button
                key={label}
                onClick={onClick}
                className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white/90 border border-border backdrop-blur-sm shadow-sm hover:bg-muted transition-all group active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  {icon}
                  <span className="text-sm font-medium text-secondary">
                    {label}
                  </span>
                </div>
                <TablerChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
