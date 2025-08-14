// hooks/useProfileCardData.ts
"use client";

import { useIdentity } from "./useIdentity";
import { useProfile } from "./useProfile";

export function useProfileCardData() {
  const { userId, walletAddress, ready, authenticated } = useIdentity();
  const {
    name,
    language,
    accountCreated,
    isLoading: profileLoading,
    isError: profileError,
    notFound,
  } = useProfile(userId);

  const walletShort = walletAddress
    ? `${walletAddress.slice(0, 4)}…${walletAddress.slice(-4)}`
    : null;

  const isLoading = !ready || profileLoading; // wait for Privy readiness + profile fetch
  const isError = profileError;

  return {
    // identity
    userId,
    ready,
    authenticated,
    walletAddress,
    walletShort,

    // profile
    name,
    language,
    accountCreated,
    notFound,

    // status
    isLoading,
    isError,
  };
}
