"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import LessonUi from '@/components/lesson/LessonUi';
import { useUserContext } from '@/context/UserContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import allLessons from '@/mock/allLessons';
import { TablerChevronLeft } from '@/icons';

export default function LessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();

  // Lookup lesson data
  const lessonData = allLessons[lessonId as string];
  const lessonTitle = lessonData?.title || 'Start Lesson';

  const [stepIndex, setStepIndex] = useState(0);
  const [started, setStarted] = useState(false);

  // Get user profile
  const { userId } = useUserContext();
  const { name, isLoading: profileLoading } = useUserProfile(userId);

  if (!lessonData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600">Lesson not found</h1>
        <p className="mt-2 text-sm text-secondary">{lessonId}</p>
      </div>
    );
  }

  // Build steps
  const vocabItems = lessonData.vocabulary_items.map((word: string) => ({
    question: word,
    example_answer: '',
    type: 'word' as const,
  }));

  const speakingItems = (lessonData.speaking_tasks || []).flatMap((task: any) => {
    switch (task.type) {
      case 'listen_and_repeat':
        return [{ question: task.content, example_answer: '', type: 'sentence' as const }];
      case 'role_play':
        return task.prompts.map((prompt: string, i: number) => ({
          question: prompt,
          example_answer: task.expected_output?.[i] || '',
          type: 'sentence' as const,
        }));
      case 'pronunciation_practice':
        return task.words.map((w: string) => ({ question: w, example_answer: '', type: 'word' as const }));
      case 'q_and_a':
        return task.questions.map((q: string, i: number) => ({
          question: q,
          example_answer: task.guide_answers?.[i] || '',
          type: 'sentence' as const,
        }));
      case 'conversation_building':
        return [
          { question: task.starter, example_answer: '', type: 'sentence' as const },
        ];
      default:
        return [];
    }
  });

  const allSteps = [...vocabItems, ...speakingItems];

  if (!started) {
    if (profileLoading) return <p>Loading...</p>;
    const firstInitial = name.charAt(0).toUpperCase() || '?';

    return (
      <div className="min-h-screen w-full bg-background-primary flex flex-col items-center px-6 pt-4 relative">
        <button
          onClick={() => router.push('/home')}
          className="absolute left-2 top-2 text-2xl font-semibold text-secondary"
        >
          <TablerChevronLeft />
        </button>

        <div className="flex flex-col items-center text-center mt-8 space-y-4">
          <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center">
            <span className="text-4xl font-extrabold text-secondary">{firstInitial}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-secondary">
            Welcome {name}
          </h1>
          <p className="text-sm text-secondary">¡Buena suerte con esta lección!</p>
        </div>

        <button
          onClick={() => setStarted(true)}
          className="mt-10 w-full max-w-xs py-4 rounded-full bg-secondary text-white font-semibold shadow-md"
        >
          {lessonTitle}
        </button>
      </div>
    );
  }

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
