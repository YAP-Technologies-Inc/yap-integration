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

export default function HomePage() {
  useInitializeUser();

  const [lessons, setLessons] = useState<
    { id: string; title: string; description: string; status: 'locked' | 'available' | 'completed' }[]
  >([]);

  const { wallets } = useWallets();
  const router = useRouter();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const evmAddress = typeof window !== 'undefined' ? localStorage.getItem('evmAddress') : null;

  // Fetch user-related data with SWR hooks
  const { completedLessons, isLoading: isLessonsLoading } = useCompletedLessons(userId);
  const { profile, isLoading: isProfileLoading } = useUserProfile(userId);
  const { stats, isLoading: isStatsLoading } = useUserStats(userId);
  const { balance: onChainBalance, isLoading: isBalanceLoading } = useOnChainBalance(evmAddress);

  // Compute lesson availability based on completed lessons
 useEffect(() => {
  if (!completedLessons) return;

  const completedSet = new Set<string>(completedLessons);

  const computed = Object.values(allLessons).map((lesson: any) => {
    const isCompleted = completedSet.has(lesson.lesson_id);
    const isFirst = lesson.lesson_id === 'SPA1_001';
    const prereqs = lesson.prerequisite_lessons || [];

    const isAvailable =
      isFirst || (!isCompleted && prereqs.every((p: string) => completedSet.has(p)));

    return {
      id: lesson.lesson_id,
      title: lesson.title,
      description: lesson.description,
      status: isCompleted ? 'completed' : isAvailable ? 'available' : 'locked',
    };
  });

  //Only update state if it's actually changed
  if (!isEqual(computed, lessons)) {
    setLessons(computed);
  }
}, [completedLessons, lessons]);

  // Unified loading state
  if (isLessonsLoading || isProfileLoading || isStatsLoading || isBalanceLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-screen w-full flex flex-col">
      <div className="flex-1 w-full max-w-4xl mx-auto pt-4 px-4">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>
        <h3 className="text-secondary text-xl font-semibold mt-6">Lessons</h3>
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
        <div className="mt-8">
          <button
            onClick={() => router.push('/spanish-teacher')}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded"
          >
            Talk to Spanish Teacher
          </button>
        </div>

        {/* Daily Quiz */}
        <h3 className="text-secondary text-xl font-semibold mt-8 mb-2">Daily Quiz</h3>
        <div className="relative z-0">
          <DailyQuizCard isUnlocked={false} />
        </div>
      </div>

        
      <BottomNavBar />
    </div>
  );
}
