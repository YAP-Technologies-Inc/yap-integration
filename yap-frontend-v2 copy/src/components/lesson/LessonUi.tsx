'use client';

import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophone,
  TablerVolume,
  TablerChevronRight,
} from '@/icons';
import { useRouter } from 'next/navigation';
import { useState, useRef } from 'react';
import { useToast } from '@/components/ui/ToastProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';

interface LessonUiProps {
  lessonId: string;
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
  lessonId,
  stepIndex,
  setStepIndex,
  allSteps,
  onComplete,
}: LessonUiProps) {
  const router = useRouter();
  const totalSteps = allSteps.length;
  const currentItem = allSteps[stepIndex];

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

  const { pushToast } = useToast();
  const { user } = usePrivy();
  const { wallets } = useWallets();
  // derive once at top
  const userId = user?.id;
  const walletAddress = wallets?.[0]?.address;

  const getSupportedMimeType = (): string => {
    const possibleTypes = [
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg',
    ];
    return (
      possibleTypes.find((type) => MediaRecorder.isTypeSupported(type)) || ''
    );
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
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const assessPronunciation = async () => {
    if (!audioBlob) return;
    setIsLoading(true);
    setScore(null);
    setFeedback(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    formData.append('referenceText', currentItem.question);

    try {
      const res = await fetch(
        `${API_URL}/api/pronunciation-assessment-upload`,
        { method: 'POST', body: formData }
      );
      const result = await res.json();

      const rawScore =
        result.NBest?.[0]?.PronScore ||
        result.NBest?.[0]?.PronunciationAssessment?.AccuracyScore;
      const scaled = Math.round((rawScore || 0) * 0.8);

      setScore(scaled);
      // const tips = result.NBest?.[0]?.Words?.flatMap((w: any) =>
      //   (w.Phonemes || [])
      //     .filter((p: any) => p.ErrorType !== 'None')
      //     .map((p: any) => `Improve "${p.Phoneme}" (${p.ErrorType})`)
      // );
      // setFeedback(tips?.join('\n') || 'Nice work!');

      // Automatically move to next card after scoring
      setTimeout(async () => {
        if (stepIndex + 1 >= totalSteps) {
          // use the prop `lessonId`, not an undefined variable
          await markLessonComplete(lessonId);
          onComplete();
        } else {
          setStepIndex(stepIndex + 1);
        }

        setAudioBlob(null);
        setAudioURL(null);
        setScore(null);
        setFeedback(null);
      }, 1500);
    } catch (e: any) {
      pushToast('Assessment failed', 'info');
    } finally {
      setIsLoading(false);
    }
  };
  // Function to mark lesson as complete and send YAP token
  // This will be called when the user completes the last step of the lesson
  // We grab from local storage again, need the this to run async in the background and need a toast notification
  // to notify the user that the lesson is complete and YAP token has been sent
  const markLessonComplete = async (currentLessonId: string) => {
    // guard early
    if (!userId || !walletAddress) {
      pushToast('No user or wallet detected. Please log in.', 'error');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/complete-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          walletAddress,
          lessonId: currentLessonId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const old = parseFloat(localStorage.getItem('tokenBalance') || '0');
        const updated = old + 1;
        localStorage.setItem('tokenBalance', updated.toString());
        pushToast('Lesson complete! YAP token sent', 'success');
      } else {
        pushToast(`Error: ${data.error}`, 'error');
      }
    } catch {
      pushToast('Failed to complete lesson', 'info');
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background-primary flex flex-col pt-4 pb-28 px-4">
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

      {/* Flashcard + Shadows */}
      <div className="relative w-full max-w-sm mx-auto flex-1 flex items-center justify-center">
      <div className="relative w-full h-[45vh]">
        {/* Shadow Layers directly behind */}
        <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
        <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />

        {/* Main Card */}
        <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl px-6 py-6 flex flex-col items-center justify-center text-center">
        <div className="absolute top-3 right-4 text-xs text-secondary">
          {currentItem.type === 'word'
          ? `Words ${
            allSteps
              .slice(0, stepIndex + 1)
              .filter((s) => s.type === 'word').length
            }/${allSteps.filter((s) => s.type === 'word').length}`
          : `Sentences ${
            allSteps
              .slice(0, stepIndex + 1)
              .filter((s) => s.type === 'sentence').length
            }/${allSteps.filter((s) => s.type === 'sentence').length}`}
        </div>
        <h2 className="text-2xl font-bold text-secondary mb-2">
          {currentItem.question}
        </h2>
        {currentItem.example_answer && (
          <p className="text-secondary text-base leading-snug">
          {currentItem.example_answer}
          </p>
        )}
        </div>
      </div>
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-6 left-0 right-0 pointer-events-none">
      <div className="relative w-full flex flex-col items-center gap-4">
        {/* Score overlay above the mic */}
        {score !== null && (
        <div className="text-center pointer-events-none">
          <p className="text-xl font-bold text-secondary">Score: {score}/100</p>
          {feedback && (
          <p className="text-sm mt-2 text-secondary whitespace-pre-line">
            {feedback}
          </p>
          )}
        </div>
        )}
        {/* Submit */}
        {audioURL && (
        <button
          onClick={assessPronunciation}
          disabled={isLoading}
          className="text-sm px-3 py-2 rounded-full bg-green-500 text-white shadow pointer-events-auto"
        >
          Submit
        </button>
        )}

        <div className="w-full h-16 flex items-center justify-center gap-6">
        {/* Redo */}
        {audioURL && (
          <button
          onClick={() => {
            setAudioBlob(null);
            setAudioURL(null);
            setScore(null);
            setFeedback(null);
          }}
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center pointer-events-auto"
          >
          <TablerRefresh className="w-6 h-6 text-[#EF4444]" />
          </button>
        )}

        {/* Mic / Pause centered */}
        <button
          onClick={() => (isRecording ? stopRecording() : startRecording())}
          className="w-16 h-16 bg-[#EF4444] rounded-full flex items-center justify-center shadow-md pointer-events-auto"
        >
          {isRecording ? (
          <TablerPlayerPauseFilled className="w-7 h-7 text-white" />
          ) : (
          <TablerMicrophone className="w-7 h-7 text-white" />
          )}
        </button>

        {/* Rehear */}
        {audioURL && (
          <button
          onClick={() => {
            audioRef.current!.currentTime = 0;
            audioRef.current!.play();
          }}
          className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center pointer-events-auto"
          >
          <TablerVolume className="w-6 h-6 text-[#EF4444]" />
          </button>
        )}
        </div>

        
      </div>
      </div>

      {/* Hidden audio for replay */}
      {audioURL && (
      <audio ref={audioRef} src={audioURL} className="hidden" controls />
      )}
    </div>
  );
}
