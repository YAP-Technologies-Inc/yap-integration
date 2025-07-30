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
  type StepVocab = { variant: 'vocab'; front: string; back: string; example?: string };
  const vocabSteps: StepVocab[] = lessonData.vocabulary_items.map(item => ({
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
            <span className="text-4xl font-extrabold text-white">{firstInitial}</span>
          </div>
          <h1 className="text-2xl font-extrabold text-secondary">Welcome {name}</h1>
          <p className="text-sm text-secondary">¡Buena suerte con esta lección!</p>
        </div>

        <div className="flex-grow" />

        <button
          onClick={() => setStarted(true)}
          className="mb-30 w-full max-w-xs py-4 rounded-full bg-secondary text-white font-semibold shadow-md"
        >
          {lessonData.title}
        </button>
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
