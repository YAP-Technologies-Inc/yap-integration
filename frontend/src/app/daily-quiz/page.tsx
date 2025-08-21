'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePrivy, useWallets } from '@privy-io/react-auth';

import {
  TablerX as TablerXIcon,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophoneFilled,
  TablerVolume,
  TablerFlagFilled,
  TablerCheck,
  TablerX,
} from '@/icons';
import { ReportIssue } from '@/components/debug/ReportIssue';
import Flashcard from '@/components/cards/FlashCard';
import { useSnackbar } from '@/components/ui/SnackBar';
import mockDailyQuiz from '@/mock/mockDailyQuizShort';
import { ScoreModal } from '@/components/lesson/ScoreModal';

// match LessonUi chime UX
import { prepareChimes, playChimeOnce } from '@/utils/chimeOnce';

import {
  getQuizState,
  setQuizState,
  updateScoreForStep,
  decrementAttempt,
  resetForRetry,
  markCompleted,
  computeAvg,
  setAttemptAvg,
  setLastAttemptAvg,
  type DailyQuizState,
} from '@/utils/dailyQuizStorage';

const PASSING_CARD_SCORE = 70; // per-card visual pass
const PASSING_AVG = 90; // quiz pass threshold
const MAX_ATTEMPTS = 3;

type Step = {
  variant: 'vocab';
  front: string;
  back: string;
  example?: string;
};

export default function DailyQuizUi() {
  const router = useRouter();
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const userId = user?.id;
  const walletAddress = wallets?.[0]?.address;
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // ==== Build steps from mock (same visual as LessonUi) ====
  const allSteps: Step[] = (mockDailyQuiz?.[0]?.questions ?? []).map((q) => ({
    variant: 'vocab',
    front: q.es,
    back: q.en,
    example: q.example,
  }));
  const total = allSteps.length;

  // ==== Daily quiz persisted state ====
  const initial: DailyQuizState =
    typeof window !== 'undefined'
      ? getQuizState(total)
      : {
          attemptsLeft: MAX_ATTEMPTS,
          scores: Array(total).fill(-1),
          completed: false,
          avgScore: 0,
          lastAttemptAvg: 0,
        };

  const [attemptsLeft, setAttemptsLeft] = useState<number>(initial.attemptsLeft);
  const [scores, setScores] = useState<number[]>(initial.scores);
  const [avgScore, setAvgScore] = useState<number>(initial.avgScore);
  const [completed, setCompleted] = useState<boolean>(initial.completed);

  const [stepIndex, setStepIndex] = useState(0);
  const current = allSteps[stepIndex];

  // ==== Media / scoring state (parity with LessonUi) ====
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [breakdown, setBreakdown] = useState<{
    accuracy: number;
    fluency: number;
    completeness: number; // Intonation slot in UI
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const [showReport, setShowReport] = useState(false);

  // ==== TEST MODE (same toggles as LessonUi) ====
  const TEST_MODE =
    process.env.NEXT_PUBLIC_PRON_TEST === '1' ||
    (typeof window !== 'undefined' &&
      (localStorage.getItem('pron_test_mode') === '1' ||
        localStorage.getItem('testing') === '1' ||
        new URLSearchParams(window.location.search).get('test') === '1'));

  // Fake result, same shape as LessonUi
  function applyFakePronunciationResult() {
    const fakeOverall = 90;
    setScore(fakeOverall);
    setBreakdown({
      accuracy: 40,
      fluency: 70,
      completeness: 75,
    });
    setTextFeedback({
      transcript: 'hola',
      accuracyText: 'Pretty close—watch the opening consonant.',
      fluencyText: 'Generally smooth; a tiny hesitation mid-word.',
      intonationText: 'Natural melody, slightly falling too early.',
      overallText: 'Nice try! Keep practicing the first syllable.',
      specificIssues: ['Initial consonant a bit soft', 'Pitch drops too soon'],
    });
  }

  // ==== Web Speech transcript capture (fresh per attempt) ====
  const [spokenText, setSpokenText] = useState('');
  const recognitionRef = useRef<any>(null);
  const attemptIdRef = useRef<string>('');
  const [hasFreshTranscript, setHasFreshTranscript] = useState(false);

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

  // ==== Text feedback payload (same keys as LessonUi) ====
  const [textFeedback, setTextFeedback] = useState<null | {
    transcript: string;
    accuracyText: string;
    fluencyText: string;
    intonationText: string;
    overallText: string;
    specificIssues: string[];
  }>(null);

  // ScoreModal visibility
  const [showScore, setShowScore] = useState<'Accuracy' | 'Fluency' | 'Intonation' | null>(null);
  const handleModalClose = () => setShowScore(null);

  // ==== Helpers ====
  const referenceText = current?.front ?? '';
  const needsSpeaking = true;

  const newUploadId = () => Math.random().toString(36).slice(2);

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
  };

  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm', // Chrome/Edge/Android
      'audio/mp4', // Safari/iOS
      'audio/ogg', // Firefox
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

  // ==== Prepare chimes once (match LessonUi) ====
  const correctChime = '/audio/correct.mp3';
  const incorrectChime = '/audio/incorrect.mp3';

  useEffect(() => {
    prepareChimes({ correct: correctChime, incorrect: incorrectChime });
    
    // Test if audio files can be loaded
    const testCorrect = new Audio(correctChime);
    const testIncorrect = new Audio(incorrectChime);
    
    // Preload the audio files
    testCorrect.load();
    testIncorrect.load();
  }, []);

  // ==== Play chime once per attempt key (like LessonUi) ====
  useEffect(() => {
    if (score == null) return;
    
    
    const key = attemptIdRef.current && attemptIdRef.current.length > 0
      ? attemptIdRef.current
      : `daily:${stepIndex}`;
      
    const pass = score >= PASSING_CARD_SCORE;
    
    playChimeOnce(key, pass);
  }, [score, stepIndex]);

  // ==== Recording controls (parity with LessonUi) ====
  const startRecording = async () => {
    try {
      attemptIdRef.current = crypto?.randomUUID?.() || newUploadId();
      setSpokenText('');
      setHasFreshTranscript(false);
      setScore(null);
      setBreakdown(null);

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

  // ==== Assess (Prod) OR Fake (Test) ====
  const assessPronunciation = async () => {
    if (TEST_MODE) {
      applyFakePronunciationResult();
      setIsLoading(false);
      return;
    }

    if (!audioBlob || !referenceText || isSubmitting) return;
    setAttemptAvg(total, 0); // when resetting for a new run

    const uploadId = newUploadId();
    const extFromBlob = (() => {
      const t = audioBlob.type || '';
      if (t.includes('webm')) return 'webm';
      if (t.includes('mp4')) return 'mp4';
      if (t.includes('m4a')) return 'm4a';
      if (t.includes('ogg')) return 'ogg';
      if (t.includes('wav')) return 'wav';
      return 'dat';
    })();
    const filename = `dq-${uploadId}.${extFromBlob}`;

    // Reset/lock UI
    setAudioURL(null);
    setIsRecording(false);
    setScore(null);
    setFeedback(null);
    setBreakdown(null);
    setIsLoading(true);
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append('audio', audioBlob, filename);
    fd.append('targetPhrase', referenceText);
    fd.append('attemptId', attemptIdRef.current || uploadId);
    if (hasFreshTranscript && spokenText?.trim()) {
      fd.append('spokenText', spokenText.trim());
    }

    try {
      const res = await fetch(`${API_URL}/pronunciation`, {
        method: 'POST',
        body: fd,
      });

      const result = await res.json().catch(() => ({}) as any);
      if (!res.ok) throw new Error(result?.detail || `Server error: ${res.status}`);

      const overall = Math.round(result.overallScore ?? 0);
      setScore(overall);
      setBreakdown({
        accuracy: result.accuracyScore || 0,
        fluency: result.fluencyScore || 0,
        completeness: result.intonationScore || 0,
      });
      setTextFeedback({
        transcript: result.transcript || '',
        accuracyText: result.accuracyText || 'Pronunciation feedback unavailable.',
        fluencyText: result.fluencyText || 'Fluency feedback unavailable.',
        intonationText: result.intonationText || 'Intonation feedback unavailable.',
        overallText: result.overallText || '',
        specificIssues: Array.isArray(result.specificIssues) ? result.specificIssues : [],
      });

      // persist per-step score so avg reflects latest on finish
      const updated = updateScoreForStep(stepIndex, overall, total);

      setScores(updated.scores);
      // compute a running average over graded entries only
      const graded = updated.scores.filter(
        (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0,
      );
      const currentAvg = graded.length
        ? Math.round(graded.reduce((a, b) => a + b, 0) / graded.length)
        : 0;

      setAvgScore(currentAvg);
      setAttemptAvg(total, currentAvg); // keep localStorage in sync for any widgets

      await new Promise((r) => setTimeout(r, 200)); // slight pause for UI smoothness
    } catch (err) {
      console.error('[UPLOAD] error', err);
      showSnackbar({
        message: 'Failed to assess pronunciation',
        variant: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  // ==== Next Step / Finish ====
  const toNextStepOrFinish = () => {
    if (stepIndex + 1 < total) {
      setStepIndex(stepIndex + 1);
      resetAudioState();
      return;
    }

    const finalScores = scores.map((s, i) => (i === stepIndex && score != null ? score : s));
    // ignore ungraded slots like -1 / null / NaN
    const graded = finalScores.filter((v) => typeof v === 'number' && Number.isFinite(v) && v >= 0);
    const avg = graded.length
      ? Math.max(0, Math.min(100, Math.round(graded.reduce((a, b) => a + b, 0) / graded.length)))
      : 0;

    setAvgScore(avg);

    if (avg >= PASSING_AVG) {
      markCompleted(total);
      setCompleted(true);
      verifyQuizCompletion();
    } else {
      setLastAttemptAvg(total, avg);
      setAttemptAvg(total, avg);
      window.dispatchEvent(new Event('daily-quiz-progress'));

      if (attemptsLeft > 1) {
        const afterDec = decrementAttempt(total);
        setAttemptsLeft(afterDec.attemptsLeft);

        const fresh = resetForRetry(total);
        setScores(fresh.scores);
        setStepIndex(0);
        resetAudioState();

        showSnackbar({
          message: `Average ${avg}%. Try again! Attempts left: ${afterDec.attemptsLeft}`,
          variant: 'error',
          duration: 3000,
        });
      } else {
        const decFinal = decrementAttempt(total);
        setAttemptsLeft(decFinal.attemptsLeft);
        showSnackbar({
          message: 'Quiz failed. No attempts left for today.',
          variant: 'error',
          duration: 3500,
        });
        router.push('/home');
      }
    }
  };

  const verifyQuizCompletion = async () => {
    const snackId = Date.now();
    setIsVerifying(true);
    showSnackbar({
      id: snackId,
      message: 'Verifying quiz on-chain…',
      variant: 'completion',
      manual: true,
    });

    try {
      const res = await fetch(`${API_URL}/complete-daily-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, walletAddress }),
      });
      if (!res.ok) throw new Error('Verification failed');

      removeSnackbar(snackId);
      showSnackbar({
        message: 'Daily Quiz complete! YAP token sent',
        variant: 'custom',
        duration: 3000,
      });

      markCompleted(total);

      setTimeout(() => {
        setIsVerifying(false);
        router.push('/home');
      }, 1000);
    } catch (err) {
      removeSnackbar(snackId);
      showSnackbar({
        message: 'Quiz failed to verify. Please try again.',
        variant: 'error',
      });
      setIsVerifying(false);
      console.error('Verification error:', err);
    }
  };

  // ==== Play chime once per attempt key (like LessonUi) ====
  useEffect(() => {
    if (score == null) return;
    
    
    const key = attemptIdRef.current && attemptIdRef.current.length > 0
      ? attemptIdRef.current
      : `daily:${stepIndex}`;
      
    const pass = score >= PASSING_CARD_SCORE;
    
    playChimeOnce(key, pass);
  }, [score, stepIndex]);

  if (!current) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background-primary">
        <p className="text-secondary">No quiz available.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col h-[100dvh] overflow-hidden">
      <div className="min-h-[100dvh] fixed inset-0 bg-background-primary flex flex-col px-4 ">
        {/* Header — 50% width on lg (match LessonUi) */}
        <div className="w-full lg:w-1/2 lg:mx-auto">
          <div className="flex items-center">
            <button
              onClick={() => router.push('/home')}
              className="text-secondary hover:cursor-pointer"
            >
              <TablerXIcon className="w-6 h-6" />
            </button>
            <h3 className="flex-1 text-center text-secondary font-bold text-xl">Daily Quiz</h3>
            <div>
              <button
                onClick={() => setShowReport(true)}
                className="py-2 text-black rounded hover:bg-secondary-dark transition-colors"
              >
                <TablerFlagFilled className="w-5 h-5 inline-block mr-1" />
              </button>
              {showReport && <ReportIssue onClose={() => setShowReport(false)} />}
            </div>
          </div>

          {/* Progress bar — 50% width on lg */}
          <div className="flex-shrink-0">
            <div className="h-4 w-full border-2 border-gray-50 bg-white/90 rounded-full overflow-hidden">
              <div
                className="h-full bg-tertiary transition-all"
                style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card area — centered, same min heights */}
        <div className="flex flex-1 items-start justify-center mt-8 min-h-[56dvh] sm:min-h-[50dvh]">
          <Flashcard
            es={current.front}
            en={current.back}
            example={current.example}
            scores={
              score !== null && breakdown
                ? {
                    overallScore: score,
                    accuracyScore: breakdown.accuracy,
                    fluencyScore: breakdown.fluency,
                    completenessScore: breakdown.completeness,
                  }
                : undefined
            }
            locked={isLoading || isVerifying}
            stepIndex={stepIndex}
            total={total}
            score={score}
          />
        </div>

        {/* Mic controls + Submit — match LessonUi widths */}
        <div className="w-full space-y-6">
          {score === null && (
            <>
              <div className="flex flex-col items-center gap-6 mt-6">
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
                    onClick={() => (isRecording ? stopRecording() : startRecording())}
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
                      className={`w-16 h-16 bg-white rounded-full shadow flex items-center justify-center border-b-3 border-r-1 border-[#e2ddd3] ${
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

              {/* Submit — 50% width on lg */}
              <div className="pb-2 w-full lg:w-1/2 lg:mx-auto">
                <button
                  onClick={assessPronunciation}
                  disabled={!audioURL || isLoading}
                  className={`w-full py-4 rounded-4xl border-b-3 border-[white]/30 ${
                    audioURL
                      ? 'bg-secondary text-white border-b-3 border-r-1 font-semibold border-black'
                      : 'bg-secondary/70 border-b-3 border-r-1 border-[black]/70 text-white cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Scoring…' : TEST_MODE ? 'Submit (Test)' : 'Submit'}
                </button>
              </div>
            </>
          )}

          {/* Score + Feedback + Actions — match LessonUi centering */}
          {score !== null && (
            <div className="w-full rounded-xl pb-2 space-y-4 ">
              {/* Pass/fail underline (full width strip like LessonUi) */}
              <div
                className={`w-screen left-1/2 right-1/2 -ml-[50vw] relative h-1 rounded-full mb-3 ${
                  score >= PASSING_CARD_SCORE ? 'bg-green-200' : 'bg-red-200'
                }`}
              />

              {/* Centered details on lg */}
              <div className="w-full lg:w-1/2 lg:mx-auto">
                <div className="flex flex-col items-start mb-4">
                  {/* Pass/fail icon + label */}
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl border-b-3 border-r-1 flex items-center mb-2 ml-1 justify-center ${
                        score >= PASSING_CARD_SCORE
                          ? 'bg-[#4eed71] border-[#41ca55]'
                          : 'bg-[#f04648] border-[#d12a2d]'
                      }`}
                    >
                      {score >= PASSING_CARD_SCORE ? (
                        <TablerCheck className="w-6 h-6 text-white" />
                      ) : (
                        <TablerX className="w-6 h-6 text-white" />
                      )}
                    </div>
                    <p className="text-2xl font-semibold text-[#2D1C1C]">
                      {score >= PASSING_CARD_SCORE ? 'Correct' : 'Incorrect'}
                    </p>
                  </div>

                  {/* Score breakdown — centered on lg */}
                  <div className="flex flex-row gap-6 text-secondary w-full lg:justify-center lg:space-x-25">
                    {[
                      { label: 'Accuracy', value: breakdown?.accuracy ?? 0 },
                      { label: 'Fluency', value: breakdown?.fluency ?? 0 },
                      { label: 'Intonation', value: breakdown?.completeness ?? 0 },
                    ].map(({ label, value }) => {
                      let color = 'bg-tertiary border-b-3 border-r-1 border-[#e4a92d]';
                      if (value >= PASSING_CARD_SCORE)
                        color = 'bg-[#4eed71] border-b-3 border-r-1 border-[#41ca55]';
                      else if (value < 60)
                        color = 'bg-[#f04648] border-b-3 border-r-1 border-[#bf383a]';

                      return (
                        <div className="flex items-center gap-2" key={label}>
                          <button
                            type="button"
                            onClick={() =>
                              setShowScore(label as 'Accuracy' | 'Fluency' | 'Intonation')
                            }
                            className={`w-10 h-10 flex items-center justify-center rounded-full text-[#141414] text-sm font-medium focus:outline-none ${color}`}
                            aria-label={`Show ${label} score details`}
                          >
                            {Math.round(value)}
                          </button>
                          <span className="text-sm">{label}</span>
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
                                  ? textFeedback?.accuracyText || ''
                                  : label === 'Fluency'
                                    ? textFeedback?.fluencyText || ''
                                    : textFeedback?.intonationText || ''
                              }
                              transcript={textFeedback?.transcript || ''}
                              specificIssues={textFeedback?.specificIssues || []}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Actions — 50% width on lg */}
              <div className="flex justify-between gap-4 pt-2 w-full lg:w-1/2 lg:mx-auto">
                <button
                  onClick={resetAudioState}
                  className="flex-1 py-4 bg-white text-black rounded-full border-b-3 border-r-1 border-[#ebe6df] shadow hover:cursor-pointer"
                >
                  Retry
                </button>
                <button
                  onClick={toNextStepOrFinish}
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
