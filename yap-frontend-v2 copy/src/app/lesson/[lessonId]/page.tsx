'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import LessonUi from '@/components/lesson/LessonUi';
import lesson1 from '@/mock/mockLessonA';
import lesson2 from '@/mock/mockLessonB';
import { mockUserProfile } from '@/mock/mockUser';
import { lessons } from '@/mock/mockLesson'; // assuming this is the path
import { TablerChevronLeft } from '@/icons';

const lessonMap = {
  'lesson-spanish-a1.1-f7b3e1a0': lesson1,
  'lesson-spanish-a1.1-c4e5d2b1': lesson2,
};

export default function LessonPage() {
  const { lessonId } = useParams();
  const router = useRouter();
  const lessonData = lessonMap[lessonId as keyof typeof lessonMap];
  const lessonTitle =
    lessons.find((lesson) => lesson.id === lessonId)?.title || 'Start Lesson';

  const [stepIndex, setStepIndex] = useState(0);
  const [started, setStarted] = useState(false);

  // If lesson data is not found, show a message
  if (!lessonData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600">Lesson not found</h1>
      </div>
    );
  }

  // Prepare vocabulary and speaking exercises
  const vocabItems = lessonData.new_vocabulary.map((word) => ({
    question: word.term,
    example_answer: word.examples?.[0] || '',
    type: 'word' as const,
  }));

  //Prepare speaking exercises
  const speakingItems = lessonData.speaking_exercises.flatMap((exercise) =>
    exercise.items.map((item) => ({
      question: item.question,
      example_answer: item.example_answer || '',
      type: 'sentence' as const,
    }))
  );

  // Combine all steps for the lesson
  const allSteps = [...vocabItems, ...speakingItems];
  const firstInitial = mockUserProfile.name.charAt(0).toUpperCase();

  // If not started, show the welcome screen
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

      {/* Top greeting block */}
      <div className="flex flex-col items-center text-center mt-8 space-y-4">
        <div className="w-24 h-24 rounded-full bg-yellow-300 flex items-center justify-center">
          <span className="text-4xl font-extrabold text-secondary">
            {firstInitial}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-secondary">
          Welcome {mockUserProfile.name}
        </h1>
        <p className="text-sm text-secondary">Hola, ¿cómo estás hoy?</p>
      </div>

      {/* Spacer before button */}
      <div className="mt-10" />

      {/* Start button, now naturally placed below greeting */}
      <button
        onClick={() => setStarted(true)}
        className="w-full max-w-xs py-4 rounded-full bg-secondary text-white font-semibold shadow-md"
      >
        {lessonTitle}
      </button>
    </div>
  ) : (
    <LessonUi
      stepIndex={stepIndex}
      setStepIndex={setStepIndex}
      allSteps={allSteps}
      onComplete={() => router.push('/home')}
    />
  );
}
