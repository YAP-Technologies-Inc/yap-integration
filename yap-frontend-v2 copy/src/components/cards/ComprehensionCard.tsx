// src/components/cards/ComprehensionCard.tsx
'use client';

import { FC } from 'react';

interface ComprehensionCardProps {
  text: string;
  audioUrl?: string;
  questions: { question: string; answer: string }[];
}

export const ComprehensionCard: FC<ComprehensionCardProps> = ({
  text,
  audioUrl,
  questions,
}) => (
  <div className="relative w-full h-[45vh] max-w-sm mx-auto overflow-auto">
    <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
    <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />
    <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col">
      {audioUrl && <audio controls src={audioUrl} className="w-full mb-4" />}
      <p className="text-secondary">{text}</p>
      <div className="mt-4 space-y-3">
        {questions.map((q, i) => (
          <div key={i}>
            <p className="font-semibold text-secondary">{q.question}</p>
            <p className="text-sm text-[#666]">Answer: {q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);
