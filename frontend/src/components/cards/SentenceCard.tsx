// src/components/cards/SentenceCard.tsx
'use client';

import { FC, useRef, useState } from 'react';
import {
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophone,
  TablerVolume,
} from '@/icons';
import { useSnackbar } from '../ui/SnackBar';

interface SentenceCardProps {
  sentence: string;
  onSubmit: (blob: Blob) => Promise<void>;
  score: number | null;
  feedback: string | null;
}

export const SentenceCard: FC<SentenceCardProps> = ({
  sentence,
  onSubmit,
  score,
  feedback,
}) => {

  const mediaRef = useRef<{ recorder: MediaRecorder; chunks: Blob[] } | null>(
    null
  );
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioURL(URL.createObjectURL(blob));
        mediaRef.current = { recorder, chunks };
      };
      recorder.start();
      setIsRecording(true);
    } catch {
        showSnackbar({
          message: "Failed to start recording",
          variant: "error",
          duration: 3000,
        });
    }
  };

  const stop = () => {
    mediaRef.current?.recorder.stop();
    setIsRecording(false);
  };

  const submit = async () => {
    if (!mediaRef.current) return;
    setIsLoading(true);
    try {
      const blob = new Blob(mediaRef.current.chunks, { type: 'audio/webm' });
      await onSubmit(blob);
    } catch {
        showSnackbar({
          message: "Failed to submit audio",
          variant: "error",
          duration: 3000,
        });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full h-[45vh] max-w-sm mx-auto">
      <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
      <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />
      <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center">
        <h2 className="text-2xl font-bold text-secondary mb-4">{sentence}</h2>
        {score !== null && (
          <>
            <p className="text-xl font-bold text-secondary">Score: {score}/100</p>
            {feedback && (
              <p className="text-sm mt-2 text-secondary whitespace-pre-line">
                {feedback}
              </p>
            )}
          </>
        )}
        <div className="flex items-center gap-6 mt-4">
          <button
            onClick={isRecording ? stop : start}
            className="w-16 h-16 bg-[#EF4444] rounded-full flex items-center justify-center shadow-md"
          >
            {isRecording ? (
              <TablerPlayerPauseFilled className="w-7 h-7 text-white" />
            ) : (
              <TablerMicrophone className="w-7 h-7 text-white" />
            )}
          </button>
          {audioURL && (
            <>
              <button
                onClick={() => {
                  const a = new Audio(audioURL);
                  a.play();
                }}
                className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center"
              >
                <TablerVolume className="w-6 h-6 text-[#EF4444]" />
              </button>
              <button
                onClick={submit}
                disabled={isLoading}
                className="text-sm px-3 py-2 bg-green-500 text-white rounded-full shadow"
              >
                {isLoading ? 'Submitting…' : 'Submit'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
