'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import LessonUi from '@/components/lesson/LessonUi';
import { useUserContext } from '@/context/UserContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useCompletedLessons } from '@/hooks/useCompletedLessons';
import allLessons from '@/mock/allLessons';
import { TablerChevronLeft } from '@/icons';

// ---- helpers ----
const lessonNum = (id: string) =>
  parseInt((id?.split('_')[1] || '0').replace(/^0+/, '') || '0', 10);

const orderedIds = Object.keys(allLessons).sort((a, b) => lessonNum(a) - lessonNum(b));

export default function LessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const router = useRouter();
  const { userId } = useUserContext();

  // ALWAYS call hooks (no early returns)
  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [redirecting, setRedirecting] = useState(false);

  const lessonData = useMemo(() => allLessons[lessonId], [lessonId]);

  const { name, isLoading: profileLoading } = useUserProfile(userId);
  const { completedLessons, isLoading: completedLoading } = useCompletedLessons(userId ?? null);

  // Build sets + gating utils
  const completedSet = useMemo(() => new Set<string>(completedLessons ?? []), [completedLessons]);

  const isUnlocked = (id: string) => {
    const prereqs: string[] = allLessons[id]?.prerequisite_lessons || [];
    return prereqs.every((p) => completedSet.has(p));
  };

  const nextAllowedLessonId = useMemo(() => {
    // first unlocked NOT completed
    for (const id of orderedIds) {
      if (isUnlocked(id) && !completedSet.has(id)) return id;
    }
    // otherwise last unlocked/completed
    for (let i = orderedIds.length - 1; i >= 0; i--) {
      const id = orderedIds[i];
      if (isUnlocked(id) || completedSet.has(id)) return id;
    }
    // absolute fallback
    return orderedIds[0];
  }, [completedSet, isUnlocked]);

  // Redirect logic (auth → not found → locked)
  useEffect(() => {
    if (!userId) {
      setRedirecting(true);
      router.replace('/home');
      return;
    }
    if (profileLoading || completedLoading) return;

    // If requested lesson doesn't exist, send to next allowed
    if (!lessonData) {
      setRedirecting(true);
      router.replace(`/lesson/${nextAllowedLessonId}`);
      return;
    }

    // If requested lesson is locked, send to next allowed
    if (!isUnlocked(lessonId)) {
      if (nextAllowedLessonId && nextAllowedLessonId !== lessonId) {
        setRedirecting(true);
        router.replace(`/lesson/${nextAllowedLessonId}`);
      }
    }
  }, [
    userId,
    profileLoading,
    completedLoading,
    lessonData,
    lessonId,
    nextAllowedLessonId,
    router,
    isUnlocked
  ]);

  // Lightweight transitional states (prevents hook-order issues)
  if (!userId || profileLoading || completedLoading || redirecting) {
    return <p className="p-6 text-center">Loading…</p>;
  }

  // Safety: if somehow no lesson and no redirect yet
  if (!lessonData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600">Lesson not found</h1>
        <p className="mt-2 text-sm text-secondary">{String(lessonId)}</p>
        <button
          onClick={() => router.push(`/lessons/${nextAllowedLessonId}`)}
          className="mt-4 px-4 py-2 rounded bg-secondary text-white"
        >
          Go to your next lesson
        </button>
      </div>
    );
  }

  // Build steps (safe now)
  type StepVocab = { variant: 'vocab'; front: string; back: string; example?: string };
  const allSteps: StepVocab[] =
    lessonData?.vocabulary_items?.map((item: any) => ({
      variant: 'vocab',
      front: item.es,
      back: item.en,
      example: item.example,
    })) ?? [];

  // Pre-start screen
  if (!started) {
    return (
      <div className="min-h-[100dvh] w-full bg-background-primary flex flex-col items-center relative pb-2">
        <div className="w-full lg:w-1/2 lg:mx-auto relative px-4">
          <button
            onClick={() => router.push('/home')}
            className="absolute left-4 top-2 text-2xl font-semibold text-secondary hover:cursor-pointer
             lg:top-6 lg:text-4xl lg:left-0"
          >
            <TablerChevronLeft />
          </button>
        </div>

        <div className="w-full lg:w-1/2 lg:mx-auto flex flex-col items-center justify-center pt-20 flex-grow px-4">
          <img src="/assets/yappy.png" alt="Yappy Logo" className="h-40 w-auto" />
          <h2 className="text-lg font-light mt-1 text-secondary text-center">
            Lesson{' '}
            {(() => {
              const num = lessonData.lesson_id.split('_')[1];
              return num.startsWith('0') ? num.slice(1) : num;
            })()}
          </h2>
          <p className="text-secondary mt-1 font-bold text-xl text-center px-2">
            {lessonData.title}
          </p>
        </div>

        <div className="flex-grow" />
        <div className="flex flex-col items-center w-full lg:w-1/2 lg:mx-auto px-4">
          <button
            onClick={() => setStarted(true)}
            className="hover:cursor-pointer w-full py-4 rounded-full bg-secondary border-b-3 border-r-1 border-black text-white font-semibold shadow-md hover:bg-secondary-dark transition-transform transform hover:scale-105 active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>
    );
  }

  // Lesson in progress
  return (
    <LessonUi
      lessonId={lessonData.lesson_id}
      stepIndex={stepIndex}
      setStepIndex={setStepIndex}
      allSteps={allSteps}
      onComplete={() => router.push('/home')}
    />
  );
}
