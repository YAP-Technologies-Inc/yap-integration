'use client';

import { useState, useEffect } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';

import HeaderGreeting from '@/components/dashboard/HeaderGreeting';
import BalanceCard from '@/components/dashboard/BalanceCard';
import DailyStreak from '@/components/dashboard/DailyStreak';
import BottomNavBar from '@/components/layout/BottomNavBar';
import LessonCard from '@/components/dashboard/LessonCard';
import DailyQuizCard from '../../components/dashboard/DailyQuizPrompt';
import allLessons from '../../mock/allLessons';

export default function HomePage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { wallets } = useWallets();
  const seiAddress = '0xBdB8684F477016906c68Aba78d665867e4eB81eA';
  const userId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;

<<<<<<< HEAD
  const router = useRouter();

  const handleGetYAP = async () => {
    console.log('Button clicked!');
=======
  useEffect(() => {
    // Force all lessons to available for debugging / UI testing
    const computedLessons = Object.values(allLessons).map((lesson: any) => ({
      id: lesson.lesson_id,
      title: lesson.title,
      description: lesson.title,
      status: 'available',
    }));
>>>>>>> e5dabff (auth flow needs fixing)

    setLessons(computedLessons);
    setLoading(false);
  }, []);

  return (
    <div className="bg-background-primary min-h-screen w-full flex flex-col">
      <div className="flex-1 w-full max-w-4xl mx-auto pt-4 px-4 ">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>
        <h3 className="text-secondary text-xl font-semibold mt-2">Lessons</h3>
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
<<<<<<< HEAD

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
=======
>>>>>>> e5dabff (auth flow needs fixing)
        <h3 className="text-secondary text-xl font-semibold mt-4 mb-2">
          Daily Quiz
        </h3>
        <div className="relative z-0">
          <DailyQuizCard isUnlocked={false} />
        </div>
      </div>
      <BottomNavBar />
    </div>
  );
}
