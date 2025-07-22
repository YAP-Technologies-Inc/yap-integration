// src/hooks/useInitializeUser.ts
'use client';

import { useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { JsonRpcProvider, Contract, formatUnits } from 'ethers';

export function useInitializeUser() {
  const { user }    = usePrivy();
  const { wallets } = useWallets();

  useEffect(() => {
    async function init() {
      if (!user?.id || !wallets?.[0]?.address) return;

      const userId      = user.id;
      const evmAddress  = wallets[0].address;

      // 1) Persist IDs & address
      localStorage.setItem('userId', userId);
      localStorage.setItem('evmAddress', evmAddress);

      // 2) Fetch + store profile
      try {
        const res = await fetch(`http://localhost:4000/api/profile/${userId}`);
        if (res.ok) {
          const { name, language_to_learn } = await res.json();
          localStorage.setItem('name', name);
          localStorage.setItem('language', language_to_learn);
        }
      } catch (e) {
        console.error('init: failed to fetch profile', e);
      }

      // 3) Fetch + store completed lessons
      try {
        const res = await fetch(`http://localhost:4000/api/user-lessons/${userId}`);
        if (res.ok) {
          const { completedLessons } = await res.json();
          localStorage.setItem(
            'completedLessons',
            JSON.stringify(completedLessons)
          );
        }
      } catch (e) {
        console.error('init: failed to fetch lessons', e);
      }

      // 4) Fetch + store on-chain YAP balance
      try {
        const SEI_RPC      = 'https://evm-rpc-testnet.sei-apis.com';
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

        const balance = parseFloat(formatUnits(rawBalance, decimals));
        localStorage.setItem('tokenBalance', balance.toString());
      } catch (e) {
        console.error('init: failed to fetch on-chain balance', e);
      }
    }
    init();
  }, [user, wallets]);
}
