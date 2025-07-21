'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

import HeaderGreeting from '@/components/dashboard/HeaderGreeting';
import BalanceCard from '@/components/dashboard/BalanceCard';
import DailyStreak from '@/components/dashboard/DailyStreak';
import BottomNavBar from '@/components/layout/BottomNavBar';
import LessonCard from '@/components/dashboard/LessonCard';
import DailyQuizCard from '../../components/dashboard/DailyQuizPrompt';
import { lessons } from '../../mock/mockLesson';

export default function HomePage() {
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const { wallets } = useWallets();
  // const seiWallet = wallets.find((w) => w.chainId === 1328);
  // const seiAddress = seiWallet?.address;
  const seiAddress = '0xBdB8684F477016906c68Aba78d665867e4eB81eA'; // hardcoded test wallet
  console.log('Using hardcoded SEI wallet address:', seiAddress);

  const router = useRouter();

  const handleGetYAP = async () => {
    console.log('Button clicked!');

    if (!seiAddress) {
      console.warn('No SEI wallet connected.');
      alert('No SEI wallet connected!');
      return;
    }

    console.log('Sending request to backend with address:', seiAddress);

    setIsSending(true);
    setSuccess(false);

    try {
      const res = await fetch('http://localhost:4000/api/redeem-yap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: seiAddress }),
      });

      console.log('Response received. Status:', res.status);

      const data = await res.json();
      console.log('Parsed response:', data);

      if (res.ok) {
        console.log('TX successful:', data.txHash);
        setSuccess(true);
      } else {
        console.error('Backend error:', data.error);
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Request failed:', err);
      alert('Something went wrong.');
    }

    setIsSending(false);
  };

  return (
    <div className="bg-background-primary min-h-screen w-full flex flex-col">
      <div className="flex-1 w-full max-w-4xl mx-auto pt-4 px-4 ">
        <HeaderGreeting />

        {/* Balance Card */}
        <div className="mt-2">
          <BalanceCard />
        </div>

        {/* Daily Streak */}
        <div className="mt-4">
          <DailyStreak />
        </div>

        {/* Lessons */}
        <h3 className="text-secondary text-xl font-semibold mt-2 ">Lessons</h3>
        <div className="mt-2">
          <div className="flex gap-4 overflow-x-auto no-scrollbar w-full">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                status={lesson.status}
              />
            ))}
          </div>
        </div>

        {/* Talk to Spanish Teacher Button */}
        <div className="mt-6 mb-2">
          <button
            onClick={() => router.push('/spanish-teacher')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Talk to Spanish Teacher
          </button>
        </div>

        {/* Daily Quiz */}
        <h3 className="text-secondary text-xl font-semibold mt-4 mb-2">
          Daily Quiz
        </h3>
        <div className="relative z-0">
          <DailyQuizCard isUnlocked={false} />
        </div>

        {/* Get 1 YAP Button */}
        <div className="mt-4 mb-6">
          <button
            onClick={handleGetYAP}
            disabled={isSending || !seiAddress}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {isSending ? 'Processing...' : 'Get 1 YAP for 0.1 SEI'}
          </button>
          {success && (
            <p className="text-green-600 text-sm mt-2">
              Successfully received 1 YAP!
            </p>
          )}
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
