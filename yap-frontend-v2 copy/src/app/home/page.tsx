'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallets } from '@privy-io/react-auth';

import HeaderGreeting from '@/components/dashboard/HeaderGreeting';
import BalanceCard from '@/components/dashboard/BalanceCard';
import DailyStreak from '@/components/dashboard/DailyStreak';
import BottomNavBar from '@/components/layout/BottomNavBar';
import LessonCard from '@/components/dashboard/LessonCard';
import DailyQuizCard from '@/components/dashboard/DailyQuizPrompt';
import allLessons from '@/mock/allLessons';

import { useInitializeUser } from '@/hooks/useUserInitalizer';
import { useCompletedLessons } from '@/hooks/useCompletedLessons';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserStats } from '@/hooks/useUserStats';
import { useOnChainBalance } from '@/hooks/useOnBlockChain';
import isEqual from 'lodash.isequal';
import { ethers } from 'ethers';
import { tokenAbi } from '@/app/abis/YAPToken';
import { useToast } from '@/components/ui/ToastProvider';
import TestingNoticeModal from '@/components/TestingNoticeModal';
export default function HomePage() {
  useInitializeUser();
  const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!;
  const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS!;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { pushToast } = useToast();
  const [lessons, setLessons] = useState<
    {
      id: string;
      title: string;
      description: string;
      status: 'locked' | 'available' | 'completed';
    }[]
  >([]);

  const { wallets } = useWallets();
  const router = useRouter();

  const userId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const evmAddress =
    typeof window !== 'undefined' ? localStorage.getItem('evmAddress') : null;

  // Fetch user-related data with SWR hooks
  const { completedLessons, isLoading: isLessonsLoading } =
    useCompletedLessons(userId);
  const { profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { stats, isLoading: isStatsLoading } = useUserStats(userId);
  const { balance: onChainBalance, isLoading: isBalanceLoading } =
    useOnChainBalance(evmAddress);
  const [hasAccess, setHasAccess] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [dailyQuizCompleted, setDailyQuizCompleted] = useState(false);
  // Compute lesson availability based on completed lessons
  useEffect(() => {
    if (!completedLessons) return;

    const completedSet = new Set<string>(completedLessons);

    const computed = Object.values(allLessons).map((lesson: any) => {
      const isCompleted = completedSet.has(lesson.lesson_id);
      const isFirst = lesson.lesson_id === 'SPA1_001';
      const prereqs = lesson.prerequisite_lessons || [];

      const isAvailable =
        isFirst ||
        (!isCompleted && prereqs.every((p: string) => completedSet.has(p)));

      return {
        id: lesson.lesson_id,
        title: lesson.title,
        description: lesson.description,
        status: isCompleted
          ? 'completed'
          : isAvailable
          ? 'available'
          : 'locked',
      };
    });

    // Only update state if it's actually changed
    if (!isEqual(computed, lessons)) {
      setLessons(computed);
    }
  }, [completedLessons, lessons]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/api/daily-quiz-status/${userId}`)
      .then(res => res.json())
      .then(data => setDailyQuizCompleted(data.completed))
      .catch(() => {});
  }, [userId]);


  // Unified loading state
  if (
    isLessonsLoading ||
    isProfileLoading ||
    isStatsLoading ||
    isBalanceLoading
  ) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }


  const handleSpanishTeacherAccess = async () => {
    setCheckingAccess(true);

    try {
      if (!TOKEN_ADDRESS || !TREASURY_ADDRESS) {
        pushToast('Payment not configured.', 'error');
        return;
      }

      if (!userId) {
        pushToast('You must be logged in.', 'error');
        return;
      }

      // Step 1: Check if user already has access
      let hasAccess = false;
      try {
        const sessionRes = await fetch(
          `${API_URL}/api/teacher-session/${userId}`
        );
        if (sessionRes.ok) {
          const { hasAccess: accessFlag } = await sessionRes.json();
          hasAccess = accessFlag;
        }
      } catch (err) {
        console.warn('Could not reach session check:', err);
      }

      if (hasAccess) {
        router.push('/spanish-teacher');
        return;
      }

      // Step 2: Get signer from Privy wallet
      const embedded = wallets.find((w) => w.walletClientType === 'privy');
      if (!embedded) {
        pushToast('Please connect your wallet.', 'error');
        return;
      }

      const ethProvider = await embedded.getEthereumProvider();
      const provider = new ethers.BrowserProvider(ethProvider);
      const signer = await provider.getSigner();
      const walletAddress = await signer.getAddress();

      // Step 3: Sign authorization message
      const message = `Authorize spending 1 YAP token for Spanish Teacher access for 20 minutes.`;
      const signature = await signer.signMessage(message);
      console.log('Signature:', signature);

      const token = new ethers.Contract(TOKEN_ADDRESS, tokenAbi, signer);
      const oneYap = ethers.parseUnits('1', 18);

      // Step 1: Check existing allowance
      const currentAllowance = await token.allowance(
        walletAddress,
        TREASURY_ADDRESS
      );
      if (currentAllowance < oneYap) {
        // Step 2: Approve backend wallet to spend 1 YAP
        const approveTx = await token.approve(TREASURY_ADDRESS, oneYap);
        await approveTx.wait();
      }
      // Step 4: Send to backend for gasless processing
      const res = await fetch(`${API_URL}/api/request-spanish-teacher`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          signature,
          message,
          walletAddress,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        pushToast(`Backend error: ${err.error}`, 'error');
        return;
      }

      // Step 5: Redirect to teacher page
      router.push('/spanish-teacher');
    } catch (err) {
      console.error('Access error:', err);
      pushToast('Could not process access request.', 'error');
    } finally {
      setCheckingAccess(false);
    }
  };

  const dailyQuizUnlocked = completedLessons?.includes('SPA1_005');
const handleDailyQuizUnlocked = () => {
  if (!dailyQuizUnlocked) {
    pushToast('Complete SPA1_005 to unlock the Daily Quiz!', 'info');
    return;
  }
  if (dailyQuizCompleted) {
    pushToast('You’ve already completed today’s Daily Quiz!', 'info');
    return;
  }
  router.push('/daily-quiz');
};

  
  return (
    <div className="bg-background-primary min-h-[100dvh] w-full flex flex-col overflow-y-auto pb-nav">
      <div className="flex-1 w-full max-w-4xl mx-auto px-4">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>
        <TestingNoticeModal />
        <h3 className="text-secondary text-xl font-semibold mt-2">Lessons</h3>
        <div className="mt-2">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lessonId={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                status={lesson.status}
                onClick={() => router.push(`/lesson/${lesson.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Talk to Spanish Teacher */}
        <div className="mt-4">
          <button
            onClick={handleSpanishTeacherAccess}
            className="w-full bg-secondary hover:bg-secondary-darker text-white font-bold py-3 rounded hover:cursor-pointer transition-colors duration-200 shadow-md"
            disabled={checkingAccess}
          >
            {checkingAccess
              ? 'Checking access…'
              : 'Talk to Spanish Teacher (1 YAP)'}
          </button>
        </div>

        {/* Daily Quiz */}
        <h3 className="text-secondary text-xl font-semibold mt-2 mb-2">
          Daily Quiz
        </h3>
        <div className="relative z-0 " onClick={handleDailyQuizUnlocked}>
          <DailyQuizCard
            isUnlocked={dailyQuizUnlocked}
            isCompleted={dailyQuizCompleted}
          />
        </div>
      </div>

      <BottomNavBar />
    </div>
  );
}
