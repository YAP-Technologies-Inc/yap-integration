'use client';

import { FC, useState } from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  example?: string;
}

const Flashcard: FC<FlashcardProps> = ({ front, back, example }) => {
  const [showBack, setShowBack] = useState(false);

  return (
    <div
      onClick={() => setShowBack(!showBack)}
      className="w-full max-w-sm h-[36vh] bg-white rounded-2xl shadow-xl px-6 py-4 flex flex-col items-center justify-center text-center cursor-pointer"
    >
      {showBack ? (
        <>
          <p className="text-3xl font-bold text-secondary">{back}</p>
          {example && <p className="text-sm text-muted mt-2">{example}</p>}
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-secondary">{front}</h2>
          {example && <p className="text-sm text-muted mt-2">{example}</p>}
        </>
      )}
    </div>
  );
};

export default Flashcard;
