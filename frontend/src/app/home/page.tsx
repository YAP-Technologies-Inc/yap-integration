'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
import TestingNoticeModal from '@/components/TestingNoticeModal';
import { useSnackbar } from '@/components/ui/SnackBar';
import { getTodayStatus } from '@/utils/dailyQuizStorage';
import LessonModal from '@/components/lesson/LessonModal';
import type { LessonGroup } from '@/components/lesson/LessonModal';
import { set } from 'zod';
import React from 'react';

export default function HomePage() {
  useInitializeUser();

  // const TREASURY_ADDRESS = process.env.NEXT_PUBLIC_TREASURY_ADDRESS!;
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const { showSnackbar } = useSnackbar();
  const [lessons, setLessons] = useState<
    {
      id: string;
      title: string;
      description: string;
      status: 'locked' | 'available' | 'completed';
    }[]
  >([]);

  const router = useRouter();

  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const evmAddress = typeof window !== 'undefined' ? localStorage.getItem('evmAddress') : null;

  // Fetch user-related data with SWR hooks
  const { completedLessons, isLoading: isLessonsLoading } = useCompletedLessons(userId);
  const { isLoading: isProfileLoading } = useUserProfile(userId);
  const { isLoading: isStatsLoading } = useUserStats(userId);
  const { isLoading: isBalanceLoading } = useOnChainBalance(evmAddress);

  const [dailyQuizCompleted, setDailyQuizCompleted] = useState(false);
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [groups, setGroups] = useState<LessonGroup[]>([]);
  // page.tsx (top of component)
  type LessonScore = {
    overall: number;
    accuracy: number;
    fluency: number;
    intonation: number;
    phrases?: Array<{ promptText: string; userSaid: string }>;
    created_at?: string;
  };

  type QuizScore = {
    overall: number;
    accuracy: number;
    fluency: number;
    intonation: number;
    created_at?: string;
  };

  // NEW: state for maps
  const [lessonScoreMap, setLessonScoreMap] = React.useState<Map<string, LessonScore>>(new Map());
  const [quizScoreMap, setQuizScoreMap] = React.useState<Map<string, QuizScore>>(new Map());

  useEffect(() => {
    if (!lessonModalOpen) return;

    fetch('/api/lesson-catalog')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.groups)) setGroups(d.groups);
        else setGroups([]); // fallback to empty
      })
      .catch(() => setGroups([]));
  }, [lessonModalOpen]);

  // Compute lesson availability based on completed lessons
  useEffect(() => {
    if (!completedLessons) return;

    const completedSet = new Set<string>(completedLessons);

    const computed = Object.values(allLessons).map((lesson) => {
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

    // Only update state if it's actually changed
    if (!isEqual(computed, lessons)) {
      setLessons(computed);
    }
  }, [completedLessons, lessons]);

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_URL}/daily-quiz-status/${userId}`)
      .then((res) => res.json())
      .then((data) => setDailyQuizCompleted(!!data.completed))
      .catch(() => {});
  }, [userId, API_URL]);

  useEffect(() => {
    if (!userId) return;

    const fetchScores = async () => {
      try {
        const [lr, qr] = await Promise.all([
          fetch(`${API_URL}/lesson-run/latest/${encodeURIComponent(userId)}`),
          fetch(`${API_URL}/quiz-run/latest/${encodeURIComponent(userId)}`),
        ]);

        if (!lr.ok) {
          console.error('lesson-run/latest failed', await lr.text());
          return;
        }
        if (!qr.ok) {
          console.error('quiz-run/latest failed', await qr.text());
          return;
        }

        const { lessons } = await lr.json();
        const { quizzes } = await qr.json();

        const ls = new Map<string, LessonScore>(
          lessons.map((r: any) => [
            r.lesson_id,
            {
              overall: r.score_overall,
              accuracy: r.score_accuracy,
              fluency: r.score_fluency,
              intonation: r.score_intonation,
              phrases: r.phrases,
              created_at: r.created_at,
            },
          ]),
        );

        const qs = new Map<string, QuizScore>(
          quizzes.map((r: any) => [
            r.group_slug,
            {
              overall: r.score_overall,
              accuracy: r.score_accuracy,
              fluency: r.score_fluency,
              intonation: r.score_intonation,
              created_at: r.created_at,
            },
          ]),
        );

        setLessonScoreMap(ls);
        setQuizScoreMap(qs);
      } catch (e) {
        console.error('scores fetch failed:', e);
      }
    };

    fetchScores();
  }, [userId, API_URL]);

  const TOTAL_STEPS = 5;

  // Local (client) state for attempts, etc.
  const {
    attemptsLeft,
    completed: localCompleted,
    lastAttemptAvg,
    locked: localLocked,
  } = getTodayStatus(TOTAL_STEPS);

  // Merge server + local ----------------------------------------------- NEW
  // Server is the source of truth for "already done today"
  const completedToday = dailyQuizCompleted || localCompleted;

  // Treat server completion as "locked" for MVP (can’t start again today)
  const lockedEffective = localLocked || completedToday;

  // Gate by lesson unlock as before:
  const lessonUnlocked = completedLessons?.includes('SPA1_005');
  const dailyQuizUnlocked = !!lessonUnlocked && !lockedEffective; // -------- CHANGED

  const handleDailyQuizUnlocked = () => {
    // Not unlocked by lessons
    if (!lessonUnlocked) {
      showSnackbar({
        message: 'Complete Lesson 5 to unlock Daily Quiz.',
        variant: 'info',
        duration: 3000,
      });
      return;
    }

    // Server says it's already done today ------------------------------- NEW
    if (completedToday) {
      showSnackbar({
        message: 'You’ve already completed today’s Daily Quiz.',
        variant: 'info',
        duration: 3000,
      });
      return;
    }

    // Out of attempts
    if (attemptsLeft <= 0) {
      showSnackbar({
        message: 'No attempts left. Daily Quiz is locked until tomorrow.',
        variant: 'info',
        duration: 3000,
      });
      return;
    }
    router.push('/daily-quiz');
  };

  if (userId === null) {
    router.push('/auth');
    return null;
  }

  if (isLessonsLoading || isProfileLoading || isStatsLoading || isBalanceLoading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background-primary">
        <p className="text-secondary text-lg font-semibold">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="bg-background-primary min-h-[100dvh] w-full flex flex-col overflow-y-auto overflow-x-hidden pb-nav">
      <div className="flex-1 w-full lg:w-1/2 lg:mx-auto px-4">
        <HeaderGreeting />
        <div className="mt-2">
          <BalanceCard />
        </div>
        <div className="mt-4">
          <DailyStreak />
        </div>
        <TestingNoticeModal />
        <div className="flex items-center justify-between mt-2">
          <h3 className="text-secondary text-xl font-semibold">Lessons</h3>

          <h6
            onClick={() => setLessonModalOpen(true)}
            className="text-secondary text-md font-extralight hover:cursor-pointer"
          >
            See all
          </h6>
        </div>
        <div className="overflow-x-auto pb-2">
          {' '}
          <div className="flex gap-4 px-4 -mx-4 w-max">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                id={lesson.id}
                title={lesson.title}
                description={lesson.description}
                status={lesson.status}
                onClick={() => router.push(`/lesson/${lesson.id}`)}
              />
            ))}
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={() => router.push('/spanish-teacher')}
            className="w-full border-b-3 border-r-1 border-black bg-secondary hover:bg-secondary-darker text-white font-bold py-3 rounded-2xl hover:cursor-pointer transition-colors duration-200 shadow-md"
          >
            Talk to Spanish Teacher
          </button>
        </div>

        <h3 className="text-secondary text-xl font-semibold mt-2 mb-2 flex items-center gap-2">
          Daily Quiz
        </h3>
        <div className="relative z-0 " onClick={handleDailyQuizUnlocked}>
          <DailyQuizCard
            isUnlocked={dailyQuizUnlocked}
            isCompleted={completedToday}
            attemptsLeft={attemptsLeft}
            lastAttemptAvg={lastAttemptAvg}
          />
        </div>
      </div>

      <BottomNavBar />

      {/* Add the LessonModal here */}
      {lessonModalOpen && (
        <LessonModal
          groups={
            groups.length
              ? groups
              : [
                  {
                    slug: 'fallback_1-5',
                    label: 'Lessons',
                    range: [1, Math.min(5, lessons.length)],
                    lessons: lessons.slice(0, 5),
                  },
                ]
          }
          onClose={() => setLessonModalOpen(false)}
          onLessonClick={() => {}}
          lessonScoreMap={lessonScoreMap}
          quizScoreMap={quizScoreMap} 
        />
      )}
    </div>
  );
}
