'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import LessonUi from '@/components/lesson/LessonUi';
import { mockUserProfile } from '@/mock/mockUser';
import allLessons from '@/mock/allLessons';
import { TablerChevronLeft } from '@/icons';

export default function LessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();

  // Ensure lessonId is valid and grab it
  const lessonData = allLessons[lessonId as string];
  const lessonTitle = lessonData?.title || 'Start Lesson';

  const [stepIndex, setStepIndex] = useState(0);
  const [started, setStarted] = useState(false);

  if (!lessonData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600">Lesson not found</h1>
        <p className="mt-2 text-sm text-secondary">{lessonId}</p>
      </div>
    );
  }

  // Prepare vocabulary and speaking exercises
  const vocabItems = (lessonData.vocabulary_items || []).map(
    (word: string) => ({
      question: word,
      example_answer: '',
      type: 'word' as const,
    })
  );

  // Prepares speaking tasks based on lesson data, needs work
  const speakingItems = (lessonData.speaking_tasks || []).flatMap(
    (task: any) => {
      if (task.type === 'listen_and_repeat') {
        return [
          {
            question: task.content,
            example_answer: '',
            type: 'sentence' as const,
          },
        ];
      } else if (task.type === 'role_play') {
        return task.prompts.map((prompt: string, i: number) => ({
          question: prompt,
          example_answer: task.expected_output?.[i] || '',
          type: 'sentence' as const,
        }));
      } else if (task.type === 'pronunciation_practice') {
        return task.words.map((word: string) => ({
          question: word,
          example_answer: '',
          type: 'word' as const,
        }));
      } else {
        return [];
      }
    }
  );

  //Combines vocabulary and speaking tasks into allSteps
  const allSteps = [...vocabItems, ...speakingItems];

  const firstInitial = mockUserProfile.name.charAt(0).toUpperCase();

  return !started ? (
    <div className="min-h-screen w-full bg-background-primary flex flex-col items-center px-6 pt-4 relative">
      {/* Back button */}
      <button
        onClick={() => router.push('/home')}
        className="absolute left-2 top-2 text-2xl font-semibold text-secondary"
      >
        <div className="mt-2">
          <TablerChevronLeft />
        </div>
      </button>

      <div className="flex flex-col items-center text-center mt-8 space-y-4">
        <div className="w-24 h-24 rounded-full bg-blue-300 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-secondary">
            {firstInitial}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-secondary">
          Welcome {mockUserProfile.name || 'Student'}
        </h1>
        <p className="text-sm text-secondary">
          ¡Buena suerte con esta lección!
        </p>
      </div>

      <div className="mt-10" />

      <button
        onClick={() => setStarted(true)}
        className="w-full max-w-xs py-4 rounded-full bg-secondary text-white font-semibold shadow-md"
      >
        {lessonTitle}
      </button>
    </div>
  ) : (
    <LessonUi
      lessonId={lessonData.lesson_id}
      stepIndex={stepIndex}
      setStepIndex={setStepIndex}
      allSteps={allSteps}
      onComplete={() => router.push('/home')}
    />
  );
}
