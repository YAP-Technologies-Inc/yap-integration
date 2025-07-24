// src/components/cards/Flashcard.tsx
'use client';

import { FC } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  example?: string;
}

const Flashcard: FC<FlashcardProps> = ({ front, back, example }) => (
  <div className="relative w-full h-[45vh] max-w-sm mx-auto">
    {/* shadow layers */}
    <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
    <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />
    {/* card content */}
    <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center">
      <h2 className="text-3xl font-bold text-secondary">{front}</h2>
      <p className="text-xl text-secondary mt-4">{back}</p>
      {example && <p className="text-sm text-[#666] mt-2">{example}</p>}
    </div>
  </div>
);

export default Flashcard;
