'use client';

import { useEffect, useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import BottomNavBar from '@/components/layout/BottomNavBar';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import InfoListCard from '@/components/ui/InfoListCard';
import coin from '@/assets/coin.png';
import ethers from 'ethers';
import {
  TablerInfoCircle,
  TablerHelp,
  TablerFileTextShield,
  TablerChevronLeft,
} from '@/icons';

type InfoPage = 'menu' | 'about' | 'help' | 'terms';

export default function ProfilePage() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const [activePage, setActivePage] = useState<InfoPage>('menu');
  const [profile, setProfile] = useState<{
    name: string;
    language_to_learn: string;
  } | null>(null);
  const [tokenBalance, setTokenBalance] = useState<number>(0);

  const wallet = wallets[0];
  const walletAddress = wallet?.address ?? '';
  const walletShort = walletAddress
    ? walletAddress.slice(0, 6) + '...'
    : 'Unknown';

  const YAP_CONTRACT = '0x47423334c145002467a24bA1B41Ac93e2f503cc6';
  const SEI_RPC = 'https://evm-rpc.atlantic-2.seinetwork.io'; // Sei testnet RPC

  const CW20_ABI = [
    'function balanceOf(address) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ];

  const fetchYapBalanceEvm = async (walletAddress: string): Promise<number> => {
    try {
      const provider = new ethers.JsonRpcProvider(SEI_RPC);
      const contract = new ethers.Contract(YAP_CONTRACT, CW20_ABI, provider);

      const [rawBalance, decimals] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
      ]);

      return Number(rawBalance) / 10 ** decimals;
    } catch (err) {
      console.error('Failed to fetch YAP balance via EVM:', err);
      return 0;
    }
  };

  useEffect(() => {
    if (wallets?.length) {
      const addr = wallets[0].address;
      localStorage.setItem('evmAddress', addr);
    }
  }, [wallets]);
  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:4000/api/profile/${user.id}`);
        const data = await res.json();
        if (res.ok) setProfile(data);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, [user]);

  // replace this with actual SEI CW20 balance call
  useEffect(() => {
    const wallet = wallets?.[0];
    if (!wallet?.address) return;

    const loadBalance = async () => {
      const balance = await fetchYapBalanceEvm(wallet.address);
      setTokenBalance(balance);
    };

    loadBalance();
  }, [wallets]);

  if (activePage !== 'menu') {
    return (
      <div className="min-h-screen bg-background-primary p-6 flex flex-col">
        <button
          onClick={() => setActivePage('menu')}
          className="flex items-center text-gray-600 mb-6"
        >
          <TablerChevronLeft className="mr-1" />
          Back
        </button>
        <h1 className="text-xl font-bold text-secondary mb-4 capitalize">
          {activePage}
        </h1>
        <div className="text-sm text-[#444] leading-relaxed">
          {activePage === 'about' && (
            <p>
              This app helps you learn languages while earning rewards. Built
              with love at YAP Tech.
            </p>
          )}
          {activePage === 'help' && (
            <p>
              Need help? Contact us at support@goyap.ai or check out the FAQ on
              our site.
            </p>
          )}
          {activePage === 'terms' && (
            <p>By using this app, you agree to our terms and conditions.</p>
          )}
        </div>
      </div>
    );
  }

  const firstInitial = profile?.name?.charAt(0).toUpperCase() ?? '?';

  return (
    <div className="bg-background-primary min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4 pt-4">
        {/* Title */}
        <div className="text-xl font-bold text-secondary text-center">
          Account
        </div>

        {/* Avatar + Name */}
        <div className="mt-4 flex flex-col items-center">
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {firstInitial}
            </span>
          </div>
          <div className="mt-2 text-lg font-light text-secondary">
            {profile?.name ?? 'Loading...'}
          </div>
        </div>

        {/* Wallet */}
        <div className="mt-2 w-full flex justify-center">
          <Button
            label={`View Wallet (${walletShort})`}
            className="w-full text-black bg-white px-6 py-3 border-black rounded-xl shadow-md transition-colors"
            onClick={() =>
              walletAddress
                ? window.open(
                    `https://seitrace.com/address/${walletAddress}?chain=atlantic-2`,
                    '_blank'
                  )
                : alert('No wallet connected.')
            }
          />
        </div>

        {/* Stats */}
        <div className="w-full mt-6">
          <h2 className="text-md font-bold text-secondary mb-4">Statistics</h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            <StatCard icon="⏰" label="Practiced" value="12" />
            <StatCard icon="🔥" label="Streak" value="5" />
            <StatCard
              icon={coin.src}
              label="Total $YAP"
              value={tokenBalance}
              isImage
            />
          </div>
        </div>

        {/* Others */}
        <div className="w-full mt-6 pb-20">
          <h2 className="text-md font-bold text-secondary mb-3">Others</h2>
          <InfoListCard
            items={[
              {
                icon: <TablerInfoCircle />,
                label: 'About app',
                onClick: () => setActivePage('about'),
              },
              {
                icon: <TablerHelp />,
                label: 'Help & Support',
                onClick: () => setActivePage('help'),
              },
              {
                icon: <TablerFileTextShield />,
                label: 'Terms & Conditions',
                onClick: () => setActivePage('terms'),
              },
            ]}
          />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
