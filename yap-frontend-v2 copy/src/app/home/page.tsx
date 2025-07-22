// /src/app/home/page.tsx
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
export default function HomePage() {
  useInitializeUser();
  const [lessons, setLessons] = useState<
    { id: string; title: string; description: string; status: 'locked' | 'available' | 'completed' }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Retrive user ID from localStorage
  const { wallets } = useWallets(); 
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const router = useRouter();

  // Load lessons based on user progress, will always render first lesson as available
  // and will update based on completed lessons
  
  useEffect(() => {
    const fetchCompletedLessons = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:4000/api/user-lessons/${userId}`);
        const data = await res.json();
        const completedSet = new Set<string>(data.completedLessons || []);

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

        setLessons(computed);
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
        // Fall back incase first fetch fails and we need to render 1st lesson
        setLessons(
          Object.values(allLessons).map((lesson: any) => ({
            id: lesson.lesson_id,
            title: lesson.title,
            description: lesson.description,
            status: lesson.lesson_id === 'SPA1_001' ? 'available' : 'locked',
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedLessons();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p>Loading lessons…</p>
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
        <h3 className="text-secondary text-xl font-semibold mt-8 mb-2">
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
