'use client';

import { FC, useState } from 'react';
import { TablerVolume } from '@/icons';

interface FlashcardProps {
  es: string;
  en: string;
  example?: string;
}

const Flashcard: FC<FlashcardProps> = ({ es, en, example }) => {
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

  return (
    <div
      onClick={() => setShowBack(prev => !prev)}
      className="w-full max-w-sm h-[36vh] bg-white rounded-2xl shadow-xl px-6 py-4 flex flex-col items-center justify-center text-center relative cursor-pointer"
    >
      {/* Audio button (front side only) */}
      {!showBack && (
        <button
          onClick={e => {
            e.stopPropagation();
            playElevenLabsAudio(es);
          }}
          className="absolute top-4 right-4 p-2 bg-yellow-400 rounded-full shadow-lg hover:bg-yellow-500 transition-transform transform hover:scale-110"
        >
          <TablerVolume className={`w-6 h-6 text-secondary ${isPlaying ? 'animate-pulse' : ''}`} />
        </button>
      )}

      {/* Content */}
      {showBack ? (
        <p className="text-3xl font-extrabold text-secondary">{en}</p>
      ) : (
        <>
          <h2 className="text-3xl font-extrabold text-secondary">{es}</h2>
          {example && (
            <p className="text-base text-muted italic leading-relaxed mt-2 px-4">{example}</p>
          )}
        </>
      )}
    </div>
  );
};

export default Flashcard;
