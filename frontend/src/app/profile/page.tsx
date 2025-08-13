"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { TablerChevronRight, TablerArrowUpRight, TablerCopy } from "@/icons";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useOnChainBalance } from "@/hooks/useOnBlockChain";
import { useUserStats } from "@/hooks/useUserStats";
import { useSnackbar } from "@/components/ui/SnackBar";
import ReactMarkdown from "react-markdown";

type InfoPage = "menu" | "about" | "terms" | "privacy";

const PAGE_TITLE: Record<Exclude<InfoPage, "menu">, string> = {
  about: "About app",
  terms: "Terms & Conditions",
  privacy: "Privacy Policy",
};

/** ---------- FLOATING CARD CONTROLS ---------- */
const CARD_HEIGHT = 92; // px
const CARD_X_INSET = 16; // px
const CARD_ROUNDED = "rounded-3xl";
const CARD_PULL_DOWN = 46; // px (pushes card farther down)

export default function ProfilePage() {
  const [activePage, setActivePage] = useState<InfoPage>("menu");
  const [mdText, setMdText] = useState<string>("");
  const [mdLoading, setMdLoading] = useState(false);
  const [mdError, setMdError] = useState<string | null>(null);

  const { showSnackbar } = useSnackbar();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const userId = user?.id ?? null;
  const evmAddress =
    wallets.find((w) => w.walletClientType === "privy")?.address ?? "";

  const {
    balance: onChainBalance,
    isLoading: isBalanceLoading,
    isError: balanceError,
  } = useOnChainBalance(evmAddress);
  useUserStats(userId); // kept if you need it later
  const {
    name,
    accountCreated,
    isLoading: profileLoading,
    isError: profileError,
  } = useUserProfile(userId);

  const isLoading = profileLoading || isBalanceLoading || !evmAddress;
  const hasError = profileError || balanceError;

  const walletShort = useMemo(() => {
    if (!evmAddress) return null;
    return `${evmAddress.slice(0, 4)}…${evmAddress.slice(-4)}`;
  }, [evmAddress]);

  const firstInitial = (name || "?").charAt(0).toUpperCase();

  const formatBalance = (v: number | string | null | undefined) => {
    const n = Number(v ?? 0);
    return new Intl.NumberFormat("en-US").format(n);
  };

  // Load markdown when a legal modal is opened
  useEffect(() => {
    if (activePage === "menu") return;

    setMdLoading(true);
    setMdError(null);
    setMdText("");

    fetch(`/api/legal/${activePage}`, { cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const text = await r.text();
        setMdText(text);
      })
      .catch((e) => setMdError(e.message || "Failed to load"))
      .finally(() => setMdLoading(false));
  }, [activePage]);

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

  const halfCard = CARD_HEIGHT / 2;

  return (
    <div className="bg-background-primary min-h-[100dvh] flex flex-col overflow-y-hidden h-[100dvh] overscroll-y-none">
      {/* HEADER WRAPPER (relative so the card can float) */}
      <div className="relative">
        {/* Soft header — keep your color */}
        <div className="bg-background-primary rounded-b-3xl pb-4 px-4">
          <div className="text-xl font-semibold text-secondary text-center">
            Account
          </div>

          {/* Avatar + name + wallet */}
          <div className="mt-4 flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-secondary text-white flex items-center justify-center text-3xl font-light">
              {firstInitial}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl font-bold text-secondary">
                {name}
              </span>
              <span
                className="text-xs text-gray-500 mt-0.5 cursor-pointer hover:underline active:scale-95 transition"
                title="Copy wallet address"
                onClick={() => {
                  if (evmAddress) {
                    navigator.clipboard.writeText(evmAddress);
                    showSnackbar({
                      message: "Wallet address copied!",
                      variant: "success",
                      duration: 2000,
                    });
                  }
                }}
              >
                {walletShort}
                <TablerCopy className="inline w-4 h-4 ml-1 align-middle text-gray-500" />
              </span>
              {accountCreated && (
                <span className="text-[11px] text-gray-400 mt-0.5">
                  Joined {accountCreated}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* FLOATING BALANCE CARD */}
        <div
          className={`absolute z-20 ${CARD_ROUNDED} shadow-[0_6px_16px_rgba(0,0,0,0.08)] border-b-3 border-r-1 border-[#e2ddd3] bg-[#fdfbfa] flex items-center justify-between`}
          style={{
            left: CARD_X_INSET,
            right: CARD_X_INSET,
            height: CARD_HEIGHT,
            top: `calc(100% - ${CARD_HEIGHT / 2}px + ${CARD_PULL_DOWN}px)`,
            padding: "10px 15px",
          }}
        >
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 mb-1">Available Balance</span>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/coin.png"
                  alt="Coin"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-2xl font-extrabold text-secondary tracking-tight">
                {formatBalance(onChainBalance)}
              </span>
            </div>
          </div>

          <button
            aria-label="Open on Seitrace"
            onClick={() => {
              if (evmAddress) {
                window.open(
                  `https://seitrace.com/address/${evmAddress}?chain=atlantic-2`,
                  "_blank"
                );
              } else {
                showSnackbar({
                  message: "No wallet connected.",
                  variant: "error",
                  duration: 3000,
                });
              }
            }}
            className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition"
          >
            <TablerArrowUpRight className="w-5 h-5 text-secondary" />
          </button>
        </div>
      </div>

      {/* SHEET BACKGROUND — FULL WIDTH, STARTS FROM MIDDLE OF CARD DOWN */}
      <div className="flex-1 w-full" style={{ marginTop: halfCard }}>
        <div className="w-full bg-white pt-10 pb-6 flex flex-col min-h-[calc(100vh-120px)]">
          <div className="rounded-2xl bg-white overflow-hidden">
        {[
          { label: "About app", key: "about" as const },
          { label: "Terms & Conditions", key: "terms" as const },
          { label: "Privacy Policy", key: "privacy" as const },
        ].map(({ label, key }, i, arr) => (
          <button
            key={key}
            onClick={() => setActivePage(key)}
            className="relative w-full flex items-center justify-between px-4 py-4 active:scale-[0.995] transition text-left"
          >
            <span className="text-[15px] font-medium text-secondary">
          {label}
            </span>
            <TablerChevronRight className="w-4 h-4 text-gray-400" />
            {i < arr.length - 1 && (
          <span className="absolute left-4 right-4 bottom-0 h-px" />
            )}
          </button>
        ))}
          </div>
        </div>
      </div>

      {/* Legal modal (loads markdown) */}
      {activePage !== "menu" && (
        <div className="fixed inset-0 z-[100] backdrop-blur-sm">
          {/* backdrop */}
          <div
            className="absolute inset-0"
            onClick={() => setActivePage("menu")}
          />
          {/* panel */}
          <div className="absolute inset-x-0 bottom-0 top-[10%] bg-background-primary rounded-t-3xl shadow-xl flex flex-col">
            {/* header */}
            <div className="h-14 px-4 flex items-center gap-3">
              <button
                onClick={() => setActivePage("menu")}
                aria-label="Close"
                className="rounded-md p-2 hover:bg-muted active:scale-95 transition"
              >
                <svg
                  className="w-5 h-5 text-secondary"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <h2 className="text-base font-semibold text-secondary">
                {PAGE_TITLE[activePage as Exclude<InfoPage, "menu">]}
              </h2>
            </div>

            {/* content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {mdLoading && (
                <div className="text-sm text-gray-500">Loading…</div>
              )}
              {mdError && (
                <div className="text-sm text-red-600">
                  Failed to load: {mdError}
                </div>
              )}
              {!mdLoading && !mdError && (
                <div className="text-secondary">
                  <ReactMarkdown>{mdText}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
}
