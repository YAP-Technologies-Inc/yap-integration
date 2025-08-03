'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import BottomNavBar from '@/components/layout/BottomNavBar';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import InfoListCard from '@/components/ui/InfoListCard';
import coin from '@/assets/coin.png';
import {
  TablerInfoCircle,
  TablerHelp,
  TablerFileTextShield,
  TablerChevronLeft,
  TablerBrandDiscordFilled,
} from '@/icons';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useOnChainBalance } from '@/hooks/useOnBlockChain';
import { useUserStats } from '@/hooks/useUserStats';
import { useToast } from '@/components/ui/ToastProvider';

type InfoPage = 'menu' | 'about' | 'help' | 'terms';

export default function ProfilePage() {
  const [activePage, setActivePage] = useState<InfoPage>('menu');
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { pushToast } = useToast();
  const userId = user?.id ?? null;
  const evmAddress =
    wallets.find((w) => w.walletClientType === 'privy')?.address ?? '';
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

  const firstInitial = name.charAt(0).toUpperCase() || '?';
  const totalStreak = stats?.currentStreak ?? 0;

  // If user navigated to info sub-page
  if (activePage !== 'menu') {
    return (
      <div className="min-h-[100dvh] bg-background-primary px-4 pt-2flex flex-col ">
        <button
          onClick={() => setActivePage('menu')}
          className="flex items-center font-bold text-gray-500 mb-6"
        >
          <TablerChevronLeft className="mr-1 hover:cursor-pointer
          lg:top-6 lg:left-6 lg:text-2xl lg:mt-4
          " />
        </button>
        <h1 className="text-xl font-bold text-secondary mb-4 capitalize lg:px-12">
          {activePage}
        </h1>
        <div className="text-sm text-gray-500 leading-relaxed lg:px-12">
          {activePage === 'about' && (
            <p>
              This app is designed to help users achieve fluency in their target
              language through immersive speaking practice. By engaging in
              conversations, users can improve their speed, fluency, accent, and
              overall language proficiency. The app leverages an advanced AI
              system to evaluate your speech on multiple dimensions, including
              pronunciation accuracy, intonation, and how closely your accent
              matches that of a native speaker. This detailed feedback ensures a
              comprehensive learning experience. Additionally, users can earn
              on-chain rewards for their progress, making the journey of
              mastering a new language both effective and highly rewarding.
              <br />
              <br />
              Built with love ❤️ by the YAP team.
            </p>
          )}
          {activePage === 'help' && (
            <div className="flex flex-col items-start">
              <p>
                Need assistance? We&apos;re here to help! For any questions or
                to report bugs, feel free to reach out to us.
              </p>
              <a
                href="https://discord.com/invite/6uZFtMhM2z"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center text-blue-500 hover:underline"
              >
                <TablerBrandDiscordFilled className="mr-2" />
                Join our Discord for support
              </a>
            </div>
          )}
          {activePage === 'terms' && (
            <div>
              <p>
                By using this app, you agree to the following terms and
                conditions:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-500">
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
              <p className="mt-2">
                Please note that this app is currently in testing, and your
                feedback is highly appreciated to improve the experience.
              </p>
            </div>
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
          <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-semibold">
              {firstInitial}
            </span>
          </div>
          <div className="mt-1 text-lg font-semibold text-secondary">
            {name}
          </div>
        </div>

        <div className="mt-2 w-full flex justify-center">
          <button
            className="w-full text-black bg-white px-6 py-3 border-gray-200 border-2 rounded-xl shadow-sm transition-colors hover:cursor-pointer"
            onClick={() =>
              evmAddress
                ? window.open(
                    `https://seitrace.com/address/${evmAddress}?chain=atlantic-2`,
                    '_blank'
                  )
                : pushToast('No wallet connected.', 'error')
            }
          >
            View Wallet ({walletShort})
          </button>
        </div>

        <div className="w-full mt-2 flex flex-col items-center">
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

        <div className="w-full mt-2 flex flex-col items-start">
          <h2 className="text-md font-bold text-secondary mb-2">Others</h2>
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
