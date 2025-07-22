'use client';

import { useState } from 'react';
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
} from '@/icons';

type InfoPage = 'menu' | 'about' | 'help' | 'terms';

export default function ProfilePage() {
  const [activePage, setActivePage] = useState<InfoPage>('menu');

  // Safely read from localStorage (guard for SSR)
  const name =
    typeof window !== 'undefined' ? localStorage.getItem('name') || '' : '';
  const language =
    typeof window !== 'undefined' ? localStorage.getItem('language') || '' : '';
  const evmAddr =
    typeof window !== 'undefined'
      ? localStorage.getItem('evmAddress') || ''
      : '';
  const tokenBalance =
    typeof window !== 'undefined'
      ? parseFloat(localStorage.getItem('tokenBalance') || '0')
      : 0;
  const totalStreak =
    typeof window !== 'undefined'
      ? parseInt(localStorage.getItem('total-streak') || '0')
      : 0;

  const walletShort = evmAddr ? `${evmAddr.slice(0, 6)}...` : 'Unknown';
  const firstInitial = name ? name.charAt(0).toUpperCase() : '?';

  // If we're on one of the sub‑pages (about/help/terms), show that
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
            {name || 'Loading…'}
          </div>
          {language && (
            <div className="text-sm text-[#666] mt-1">Learning: {language}</div>
          )}
        </div>

        {/* Wallet */}
        <div className="mt-4 w-full flex justify-center">
          <Button
            label={`View Wallet (${walletShort})`}
            className="w-full text-black bg-white px-6 py-3 border-black rounded-xl shadow-md transition-colors"
            onClick={() =>
              evmAddr
                ? window.open(
                    `https://seitrace.com/address/${evmAddr}?chain=atlantic-2`,
                    '_blank'
                  )
                : alert('No wallet connected.')
            }
          />
        </div>

        {/* Stats */}
        <div className="w-full mt-6">
          <h2 className="text-md font-bold text-secondary mb-4">Statistics</h2>
            <div className="grid grid-cols-3 gap-4 items-end justify-center">
            <StatCard icon="🔥" label="Streak" value={totalStreak} />
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
