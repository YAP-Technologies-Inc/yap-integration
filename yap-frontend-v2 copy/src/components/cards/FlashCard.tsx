'use client';

import { FC, useState } from 'react';
import {TablerVolume} from '@/icons';
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

  
      const response = await fetch(`${API_URL}/api/elevenlabs-tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      });
  
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log('Audio URL:', audioUrl);
  
        const audio = new Audio(audioUrl);
        try {
          await audio.play();
        } catch (err) {
          console.error('Audio play failed:', err);
        }
      } else {
        console.error('ElevenLabs API error:', response.status);
      }
    } catch (error) {
      console.error('ElevenLabs audio error:', error);
    } finally {
      setIsPlaying(false);
    }
  };
  

  return (
    <div
      onClick={() => setShowBack(!showBack)}
      className="w-full max-w-sm h-[36vh] bg-white rounded-2xl shadow-xl px-6 py-4 flex flex-col items-center justify-center text-center cursor-pointer relative"
    >
      {!showBack && (
        <div
          className="absolute top-4 right-4 cursor-pointer bg-tertiary text-secondary rounded-full text-3xl p-3 shadow-lg hover:bg-tertiary-dark transition-transform transform hover:scale-110"
          onClick={(e) => {
            e.stopPropagation();
            playElevenLabsAudio(showBack ? en : es);
          }}
        >
          <TablerVolume />
        </div>
            )}

            {showBack ? (
        <>
          <p className="text-3xl font-bold text-secondary">{en}</p>
          {example && <p className="text-sm text-muted mt-2">{example}</p>}
        </>
      ) : (
        <>
          <h2 className="text-3xl font-bold text-secondary">{es}</h2>
          {example && <p className="text-sm text-muted mt-2">{example}</p>}
        </>
      )}
    </div>
  );
};

export default Flashcard;
