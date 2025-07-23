// src/hooks/useInitializeUser.ts
'use client';

import { useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';

export function useInitializeUser() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    async function init() {
      if (!user?.id || !wallets?.[0]?.address) return;

      const userId = user.id;
      const evmAddress = wallets[0].address;
      const API_BASE = 'http://localhost:4000';

      // 1) Persist IDs & address
      console.log('[init] Saving userId & evmAddress');
      localStorage.setItem('userId', userId);
      localStorage.setItem('evmAddress', evmAddress);

      // 2) Fetch + store profile
      try {
        console.log(`[init] Fetching profile for ${userId}`);
        const res = await fetch(
          `${API_BASE}/api/profile/${encodeURIComponent(userId)}`
        );
        console.log('[init] profile status:', res.status);
        if (res.ok) {
          const { name, language_to_learn } = await res.json();
          console.log('[init] profile data:', { name, language_to_learn });
          localStorage.setItem('name', name);
          localStorage.setItem('language', language_to_learn);
        } else {
          console.warn('[init] profile fetch failed:', await res.text());
        }
      } catch (e) {
        console.error('init: failed to fetch profile', e);
      }

      // 3) Fetch + store completed lessons
      try {
        console.log(`[init] Fetching completed lessons for ${userId}`);
        const res = await fetch(
          `${API_BASE}/api/user-lessons/${encodeURIComponent(userId)}`
        );
        console.log('[init] lessons status:', res.status);
        if (res.ok) {
          const { completedLessons } = await res.json();
          console.log('[init] completedLessons:', completedLessons);
          localStorage.setItem(
            'completedLessons',
            JSON.stringify(completedLessons)
          );
        } else {
          console.warn('[init] lessons fetch failed:', await res.text());
        }
      } catch (e) {
        console.error('init: failed to fetch lessons', e);
      }

      // 4) Fetch + store user stats
      try {
        console.log(`[init] Fetching user stats for ${userId}`);
        const res = await fetch(
          `${API_BASE}/api/user-stats/${encodeURIComponent(userId)}`
        );
        console.log('[init] stats status:', res.status);
        if (res.ok) {
          const stats = await res.json();
          console.log('[init] stats data:', stats);
          localStorage.setItem('tokenBalance', stats.token_balance.toString());
          localStorage.setItem(
            'currentStreak',
            stats.current_streak.toString()
          );
          localStorage.setItem(
            'highestStreak',
            stats.highest_streak.toString()
          );
          localStorage.setItem(
            'totalYapEarned',
            stats.total_yap_earned.toString()
          );
          localStorage.setItem('statsLastUpdated', stats.updated_at);
        } else {
          console.warn('[init] stats fetch failed:', await res.text());
        }
      } catch (e) {
        console.error('init: failed to fetch user stats', e);
      }

      // 5) Fetch + store on‑chain YAP balance
      try {
        console.log(`[init] Fetching on‑chain balance for ${evmAddress}`);
        const SEI_RPC = 'https://evm-rpc-testnet.sei-apis.com';
        const YAP_CONTRACT = '0x47423334c145002467a24bA1B41Ac93e2f503cc6';
        const CW20_ABI = [
          'function balanceOf(address) view returns (uint256)',
          'function decimals() view returns (uint8)',
        ];

        const provider = new JsonRpcProvider(SEI_RPC);
        const contract = new Contract(YAP_CONTRACT, CW20_ABI, provider);

        const [rawBalance, decimals] = await Promise.all([
          contract.balanceOf(evmAddress),
          contract.decimals(),
        ]);

        const onChainBalance = parseFloat(formatUnits(rawBalance, decimals));
        console.log('[init] on‑chain balance:', onChainBalance);
        localStorage.setItem('onChainBalance', onChainBalance.toString());
      } catch (e) {
        console.error('init: failed to fetch on‑chain balance', e);
      }
    }

    init();
  }, [user, wallets]);
}
