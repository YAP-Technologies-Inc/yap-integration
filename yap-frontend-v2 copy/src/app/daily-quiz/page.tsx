'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import Flashcard from '@/components/cards/FlashCard';
import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophone,
  TablerVolume,
} from '@/icons';

import mockDailyQuiz from '@/mock/mockDailyQuizShort';

export default function DailyQuizPage() {
  const router = useRouter();
  const { pushToast } = useToast();
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const userId = user?.id;
  const walletAddress = wallets?.[0]?.address;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const allSteps = mockDailyQuiz[0].questions.map((q) => ({
    variant: 'vocab',
    front: q.es,
    back: q.en,
    example: q.example,
  }));

  const [stepIndex, setStepIndex] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const current = allSteps[stepIndex];
  const total = allSteps.length;
  const referenceText = current.front;


  const getSupportedMimeType = (): string => {
    const types = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg',
    ];
    return types.find((type) => MediaRecorder.isTypeSupported(type)) || '';
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        pushToast('No supported recording format found', 'error');
        return;
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (e) {
      pushToast('Microphone permission denied or not found', 'error');
      router.push('/home');
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const resetAudioState = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setScore(null);
    setFeedback(null);
  };

  const next = () => {
    if (stepIndex + 1 >= total) {
      onComplete();
    } else {
      setStepIndex(stepIndex + 1);
      resetAudioState();
    }
  };

  const assessPronunciation = async () => {
    if (!audioBlob || !referenceText) return;
    setIsLoading(true);
    setScore(null);
    setFeedback(null);

    const fd = new FormData();
    fd.append('audio', audioBlob, 'recording.webm');
    fd.append('referenceText', referenceText);

    try {
      const res = await fetch(
        `${API_URL}/api/pronunciation-assessment-upload`,
        {
          method: 'POST',
          body: fd,
        }
      );
      const result = await res.json();

      const raw =
        result.NBest?.[0]?.PronScore ||
        result.NBest?.[0]?.PronunciationAssessment?.AccuracyScore ||
        0;
      const scaled = Math.round(raw * 0.8);
      setScore(scaled);
      setFeedback('Nice work!');

      setTimeout(async () => {
        if (stepIndex + 1 >= total) {
          const res = await fetch(`${API_URL}/api/complete-daily-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, walletAddress }),
          });

          if (res.status === 409) {
            // already done today
            pushToast('You’ve already completed today’s quiz!', 'info');
            onComplete();
            return;
          }

          if (!res.ok) {
            const { error } = await res.json().catch(() => ({}));
            pushToast(error || 'Failed to record quiz completion', 'error');
            return;
          }

          pushToast('Daily Quiz complete! YAP token sent', 'success');
          onComplete();
        } else {
          next();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      pushToast('Assessment failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const onComplete = () => {
    router.push('/home');
  };

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col pt-2 px-4">
      {/* Exit + Progress bar */}
      <div className="flex items-center">
        <button onClick={() => router.push('/home')} className="text-secondary">
          <TablerX className="w-6 h-6" />
        </button>
        <div className="flex-1 h-2 bg-gray-200 rounded-full ml-4 overflow-hidden">
          <div
            className="h-full bg-yellow-400 transition-all"
            style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card area */}
      <div className="flex flex-1 items-start justify-center mt-8">
        <Flashcard
          front={current.front}
          back={current.back}
          example={current.example}
        />
      </div>

      {/* Mic controls */}
      <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-3">
        {score !== null && (
          <div className="text-center text-secondary">
            <p className="text-lg font-semibold">Score: {score}/100</p>
            {feedback && <p className="text-sm mt-1">{feedback}</p>}
          </div>
        )}

        {audioURL && (
          <button
            onClick={assessPronunciation}
            disabled={isLoading}
            className="text-sm px-3 py-2 bg-green-500 text-white rounded-full shadow"
          >
            {isLoading ? 'Scoring…' : 'Submit'}
          </button>
        )}

        <div className="flex items-center justify-center gap-6">
          {audioURL && (
            <button
              onClick={resetAudioState}
              className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center"
            >
              <TablerRefresh className="w-6 h-6 text-[#EF4444]" />
            </button>
          )}

          <button
            onClick={() => (isRecording ? stopRecording() : startRecording())}
            className="w-16 h-16 bg-[#EF4444] rounded-full shadow-md flex items-center justify-center"
          >
            {isRecording ? (
              <TablerPlayerPauseFilled className="w-7 h-7 text-white" />
            ) : (
              <TablerMicrophone className="w-7 h-7 text-white" />
            )}
          </button>

          {audioURL && (
            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  audioRef.current.play();
                }
              }}
              className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center"
            >
              <TablerVolume className="w-6 h-6 text-[#EF4444]" />
            </button>
          )}
        </div>

        {audioURL && <audio ref={audioRef} src={audioURL} className="hidden" />}
      </div>
    </div>
  );
}
