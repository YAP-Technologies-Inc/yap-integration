'use client';
import { useState } from 'react';
import BottomNavBar from '../../components/layout/BottomNavBar';
import { mockUserProfile } from '@/mock/mockUser';
import Button from '../../components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import coin from '@/assets/coin.png';
import InfoListCard from '@/components/ui/InfoListCard';
import {
  TablerInfoCircle,
  TablerHelp,
  TablerFileTextShield,
  TablerChevronLeft,
} from '@/icons';

const firstInitial = mockUserProfile.name.charAt(0).toUpperCase();
const userName = mockUserProfile.name;
const walletSubstring = mockUserProfile.wallet.substring(0, 6);

type InfoPage = 'menu' | 'about' | 'help' | 'terms';

export default function ProfilePage() {
  const [activePage, setActivePage] = useState<InfoPage>('menu');

  const renderInfoContent = () => {
    switch (activePage) {
      case 'about':
        return (
          <p>
            This app helps you learn languages while earning rewards. Built with
            love at YAP Tech.
          </p>
        );
      case 'help':
        return (
          <p>
            Need help? Contact us at support@goyap.ai or check out the FAQ on
            our site.
          </p>
        );
      case 'terms':
        return <p>By using this app, you agree to our terms and conditions.</p>;
      default:
        return null;
    }
  };

  // Render the About / Help / Terms content
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
          {activePage.replace('-', ' ')}
        </h1>
        <div className="text-sm text-[#444] leading-relaxed">
          {renderInfoContent()}
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
            {userName}
          </div>
        </div>

        {/* Wallet button */}
        <div className="mt-2 w-full flex justify-center">
          <Button
            label={`View Wallet (${walletSubstring}...)`}
            className="w-full text-black bg-white px-6 py-3 border-black rounded-xl shadow-md transition-colors"
            onClick={() => alert('View Wallet Clicked')}
          />
        </div>

        {/* Stats cards */}
        <div className="w-full mt-6">
          <h2 className="text-md font-bold text-secondary mb-4">Statistics</h2>
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            <StatCard
              icon="⏰"
              label="Practiced"
              value={mockUserProfile.streakDays}
            />
            <StatCard
              icon="🔥"
              label="Streak"
              value={mockUserProfile.highestStreak}
            />
            <StatCard
              icon={coin.src}
              label="Total $YAP"
              value={mockUserProfile.tokenBalance}
              isImage
            />
          </div>
        </div>

        {/* Others section */}
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
