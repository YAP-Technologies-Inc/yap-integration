// hooks/useIdentity.ts
"use client";

import { useEffect, useMemo, useState } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

/**
 * Returns:
 * - userId: DID from Privy (or localStorage fallback until Privy is ready)
 * - walletAddress: derived from Privy (embedded preferred, else first external)
 * - ready/authenticated: from Privy
 */
export function useIdentity() {
  const { user, ready, authenticated } = usePrivy();
  const { wallets } = useWallets();

  // 1) Start with LS so pages don't render blank
  const [cachedUserId, setCachedUserId] = useState<string | null>(null);
  useEffect(() => {
    try {
      const v = localStorage.getItem("user_id");
      if (v) setCachedUserId(v);
    } catch {}
  }, []);

  // 2) Prefer Privy DID when ready, else LS fallback
  const userId = user?.id ?? cachedUserId ?? null;

  // 3) Keep LS in sync (so first paint is fast next time)
  useEffect(() => {
    if (!user?.id) return;
    try {
      localStorage.setItem("user_id", user.id);
      setCachedUserId(user.id);
    } catch {}
  }, [user?.id]);

  // 4) Derive wallet address from Privy (embedded > external)
  const walletAddress = useMemo(() => {
    if (!ready) return "";
    const embedded = wallets.find((w) => w.walletClientType === "privy")?.address;
    const external = wallets.find((w) => w.walletClientType !== "privy")?.address;
    return embedded || external || "";
  }, [ready, wallets]);

  return {
    userId,            // DID
    walletAddress,     // derived from Privy
    ready,
    authenticated,
  };
}
