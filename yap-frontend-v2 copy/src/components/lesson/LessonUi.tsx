// TODO: Need to style better
// TODO: Add audio functionailty with a libaray most likley a webapi or media recorder not sure
'use client';

import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophone,
  TablerVolume,
} from '@/icons';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface LessonUiProps {
  stepIndex: number;
  setStepIndex: React.Dispatch<React.SetStateAction<number>>;
  allSteps: {
    question: string;
    example_answer?: string;
    type: 'word' | 'sentence';
  }[];
  onComplete: () => void;
}

export default function LessonUi({
  stepIndex,
  setStepIndex,
  allSteps,
  onComplete,
}: LessonUiProps) {
  const router = useRouter();
  const totalSteps = allSteps.length;
  const currentItem = allSteps[stepIndex];
  const [isRecording, setIsRecording] = useState(false);

  const handleNext = () => {
    if (stepIndex + 1 >= totalSteps) {
      onComplete();
    } else {
      setStepIndex(stepIndex + 1);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background-primary flex flex-col pt-4 pb-28 px-4">
      {/* Exit + Progress bar */}
      <div className="w-screen flex items-center gap-3 px-6 mb-4 -ml-4">
        <button onClick={() => router.push('/home')} className="text-secondary">
          <TablerX className="w-6 h-6" />
        </button>
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all duration-300"
            style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div className="relative w-full max-w-sm mx-auto flex-1 flex items-center justify-center">
        {/* Shadow Layers */}
        <div className="absolute z-0 w-full h-[45vh] rounded-2xl bg-white shadow-md opacity-30 top-4" />
        <div className="absolute z-0 w-full h-[45vh] rounded-2xl bg-white shadow-md opacity-20 top-8" />

        {/* Main Card */}
        <div className="relative z-10 bg-white w-full h-[45vh] rounded-2xl shadow-xl px-6 py-6 flex flex-col items-center justify-center text-center">
          {/* Count Progress */}
          <div className="absolute top-3 right-4 text-xs text-secondary">
            {currentItem?.type === 'word'
              ? `Words ${
                  allSteps
                    .slice(0, stepIndex + 1)
                    .filter((step) => step.type === 'word').length
                }/${allSteps.filter((step) => step.type === 'word').length}`
              : `Sentences ${
                  allSteps
                    .slice(0, stepIndex + 1)
                    .filter((step) => step.type === 'sentence').length
                }/${
                  allSteps.filter((step) => step.type === 'sentence').length
                }`}
          </div>

          <h2 className="text-2xl font-bold text-secondary mb-2">
            {currentItem?.question || ''}
          </h2>
          {currentItem?.example_answer && (
            <p className="text-secondary text-base leading-snug">
              {currentItem.example_answer}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-6 left-0 right-0 flex justify-center items-center gap-6 w-full px-6">
        {/* Replay audio */}
        <button
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center"
          onClick={() => console.log('Replay audio')}
        >
          <TablerRefresh className="w-6 h-6 text-[#EF4444]" />
        </button>

          {/* Toggle mic button */}
        <button
          onClick={() => {
            setIsRecording((prev) => !prev);
            console.log(
              isRecording ? 'Recording stopped' : 'Recording started'
            );
          }}
          className="w-16 h-16 bg-[#EF4444] rounded-full flex items-center justify-center shadow-md"
        >
          {isRecording ? (
            <TablerPlayerPauseFilled className="w-7 h-7 text-white" />
          ) : (
            <TablerMicrophone className="w-7 h-7 text-white" />
          )}
        </button>

          {/* Rehear audio */}
        <button
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center"
          onClick={() => console.log('Re-hear audio')}
        >
          <TablerVolume className="w-6 h-6 text-[#EF4444]" />
        </button>

        {/* TEST ONLY: Skip Button */}
        <button
          className="w-12 h-12 rounded-full bg-gray-300 shadow flex items-center justify-center"
          onClick={handleNext}
        >
          <span className="text-sm font-bold text-secondary">⏭</span>
        </button>
      </div>
    </div>
  );
}
