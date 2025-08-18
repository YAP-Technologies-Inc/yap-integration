'use client';

import { FC, useState, useEffect } from 'react';
import { TablerVolume, TablerArrowBack } from '@/icons';

interface FlashcardProps {
  es: string;
  en: string;
  example?: string;
  stepIndex: number;
  total: number;
  score: number | null;
}

function getUnderlineColor(score: number | null) {
  if (score === null) return 'border-transparent';
  if (score >= 80) return 'border-[#4eed71]'; // green
  if (score >= 60) return 'border-[#e4a92d]'; // yellow
  return 'border-[#f04648]'; // red
}

const Flashcard: FC<FlashcardProps> = ({ es, en, example, stepIndex, total, score }) => {
  const [showBack, setShowBack] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const playElevenLabsAudio = async (text: string) => {
    try {
      setIsPlaying(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID;

      const res = await fetch(`${API_URL}/api/elevenlabs-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });

      if (!res.ok) throw new Error(`TTS failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await audio.play();
    } catch (err) {
      console.error('Audio play failed', err);
    } finally {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    setShowBack(false);
  }, [es, en, example, stepIndex, total, score]);

  return (
    <div
      onClick={() => setShowBack((prev) => !prev)}
      className="w-full max-w-sm h-[52dvh] relative px-6 py-4"
    >
      <div className="px-4 absolute inset-0 rounded-[32px] bg-[#fbf5f2] z-0 rotate-3 h-[55dvh] w-[102%] left-[-0.1%] top-[-3%]"></div>
      <div className="px-4 absolute inset-0 rounded-[32px] bg-[#fbf5f2] z-0 -rotate-3 h-[55dvh] w-[102%] left-[0.1%] top-[-3.5%]"></div>
      {/* Main Card */}
      <div className="absolute inset-0 bg-[#fcfbfa] rounded-[32px] shadow-xl w-full h-full flex flex-col items-center justify-center text-center cursor-pointer px-6 py-10 z-10">
        {/* Word Counter */}
        <div className="absolute top-4 right-4 text-secondary text-sm font-semibold">
          Words: {stepIndex + 1}/{total}
        </div>

        {/* Front & Back Content */}
        {showBack ? (
          <>
            <h2 className="text-3xl font-extrabold text-secondary">{en}</h2>
            <p className="text-base text-gray-400 leading-relaxed mt-2">{example}</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center">
              <h2
                className={`text-3xl font-extrabold text-secondary border-b-3 ${getUnderlineColor(score)}`}
              >
                {es}
              </h2>
              {/* Audio Button positioned relative to text */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  playElevenLabsAudio(es);
                }}
                className="p-1.5 rounded-full mt-1 mr-2"
              >
                <TablerVolume
                  className={`w-4 h-4 text-[#bfb7b7] ${isPlaying ? 'animate-pulse' : ''}`}
                />
              </button>
            </div>
            {example && <p className="text-base text-gray-400 leading-relaxed mt-2">{en}</p>}
          </>
        )}

        {/* Inverted ArrowBack at bottom right */}
        <div className="absolute bottom-4 right-4">
          <TablerArrowBack className="w-7 h-7 text-[#bfb7b7] flip-horizontal" />
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
