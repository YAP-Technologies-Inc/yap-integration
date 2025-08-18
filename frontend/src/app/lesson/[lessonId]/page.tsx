'use client';

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
  const { userId } = useUserContext();

  // 1) Find the lesson
  const lessonData = allLessons[lessonId as string];
  if (!lessonData) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold text-red-600">Lesson not found</h1>
        <p className="mt-2 text-sm text-secondary">{lessonId}</p>
      </div>
    );
  }

  const [started, setStarted] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  // 2) Load the user
  const { name, isLoading: profileLoading } = useUserProfile(userId);

  // 3a) Vocabulary
  type StepVocab = {
    variant: 'vocab';
    front: string;
    back: string;
    example?: string;
  };
  const vocabSteps: StepVocab[] = lessonData.vocabulary_items.map((item) => ({
    variant: 'vocab',
    front: item.es,
    back: item.en,
    example: item.example,
  }));

  // 3b) Grammar (commented for now)
  // type StepGrammar = { variant: 'grammar'; rule: string; examples: string[] };
  // const grammarSteps: StepGrammar[] = lessonData.grammar_explanations.map(g => ({
  //   variant: 'grammar',
  //   rule: g.rule,
  //   examples: g.examples,
  // }));

  // 3c) Comprehension (commented for now)
  // type StepComp = {
  //   variant: 'comprehension';
  //   text: string;
  //   audioUrl?: boolean;
  //   questions: { question: string; answer: string }[];
  // };
  // const compSteps: StepComp[] = (lessonData.comprehension_tasks || []).map(c => ({
  //   variant: 'comprehension',
  //   text: c.text,
  //   questions: c.questions,
  // }));

  // 3d) Sentence tasks (commented for now)
  // type StepSentence = { variant: 'sentence'; question: string };
  // const sentenceSteps: StepSentence[] = (lessonData.speaking_tasks || []).flatMap(task => {
  //   switch (task.type) {
  //     case 'listen_and_repeat':
  //       return [{ variant: 'sentence', question: task.content }];
  //     case 'role_play':
  //       return task.prompts.map((p: string) => ({ variant: 'sentence', question: p }));
  //     case 'q_and_a':
  //       return task.questions.map((q: string) => ({ variant: 'sentence', question: q }));
  //     case 'conversation_building':
  //       return [{ variant: 'sentence', question: task.starter }];
  //     case 'pronunciation_practice':
  //       return task.words.map((w: string) => ({ variant: 'sentence', question: w }));
  //     default:
  //       return [];
  //   }
  // });

  // 4) Combine
  const allSteps = [
    ...vocabSteps,
    // ...grammarSteps,
    // ...compSteps,
    // ...sentenceSteps,
  ];

  // 5) Pre‑start screen
  if (!started) {
    if (profileLoading) return <p>Loading…</p>;

    return (
      <div className="min-h-[100dvh] w-full bg-background-primary flex flex-col items-center relative pb-2">
        {/* Back button - 50% width on lg */}
        <div className="w-full lg:w-1/2 lg:mx-auto relative px-4">
          <button
            onClick={() => router.push('/home')}
            className="absolute left-4 top-2 text-2xl font-semibold text-secondary hover:cursor-pointer
             lg:top-6 lg:text-4xl lg:left-0
            "
          >
            <TablerChevronLeft />
          </button>
        </div>

        {/* Content container - 50% width on lg */}
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

        {/* Button container - 50% width on lg */}
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

  // 6) Lesson in progress
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
