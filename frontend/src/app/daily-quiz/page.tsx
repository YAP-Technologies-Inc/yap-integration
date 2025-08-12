"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  TablerX as TablerXIcon,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophoneFilled,
  TablerVolume,
  TablerFlagFilled,
  TablerCheck,
  TablerX,
} from "@/icons";
import { ReportIssue } from "@/components/debug/ReportIssue";
import Flashcard from "@/components/cards/FlashCard";
import { useSnackbar } from "@/components/ui/SnackBar";
import { getRandomFeedbackPhrase } from "@/utils/feedbackPhrase";
import mockDailyQuiz from "@/mock/mockDailyQuizShort";

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
} from "@/utils/dailyQuizStorage";
import { statusNetworkSepolia } from "@wagmi/core/chains";

const PASSING_CARD_SCORE = 70; // per-card pass threshold (visual only)
const PASSING_AVG = 90; // quiz pass threshold (avg)
const MAX_ATTEMPTS = 3;

type Step = {
  variant: "vocab";
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

  // Build steps from mock (identical look to LessonUi)
  const allSteps: Step[] = (mockDailyQuiz?.[0]?.questions ?? []).map((q) => ({
    variant: "vocab",
    front: q.es,
    back: q.en,
    example: q.example,
  }));

  const total = allSteps.length;

  // Load persisted quiz state for today
  const initial =
    typeof window !== "undefined"
      ? getQuizState(total)
      : {
          attemptsLeft: MAX_ATTEMPTS,
          scores: Array(total).fill(-1),
          completed: false,
          avgScore: 0,
        };
  const [attemptsLeft, setAttemptsLeft] = useState<number>(
    initial.attemptsLeft
  );
  const [scores, setScores] = useState<number[]>(initial.scores);
  const [avgScore, setAvgScore] = useState<number>(initial.avgScore);
  const [completed, setCompleted] = useState<boolean>(initial.completed);

  const [stepIndex, setStepIndex] = useState(0);
  const current = allSteps[stepIndex];

  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [breakdown, setBreakdown] = useState<{
    accuracy: number;
    fluency: number;
    completeness: number;
  } | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { showSnackbar, removeSnackbar } = useSnackbar();


  const referenceText = current?.front ?? "";
  const needsSpeaking = true;

  const resetAudioState = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setScore(null);
    setFeedback(null);
    setBreakdown(null);
  };

  const getSupportedMimeType = (): string => {
    const types = [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg",
    ];
    return (
      types.find((t) => (window as any).MediaRecorder?.isTypeSupported?.(t)) ||
      ""
    );
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        showSnackbar({
          message: "No supported recording format found",
          variant: "error",
          duration: 3000,
        });
        return;
      }
      const mr = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
      };
      setMediaRecorder(mr);
      setIsRecording(true);
      mr.start();
    } catch {
      showSnackbar({
        message: "Microphone permission denied or not found",
        variant: "error",
        duration: 3000,
      });
      router.push("/home");
    }
  };
  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const assessPronunciation = async () => {
    if (!audioBlob || !referenceText) return;
    setIsLoading(true);

    const fd = new FormData();
    fd.append("audio", audioBlob, `recording.${audioBlob.type.split("/")[1]}`);
    fd.append("referenceText", referenceText);

    try {
      const res = await fetch(
        `${API_URL}/api/pronunciation-assessment-upload`,
        { method: "POST", body: fd }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();

      const overall =
        result.overallScore ??
        result?.NBest?.[0]?.PronScore ??
        result?.NBest?.[0]?.PronunciationAssessment?.AccuracyScore ??
        0;

      const accuracy =
        result.accuracyScore ??
        result?.NBest?.[0]?.PronunciationAssessment?.AccuracyScore ??
        0;
      const fluency =
        result.fluencyScore ??
        result?.NBest?.[0]?.PronunciationAssessment?.FluencyScore ??
        0;
      const completeness =
        result.completenessScore ??
        result?.NBest?.[0]?.PronunciationAssessment?.CompletenessScore ??
        0;

      const display = Math.round(Number(overall) || 0);
      setScore(display);
      setFeedback(getRandomFeedbackPhrase(display));
      setBreakdown({
        accuracy: Math.round(Number(accuracy) || 0),
        fluency: Math.round(Number(fluency) || 0),
        completeness: Math.round(Number(completeness) || 0),
      });

      // Persist per-step score + avg
      const updated = updateScoreForStep(stepIndex, display, total);
      setScores([...updated.scores]);
      setAvgScore(updated.avgScore);
    } catch {
      showSnackbar({
        message: "Failed to assess pronunciation",
        variant: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toNextStepOrFinish = () => {
    if (stepIndex + 1 < total) {
      setStepIndex(stepIndex + 1);
      resetAudioState();
      return;
    }
    // reached the end -> evaluate average
    const finalScores = scores.map((s, i) =>
      i === stepIndex && score != null ? score : s
    );
    const avg = computeAvg(finalScores);
    setAvgScore(avg);

    if (avg >= PASSING_AVG) {
      markCompleted(total); // sets completed: true
      setCompleted(true);
      // Do NOT store avgScore for passing attempts (let completed state handle UI)
      verifyQuizCompletion();
    } else {
      // Store the attempt’s final average so card can display it
      setLastAttemptAvg(total, avg); // ⬅Store last completed attempt avg
      setAttemptAvg(total, avg); // (optional: if you want to keep avgScore for in-progress)
      window.dispatchEvent(new Event("daily-quiz-progress"));

      if (attemptsLeft > 1) {
        const afterDec = decrementAttempt(total);
        setAttemptsLeft(afterDec.attemptsLeft);

        // fresh retry: reset scores but keep attemptsLeft
        const fresh = resetForRetry(total);
        setScores(fresh.scores);
        setStepIndex(0);
        resetAudioState();

        showSnackbar({
          message: `Average ${avg}%. Try again! Attempts left: ${afterDec.attemptsLeft}`,
          variant: "error",
          duration: 3000,
        });
      } else {
        const decFinal = decrementAttempt(total);
        setAttemptsLeft(decFinal.attemptsLeft);
        showSnackbar({
          message: "Quiz failed. No attempts left for today.",
          variant: "error",
          duration: 3500,
        });
        router.push("/home");
      }
    }
  };

  const verifyQuizCompletion = async () => {
    const snackId = Date.now();
    setIsVerifying(true);
    showSnackbar({
      id: snackId,
      message: "Verifying quiz on-chain…",
      variant: "completion",
      manual: true,
    });

    try {
      const res = await fetch(`${API_URL}/api/complete-daily-quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, walletAddress }),
      });
      if (!res.ok) throw new Error("Verification failed");

      removeSnackbar(snackId);
      showSnackbar({
        message: "Daily Quiz complete! YAP token sent",
        variant: "custom",
        duration: 3000,
      });

      // Mark completed in storage
      markCompleted(total);

      setTimeout(() => {
        setIsVerifying(false);
        router.push("/home");
      }, 1000);
    } catch {
      removeSnackbar(snackId);
      showSnackbar({
        message: "Quiz failed to verify. Please try again.",
        variant: "error",
      });
      setIsVerifying(false);
    }
  };

  // Play chime on score
  useEffect(() => {
    if (score == null) return;
    const sound =
      score >= PASSING_CARD_SCORE
        ? "/audio/correct.mp3"
        : "/audio/incorrect.mp3";
    new Audio(sound).play().catch(() => {});
  }, [score]);

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
        {/* Top bar */}
        <div className="flex items-center">
          <button
            onClick={() => router.push("/home")}
            className="text-secondary hover:cursor-pointer"
          >
            <TablerXIcon className="w-6 h-6" />
          </button>
          <h3 className="flex-1 text-center text-secondary font-bold text-xl">
            Daily Quiz
          </h3>
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

        {/* Progress bar */}
        <div className="w-full flex-shrink-0">
          <div className="h-4 w-full border-2 border-gray-50 bg-white/90 rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary transition-all"
              style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* Card */}
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

        {/* Mic controls */}
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
                          ? "opacity-50 pointer-events-none"
                          : "hover:cursor-pointer"
                      }`}
                    >
                      <TablerRefresh className="w-8 h-8 text-secondary" />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      isRecording ? stopRecording() : startRecording()
                    }
                    disabled={isLoading || isVerifying || !!audioURL}
                    className={`w-20 h-20 bg-[#EF4444] rounded-full shadow-md flex items-center justify-center border-b-3 border-[#bf373a] ${
                      isLoading || isVerifying || !!audioURL
                        ? "opacity-50 pointer-events-none"
                        : "hover:cursor-pointer"
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
                          ? "opacity-50 pointer-events-none"
                          : "hover:cursor-pointer"
                      }`}
                    >
                      <TablerVolume className="w-8 h-8 text-secondary" />
                    </button>
                  )}
                </div>
                {audioURL && (
                  <audio ref={audioRef} src={audioURL} className="hidden" />
                )}
              </div>

              <div className="pb-2">
                <button
                  onClick={assessPronunciation}
                  disabled={!audioURL || isLoading}
                  className={`w-full py-4 rounded-4xl border-b-3 border-black ${
                    audioURL
                      ? "bg-secondary text-white border-b-3 border-r-1 font-semibold border-black"
                      : "bg-secondary/70 border-b-3 border-r-1 border-black/70 text-white cursor-not-allowed"
                  }`}
                >
                  {isLoading ? "Scoring…" : "Submit"}
                </button>
              </div>
            </>
          )}

          {/* Post-score actions */}
          {score !== null && (
            <div className="w-full rounded-xl pb-2 space-y-4">
              <div
                className={`w-screen left-1/2 right-1/2 -ml-[50vw] relative h-1 rounded-full mb-3 ${
                  score >= PASSING_CARD_SCORE ? "bg-green-200" : "bg-red-200"
                }`}
              />
              <div className="flex flex-col items-start mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className={`w-8 h-8 rounded-xl border-b-3 border-r-1 flex items-center mb-2 ml-1 justify-center ${
                      score >= PASSING_CARD_SCORE
                        ? "bg-[#4eed71] border-[#41ca55]"
                        : "bg-[#f04648] border-[#d12a2d]"
                    }`}
                  >
                    {score >= PASSING_CARD_SCORE ? (
                      <TablerCheck className="w-6 h-6 text-white" />
                    ) : (
                      <TablerX className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <p className="text-2xl font-semibold text-[#2D1C1C]">
                    {score >= PASSING_CARD_SCORE ? "Correct" : "Incorrect"}
                  </p>
                </div>

                <div className="flex flex-row gap-6 text-secondary">
                  {[
                    { label: "Pronunciation", value: breakdown?.accuracy ?? 0 },
                    { label: "Speed", value: breakdown?.fluency ?? 0 },
                    {
                      label: "Similarity",
                      value: breakdown?.completeness ?? 0,
                    },
                  ].map(({ label, value }) => {
                    let color =
                      "bg-tertiary border-b-3 border-r-1 border-[#e4a92d]";
                    if (value >= PASSING_CARD_SCORE)
                      color =
                        "bg-[#4eed71] border-b-3 border-r-1 border-[#41ca55]";
                    else if (value < 60)
                      color =
                        "bg-[#f04648] border-b-3 border-r-1 border-[#bf383a]";
                    return (
                      <div className="flex items-center gap-2" key={label}>
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full text-[#141414] text-sm font-medium ${color}`}
                        >
                          {Math.round(value)}
                        </div>
                        <span className="text-sm">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between gap-4 pt-2">
                <button
                  onClick={() => {
                    // retry this card (doesn't change attempts)
                    resetAudioState();
                  }}
                  className="flex-1 py-4 bg-white text-black rounded-full border-b-3 border-r-1 border-[#ebe6df] shadow"
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

        {isVerifying && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        )}
      </div>
    </div>
  );
}
