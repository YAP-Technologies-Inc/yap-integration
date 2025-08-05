'use client';

import { useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useUserContext } from '@/context/UserContext';

export function useInitializeUser() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { setUserId } = useUserContext();

  useEffect(() => {
    if (!user?.id || !wallets?.[0]?.address) return;

    setUserId(user.id);
  }, [user, wallets]);
}
