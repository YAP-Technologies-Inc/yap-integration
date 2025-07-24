'use client';

import { FC, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/ToastProvider';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophone,
  TablerVolume,
} from '@/icons';

// your four card components:
import Flashcard from '@/components/cards/Flashcard';
import { GrammarCard } from '@/components/cards/GrammarCard';
import { ComprehensionCard } from '@/components/cards/ComprehensionCard';

// Step variants
interface StepVocab { variant: 'vocab'; front: string; back: string; example?: string }
interface StepGrammar { variant: 'grammar'; rule: string; examples: string[] }
interface StepComp { variant: 'comprehension'; text: string; questions: { question: string; answer: string }[] }
interface StepSentence { variant: 'sentence'; question: string }

type Step = StepVocab | StepGrammar | StepComp | StepSentence;

interface LessonUiProps {
  lessonId: string;
  stepIndex: number;
  setStepIndex: (i: number) => void;
  allSteps: Step[];
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
  const { pushToast } = useToast();
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const current = allSteps[stepIndex];
  const total = allSteps.length;

  // Audio state for sentence cards
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder|null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob|null>(null);
  const [audioURL, setAudioURL] = useState<string|null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number|null>(null);
  const [feedback, setFeedback] = useState<string|null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const userId = user?.id;
  const walletAddress = wallets?.[0]?.address;

  const next = () => {
    if (stepIndex + 1 >= total) {
      onComplete();
    } else {
      setStepIndex(stepIndex + 1);
      // reset audio state
      setAudioBlob(null);
      setAudioURL(null);
      setScore(null);
      setFeedback(null);
    }
  };

  // --- Recording for sentences ---
  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => {
        if (e.data.size) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
      };
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      pushToast('Mic permission denied', 'error');
      router.push('/home');
    }
  }
  function stopRecording() {
    mediaRecorder?.stop();
    setIsRecording(false);
  }

  async function assessPronunciation() {
    if (!audioBlob) return;
    setIsLoading(true);
    setScore(null);
    setFeedback(null);

    const fd = new FormData();
    fd.append('audio', audioBlob, 'recording.webm');
    fd.append('referenceText', (current as StepSentence).question);

    try {
      // 1) send to your API
      const res = await fetch(
        'http://localhost:4000/api/pronunciation-assessment-upload',
        { method: 'POST', body: fd }
      );
      const result = await res.json();
      const raw =
        result.NBest?.[0]?.PronScore ||
        result.NBest?.[0]?.PronunciationAssessment?.AccuracyScore ||
        0;
      const scaled = Math.round(raw * 0.8);
      setScore(scaled);
      setFeedback('Nice work!');

      // 2) after a pause, either next or complete
      setTimeout(async () => {
        if (stepIndex + 1 >= total) {
          // mint YAP token
          await fetch('http://localhost:4000/api/complete-lesson', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, walletAddress, lessonId }),
          });
          pushToast('Lesson complete! YAP token sent', 'success');
          onComplete();
        } else {
          next();
        }
      }, 1500);
    } catch {
      pushToast('Assessment failed', 'error');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-background-primary flex flex-col pt-4 pb-28 px-4">
      {/* Exit + Progress */}
      <div className="flex items-center mb-4">
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

      {/* Card */}
      <div className="flex-1 flex items-center justify-center">
        {current.variant === 'vocab' && (
          <Flashcard
            front={current.front}
            back={current.back}
            example={current.example}
          />
        )}

        {current.variant === 'grammar' && (
          <GrammarCard rule={current.rule} examples={current.examples} />
        )}

        {current.variant === 'comprehension' && (
          <ComprehensionCard
            text={current.text}
            questions={current.questions}
          />
        )}

        {current.variant === 'sentence' && (
          // we render the built‑in sentence UI here
          <div className="relative w-full max-w-sm h-[45vh]">
            <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
            <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />
            <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold text-secondary mb-4">
                {(current as StepSentence).question}
              </h2>

              {score !== null && (
                <>
                  <p className="text-xl font-bold text-secondary">
                    Score: {score}/100
                  </p>
                  {feedback && (
                    <p className="text-sm mt-2 text-secondary whitespace-pre-line">
                      {feedback}
                    </p>
                  )}
                </>
              )}

              {/* bottom controls */}
              <div className="mt-6 flex items-center gap-6">
                <button
                  onClick={() => (isRecording ? stopRecording() : startRecording())}
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
                        audioRef.current!.currentTime = 0;
                        audioRef.current!.play();
                      }}
                      className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center"
                    >
                      <TablerVolume className="w-6 h-6 text-[#EF4444]" />
                    </button>

                    <button
                      onClick={assessPronunciation}
                      disabled={isLoading}
                      className="px-4 py-2 bg-green-500 text-white rounded-full shadow"
                    >
                      {isLoading ? 'Scoring…' : 'Submit'}
                    </button>
                  </>
                )}
              </div>

              {audioURL && (
                <audio ref={audioRef} src={audioURL} className="hidden" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Next button for non‑sentence */}
      {current.variant !== 'sentence' && (
        <div className="flex justify-center mt-4">
          <button
            onClick={next}
            className="px-6 py-2 bg-secondary text-white rounded-full shadow-md"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
