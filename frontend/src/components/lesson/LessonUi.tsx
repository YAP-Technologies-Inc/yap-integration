'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophoneFilled,
  TablerVolume,
  TablerFlagFilled,
  TablerCheck,
  TablerX as TablerXIcon,
} from '@/icons';
import { ReportIssue } from '@/components/debug/ReportIssue';

import Flashcard from '@/components/cards/FlashCard';
import { GrammarCard } from '@/components/cards/GrammarCard';
import { ComprehensionCard } from '@/components/cards/ComprehensionCard';
import { useSnackbar } from '@/components/ui/SnackBar';
import { getRandomFeedbackPhrase } from '@/utils/feedbackPhrase';
import { ScoreModal } from '@/components/lesson/ScoreModal';

// NEW: chime singleton helpers
import { prepareChimes, playChimeOnce } from '@/utils/chimeOnce';

interface StepVocab {
  variant: 'vocab';
  front: string;
  back: string;
  example?: string;
}
interface StepGrammar {
  variant: 'grammar';
  rule: string;
  examples: string[];
}
interface StepComp {
  variant: 'comprehension';
  text: string;
  questions: { question: string; answer: string }[];
}
interface StepSentence {
  variant: 'sentence';
  question: string;
}
type Step = StepVocab | StepGrammar | StepComp | StepSentence;

const passingScore = 80;

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

  const { user } = usePrivy();
  const { wallets } = useWallets();

  const userId = user?.id;
  const walletAddress = wallets?.[0]?.address;

  const current = allSteps[stepIndex];
  const total = allSteps.length;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const [showBack, setShowBack] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [textFeedback, setTextFeedback] = useState<null | {
    transcript: string;
    accuracyText: string;
    fluencyText: string;
    intonationText: string;
    overallText: string;
    specificIssues: string[];
    accuracyIssue?: string;
    fluencyIssue?: string;
    intonationIssue?: string;
  }>(null);

  // === TEST MODE TOGGLE ===
  const TEST_MODE =
    process.env.NEXT_PUBLIC_PRON_TEST === '1' ||
    (typeof window !== 'undefined' &&
      (localStorage.getItem('pron_test_mode') === '1' ||
        localStorage.getItem('testing') === '1' ||
        new URLSearchParams(window.location.search).get('test') === '1'));

  function applyFakePronunciationResult() {
    const fakeOverall = 40;
    setScore(fakeOverall);
    setBreakdown({
      accuracy: 20,
      fluency: 40,
      completeness: 75,
    });
    setTextFeedback({
      transcript: 'soy de',
      accuracyText: "Pretty close—watch the 's' onset.",
      fluencyText: 'Smooth enough, minor hesitation.',
      intonationText: 'Natural, but ends a bit flat.',
      overallText: 'Good work! Keep practicing that initial consonant.',
      specificIssues: ['S onset slightly softened', 'Falling pitch too early'],
      accuracyIssue: 'This is working for what you spoke wrong (accuracy).',
      fluencyIssue: 'This is working for what you spoke wrong (fluency).',
      intonationIssue: 'This is working for what you spoke wrong (intonation).',
    });
    setFeedback('Good work! Keep practicing that initial consonant.');
    setShowBack(true);
  }

  // === SPEECH TRANSCRIPT STATE (fresh per attempt) ===
  const [spokenText, setSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);
  const attemptIdRef = useRef<string>('');
  const [hasFreshTranscript, setHasFreshTranscript] = useState(false);
  const [showScore, setShowScore] = useState<'Accuracy' | 'Fluency' | 'Intonation' | null>(null);

  // Init Web Speech once
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.lang = 'es-ES';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const t = e?.results?.[0]?.[0]?.transcript || '';
      setSpokenText(t);
      setHasFreshTranscript(true);
    };
    recognitionRef.current = rec;
  }, []);

  const [breakdown, setBreakdown] = useState<{
    accuracy: number;
    fluency: number;
    completeness: number; // Intonation in UI
  } | null>(null);

  const needsSpeaking = current.variant === 'sentence' || current.variant === 'vocab';

  const referenceText =
    current.variant === 'sentence'
      ? current.question
      : current.variant === 'vocab'
        ? current.front
        : '';

  // Add near other useStates
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple uid for correlating client/server logs
  const newUploadId = () => Math.random().toString(36).slice(2);

  const next = () => {
    if (stepIndex + 1 >= total) {
      verifyLessonCompletion();
    } else {
      setStepIndex(stepIndex + 1);
      resetAudioState();
      setShowBack(false);
    }
  };

  const resetAudioState = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setScore(null);
    setFeedback(null);
    setBreakdown(null);
    setSpokenText('');
    setHasFreshTranscript(false);
    setShowScore(null);
    setTextFeedback(null);
    // No manual chime reset needed; play is guarded per attempt key.
  };

  // Prepare chimes once (singleton)
  const correctChime = '/audio/correct.mp3';
  const incorrectChime = '/audio/incorrect.mp3';
  useEffect(() => {
    prepareChimes({ correct: correctChime, incorrect: incorrectChime });
  }, []);

  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm',
      'audio/mp4',
      'audio/ogg',
      'audio/webm;codecs=opus',
      'audio/ogg;codecs=opus',
    ];
    for (const t of types) {
      try {
        if ((MediaRecorder as any).isTypeSupported?.(t)) return t;
      } catch {}
    }
    return '';
  };

  const startRecording = async () => {
    try {
      attemptIdRef.current = crypto?.randomUUID?.() || newUploadId();
      setSpokenText('');
      setHasFreshTranscript(false);
      setScore(null);
      setBreakdown(null);
      setShowBack(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        showSnackbar({
          message: 'No supported recording format',
          variant: 'error',
          duration: 3000,
        });
        return;
      }

      const recorder = new MediaRecorder(stream, { mimeType });
      setMediaStream(stream);
      setMediaRecorder(recorder);
      setIsRecording(true);
      setAudioBlob(null);
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
        setAudioURL(null);
      }

      recorder.start();
      try {
        recognitionRef.current?.start();
      } catch {}
    } catch (e) {
      showSnackbar({
        message: 'Microphone permission denied or not found',
        variant: 'error',
        duration: 3000,
      });
      router.push('/home');
    }
  };

  const stopRecording = async () => {
    if (TEST_MODE) {
      setIsRecording(false);
      setMediaRecorder(null);
      setMediaStream(null);
      applyFakePronunciationResult();
      return;
    }
    if (!mediaRecorder) return;
    try {
      const mimeType = (mediaRecorder as any).mimeType || 'audio/unknown';

      const blob = await stopRecorderAndGetBlob(mediaRecorder, mimeType);

      if (!blob || blob.size < 200) {
        console.warn('[REC] tiny/empty blob - ignoring', { size: blob?.size });
        showSnackbar({
          message: 'Recording too short, try again',
          variant: 'error',
          duration: 2000,
        });
        return;
      }

      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioURL(url);

      if (TEST_MODE) {
        applyFakePronunciationResult();
      }
    } catch (err) {
      console.error('[REC] stop error', err);
      showSnackbar({
        message: 'Recording error',
        variant: 'error',
        duration: 2000,
      });
    } finally {
      setIsRecording(false);
      setMediaRecorder(null);
      try {
        recognitionRef.current?.stop();
      } catch {}
      try {
        mediaStream?.getTracks().forEach((t) => t.stop());
      } catch {}
      setMediaStream(null);
    }
  };

  const stopRecorderAndGetBlob = (rec: MediaRecorder, mimeType: string) =>
    new Promise<Blob>((resolve, reject) => {
      const chunks: Blob[] = [];
      let resolved = false;

      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      rec.onstop = () => {
        try {
          const blob = new Blob(chunks, { type: mimeType });
          resolved = true;
          resolve(blob);
        } catch (err) {
          reject(err);
        }
      };

      rec.onerror = (e: any) => {
        if (!resolved) reject(e?.error ?? new Error('Recorder error'));
      };

      try {
        rec.stop();
      } catch (err) {
        reject(err);
      }
    });

  const [isVerifying, setIsVerifying] = useState(false);

  // === UPLOAD & SCORE (Prod) ===
  const assessPronunciation = async () => {
    if (TEST_MODE) {
      applyFakePronunciationResult();
      setIsLoading(false);
      return;
    }
    if (!referenceText || !audioBlob) return;

    setIsLoading(true);
    try {
      const cleanMime = (audioBlob.type || 'audio/webm').split(';')[0];
      const ext = cleanMime.includes('webm')
        ? 'webm'
        : cleanMime.includes('ogg')
          ? 'ogg'
          : cleanMime.includes('m4a')
            ? 'm4a'
            : cleanMime.includes('mp4')
              ? 'm4a'
              : cleanMime.includes('wav')
                ? 'wav'
                : 'dat';

      const normalizedBlob = new Blob([audioBlob], { type: cleanMime });

      const fd = new FormData();
      fd.append('audio', normalizedBlob, `recording.${ext}`);
      fd.append('targetPhrase', referenceText);
      fd.append('attemptId', attemptIdRef.current);
      if (hasFreshTranscript && spokenText?.trim()) {
        fd.append('spokenText', spokenText.trim());
      }

      const res = await fetch(`${API_URL}/api/pronunciation`, {
        method: 'POST',
        body: fd,
      });

      if (res.status === 503) {
        const err = await res.json().catch(() => ({}));
        console.warn('[PRONUNCIATION] 503:', err);
        showSnackbar({
          message: 'Speech engine is busy — please try again.',
          variant: 'error',
          duration: 2500,
        });
        return;
      }

      const result = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(result, null, 2));

      const overall = Math.round(result.overallScore ?? 0);
      setScore(overall);
      setBreakdown({
        accuracy: result.accuracyScore || 0,
        fluency: result.fluencyScore || 0,
        completeness: result.intonationScore || 0,
      });

      setTextFeedback({
        transcript: result.transcript || '',
        accuracyText: result.accuracyText || '',
        fluencyText: result.fluencyText || '',
        intonationText: result.intonationText || '',
        overallText: result.overallText || '',
        specificIssues: Array.isArray(result.specificIssues) ? result.specificIssues : [],
      });
      setFeedback(result.overallText || '');
      setShowBack(true);
    } catch (e) {
      console.error('[PRONUNCIATION] error', e);
      showSnackbar({
        message: 'Failed to assess pronunciation',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyLessonCompletion = async () => {
    const snackId = Date.now();
    setIsVerifying(true);
    showSnackbar({
      id: snackId,
      message: 'Verifying lesson on-chain…',
      variant: 'completion',
      manual: true,
    });

    try {
      const res = await fetch(`${API_URL}/api/complete-lesson`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, walletAddress, lessonId }),
      });

      if (!res.ok) throw new Error('Verification failed');

      removeSnackbar(snackId);
      showSnackbar({
        message: 'Lesson complete! YAP token sent',
        variant: 'custom',
        duration: 3000,
      });

      setTimeout(() => {
        setIsVerifying(false);
        router.push('/home');
      }, 1200);
    } catch (err) {
      removeSnackbar(snackId);
      showSnackbar({
        message: 'Lesson failed to verify. Please try again.',
        variant: 'error',
      });
      setIsVerifying(false);
      console.error('Verification error:', err);
    }
  };

  // --- NEW: play once per attempt key ---
  useEffect(() => {
    if (score === null) return;

    // Prefer the attempt id; fallback to lesson/step to avoid accidental replays.
    const key =
      attemptIdRef.current && attemptIdRef.current.length > 0
        ? attemptIdRef.current
        : `${lessonId}:${stepIndex}`;

    playChimeOnce(key, score >= passingScore);
  }, [score, lessonId, stepIndex]);

  const handleModalClose = () => setShowScore(null);

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col h-[100dvh] overflow-hidden">
      <div className="min-h-[100dvh] fixed inset-0 bg-background-primary flex flex-col px-4 ">
        {/* Header - 50% width on lg */}
        <div className="w-full lg:w-1/2 lg:mx-auto">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="text-secondary hover:cursor-pointer"
            >
              <TablerX className="w-6 h-6" />
            </button>
            <h3 className="flex-1 text-center text-secondary font-bold text-xl">Vocabulary</h3>
            <div>
              <button
                onClick={() => setShowReport(true)}
                className="py-2 text-black rounded hover:bg-secondary-dark transition-colors"
              >
                <TablerFlagFilled className="w-5 h-5 inline-block mr-1 hover:cursor-pointer" />
              </button>

              {showReport && <ReportIssue onClose={() => setShowReport(false)} />}
            </div>
          </div>

          {/* Progress bar - 50% width on lg */}
          <div className="flex-shrink-0">
            <div className="h-4 w-full border-2 border-gray-50 bg-white/90 rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary transition-all"
                style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card area */}
        <div className="flex flex-1 items-start justify-center mt-8 min-h-[56dvh] sm:min-h-[50dvh]">
          {current.variant === 'vocab' && (
            <Flashcard
              es={current.front}
              en={current.back}
              example={current.example}
              scores={
                breakdown && {
                  overallScore: score!,
                  accuracyScore: breakdown.accuracy,
                  fluencyScore: breakdown.fluency,
                  completenessScore: breakdown.completeness,
                }
              }
              locked={isLoading || isVerifying}
              stepIndex={stepIndex}
              total={total}
              score={score}
            />
          )}
        </div>

        {/* Mic controls for speaking steps */}
        <div className="w-full space-y-6">
          {needsSpeaking && score === null && (
            <div className="flex flex-col items-center gap-6 mt-6">
              {/* Mic Controls */}
              <div className="flex items-center justify-center gap-10">
                {audioURL && (
                  <button
                    onClick={resetAudioState}
                    disabled={isLoading || isVerifying}
                    className={`w-16 h-16 bg-white rounded-full shadow flex items-center justify-center border-b-3 border-r-1 border-[#ededed] ${
                      isLoading || isVerifying
                        ? 'opacity-50 pointer-events-none'
                        : 'hover:cursor-pointer'
                    }`}
                  >
                    <TablerRefresh className="w-8 h-8 text-secondary" />
                  </button>
                )}

                <button
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                  disabled={isLoading || isVerifying || !!audioURL}
                  className={`w-20 h-20 bg-[#EF4444] rounded-full flex items-center justify-center border-b-3 border-r-1 border-[#bf373a] ${
                    isLoading || isVerifying || !!audioURL
                      ? 'opacity-50 pointer-events-none'
                      : 'hover:cursor-pointer'
                  }`}
                >
                  {isRecording ? (
                    <TablerPlayerPauseFilled className="w-10 h-10 text-white" />
                  ) : (
                    <TablerMicrophoneFilled className="w-10 h-10 text-white" />
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
                    disabled={isLoading || isVerifying}
                    className={`w-16 h-16 bg-white rounded-full shadow flex items-center justify-center border-b-3 border-r-1 border-[#e2ddd3]${
                      isLoading || isVerifying
                        ? 'opacity-50 pointer-events-none'
                        : 'hover:cursor-pointer'
                    }`}
                  >
                    <TablerVolume className="w-8 h-8 text-secondary" />
                  </button>
                )}
              </div>

              {audioURL && <audio ref={audioRef} src={audioURL} className="hidden" />}
            </div>
          )}

          {/* Submit Button - 50% width on lg */}
          {score === null && (
            <div className="pb-2 w-full lg:w-1/2 lg:mx-auto">
              <button
                onClick={() => {
                  if (TEST_MODE) {
                    applyFakePronunciationResult();
                  } else {
                    assessPronunciation();
                  }
                }}
                disabled={!audioURL || isLoading}
                className={`w-full py-4 rounded-4xl border-b-3 border-[white]/30 ${
                  audioURL
                    ? 'bg-secondary text-white border-b-3 border-r-1 font-semibold border-black'
                    : 'bg-secondary/70 border-b-3 border-r-1 border-[black]/70 text-white cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Scoring…' : 'Submit'}
              </button>
            </div>
          )}

          {/* Score + Feedback + Actions - centered scores on lg */}
          {score !== null && (
            <div className="w-full rounded-xl pb-2 space-y-4">
              <div
                className={`w-screen left-1/2 right-1/2 -ml-[50vw] relative h-1 rounded-full mb-3 ${
                  score >= passingScore ? 'bg-green-200' : 'bg-red-200'
                }`}
              />

              {/* Pass/fail section - centered container on lg */}
              <div className="w-full lg:w-1/2 lg:mx-auto">
                <div className="flex flex-col items-start mb-4">
                  {/* Pass/fail icon and label */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl border-b-3 border-r-1 flex items-center mb-2 ml-1 justify-center ${
                        score >= passingScore
                          ? 'bg-[#4eed71] border-[#41ca55]'
                          : 'bg-[#f04648] border-[#d12a2d]'
                      }`}
                    >
                      {score >= passingScore ? (
                        <TablerCheck className="w-6 h-6 text-white" />
                      ) : (
                        <TablerXIcon className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <p className="text-2xl font-semibold text-[#2D1C1C]">
                      {score >= passingScore ? 'Correct' : 'Incorrect'}
                    </p>
                  </div>

                  {/* Score breakdown - centered on lg */}
                  <div className="flex flex-row gap-6 text-secondary w-full lg:justify-center lg:space-x-25">
                    {[
                      { label: 'Accuracy', value: breakdown?.accuracy ?? 0 },
                      { label: 'Fluency', value: breakdown?.fluency ?? 0 },
                      { label: 'Intonation', value: breakdown?.completeness ?? 0 },
                    ].map(({ label, value }) => {
                      let color = 'bg-tertiary border-b-3 border-r-1 border-[#e4a92d]';
                      if (value >= passingScore)
                        color = 'bg-[#4eed71] border-b-3 border-r-1 border-[#41ca55]';
                      else if (value < 60)
                        color = 'bg-[#f04648] border-b-3 border-r-1 border-[#bf383a]';

                      return (
                        <div className="flex items-center gap-2" key={label}>
                          <button
                            type="button"
                            onClick={() => setShowScore(label)}
                            className={`w-10 h-10 flex items-center hover:cursor-pointer justify-center rounded-full text-[#141414] text-sm font-medium focus:outline-none ${color}`}
                            aria-label={`Show ${label} score details`}
                          >
                            {Math.round(value)}
                          </button>
                          <span
                            className="text-sm cursor-pointer"
                            onClick={() => setShowScore(label)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') setShowScore(label);
                            }}
                            aria-label={`Show ${label} score details`}
                          >
                            {label}
                          </span>
                          {showScore === label && textFeedback && (
                            <ScoreModal
                              onClose={handleModalClose}
                              scoreType={label as 'Accuracy' | 'Fluency' | 'Intonation'}
                              value={
                                label === 'Accuracy'
                                  ? (breakdown?.accuracy ?? 0)
                                  : label === 'Fluency'
                                    ? (breakdown?.fluency ?? 0)
                                    : (breakdown?.completeness ?? 0)
                              }
                              text={
                                label === 'Accuracy'
                                  ? textFeedback.accuracyText
                                  : label === 'Fluency'
                                    ? textFeedback.fluencyText
                                    : textFeedback.intonationText
                              }
                              transcript={textFeedback.transcript}
                              specificIssues={textFeedback.specificIssues}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action buttons - 50% width on lg */}
              <div className="flex justify-between gap-4 pt-2 w-full lg:w-1/2 lg:mx-auto">
                <button
                  onClick={resetAudioState}
                  className="flex-1 py-4 bg-white text-black rounded-full border-b-3 border-r-1 border-[#ebe6df] shadow"
                >
                  Retry
                </button>
                <button
                  onClick={next}
                  className="flex-1 py-4 bg-[#2D1C1C] text-white rounded-full border-b-3 border-r-1 border-black"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {isVerifying && <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />}
      </div>
    </div>
  );
}
