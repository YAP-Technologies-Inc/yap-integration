"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophone,
  TablerVolume,
} from "@/icons";

import Flashcard from "@/components/cards/FlashCard";
import { GrammarCard } from "@/components/cards/GrammarCard";
import { ComprehensionCard } from "@/components/cards/ComprehensionCard";
import { useSnackbar } from "@/components/ui/SnackBar";
import { getRandomFeedbackPhrase } from "@/utils/feedbackPhrase";

interface StepVocab {
  variant: "vocab";
  front: string;
  back: string;
  example?: string;
}
interface StepGrammar {
  variant: "grammar";
  rule: string;
  examples: string[];
}
interface StepComp {
  variant: "comprehension";
  text: string;
  questions: { question: string; answer: string }[];
}
interface StepSentence {
  variant: "sentence";
  question: string;
}

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

  const userId = user?.id;
  const walletAddress = wallets?.[0]?.address;

  const current = allSteps[stepIndex];
  const total = allSteps.length;

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  const { showSnackbar, removeSnackbar } = useSnackbar();
  const [showBack, setShowBack] = useState(false);

  const [breakdown, setBreakdown] = useState<{
    accuracy: number;
    fluency: number;
    completeness: number;
  } | null>(null);

  const needsSpeaking =
    current.variant === "sentence" || current.variant === "vocab";

  const referenceText =
    current.variant === "sentence"
      ? current.question
      : current.variant === "vocab"
      ? current.front
      : "";

  const next = () => {
    if (stepIndex + 1 >= total) {
      onComplete();
    } else {
      setStepIndex(stepIndex + 1);
      resetAudioState();
    }
  };

  const resetAudioState = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setScore(null);
    setFeedback(null);
  };
  const getSupportedMimeType = (): string => {
    const possibleTypes = [
      "audio/mp4",
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg",
    ];
    return (
      possibleTypes.find((type) => MediaRecorder.isTypeSupported(type)) || ""
    );
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        pushToast("No supported recording format found", "error");
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
      pushToast("Microphone permission denied or not found", "error");
      router.push("/home");
    }
  };

  const stopRecording = () => {
    mediaRecorder?.stop();
    setIsRecording(false);
  };

  const [isVerifying, setIsVerifying] = useState(false); // top-level state

  const assessPronunciation = async () => {
    if (!audioBlob || !referenceText) return;

    // SNAP MIC BACK TO READY STATE ──
    const blobToUpload = audioBlob; // preserve for upload
    setAudioURL(null); // hide playback & Submit button
    setIsRecording(false); // ensure mic icon is in “ready” mode
    setScore(null); // clear old score
    setFeedback(null); // clear old feedback
    setBreakdown(null); // clear old breakdown

    // SHOW LOADING ──
    setIsLoading(true);

    // PREPARE FORM DATA ──
    const fd = new FormData();
    fd.append("audio", blobToUpload, "recording.webm");
    fd.append("referenceText", referenceText);

    try {
      //  UPLOAD & GET RAW AZURE RESULT ──
      const res = await fetch(
        `${API_URL}/api/pronunciation-assessment-upload`,
        { method: "POST", body: fd }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const result = await res.json();

      // EXTRACT & DISPLAY SCORES ──
      const raw = result.overallScore ?? 0;
      const display = Math.round(raw);
      setScore(display);
      setFeedback(getRandomFeedbackPhrase(display));
      setBreakdown({
        accuracy: result.accuracyScore || 0,
        fluency: result.fluencyScore || 0,
        completeness: result.completenessScore || 0,
      });

      setShowBack(true);
      await new Promise((r) => setTimeout(r, 300)); // let the flip animate

      if (stepIndex + 1 >= total) {
        const snackId = Date.now();
        setIsVerifying(true);
        showSnackbar({
          id: snackId,
          message: "Verifying lesson on-chain…",
          variant: "completion",
          manual: true,
        });

        try {
          const verifyRes = await fetch(`${API_URL}/api/complete-lesson`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, walletAddress, lessonId }),
          });
          if (!verifyRes.ok) throw new Error("Verification failed");

          removeSnackbar(snackId);
          showSnackbar({
            message: "Lesson complete! YAP token sent",
            variant: "custom",
            duration: 3000,
          });
          setTimeout(() => {
            setIsVerifying(false);
            onComplete();
          }, 1200);
        } catch {
          setIsVerifying(false);
          removeSnackbar(snackId);
          showSnackbar({
            message: "Lesson failed to verify. Please try again.",
            variant: "error",
          });
        }
      } else {
        // non-final: flip back, then advance
        await new Promise((r) => setTimeout(r, 500));
        setShowBack(false);
        next();
      }
    } catch (err) {
      console.error("Assessment error:", err);
      pushToast("Assessment failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h[100dvh] fixed inset-0 bg-background-primary flex flex-col pt-2 px-4">
      {/* Exit + Progress bar */}
      <div className="flex items-center">
        <button
          onClick={() => router.push("/home")}
          className="text-secondary hover:cursor-pointer"
        >
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
        {current.variant === "vocab" && (
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
          />
        )}
        {/* commented out for testing  */}
        {/* {current.variant === 'grammar' && (
          <GrammarCard rule={current.rule} examples={current.examples} />
        )}
        {current.variant === 'comprehension' && (
          <ComprehensionCard
            text={current.text}
            questions={current.questions}
          />
        )} 
        {current.variant === 'sentence' && (
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
            <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />
            <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold text-secondary mb-4">
                {current.question}
              </h2>
            </div>
          </div> 
        )} */}
      </div>

      {/* Mic controls for speaking steps */}
      {needsSpeaking && (
        <div className="fixed bottom-6 left-0 right-0 flex flex-col items-center gap-3">
          {score !== null && (
            <div className="text-center text-secondary">
              <p className="text-lg font-semibold">Score: {score}/100</p>
              {feedback && <p className="text-sm mt-1">{feedback}</p>}

              {breakdown && (
                <div className="mt-2 space-y-1 text-left text-sm">
                  <p>Accuracy: {breakdown.accuracy}/100</p>
                  <p>Fluency: {breakdown.fluency}/100</p>
                  <p>Completeness: {breakdown.completeness}/100</p>
                </div>
              )}
            </div>
          )}

          {audioURL && (
            <button
              onClick={assessPronunciation}
              disabled={isLoading}
              className="text-sm px-3 py-2 bg-green-500 text-white rounded-full shadow hover:cursor-pointer"
            >
              {isLoading ? "Scoring…" : "Submit"}
            </button>
          )}

          <div className="flex items-center justify-center gap-6">
            {audioURL && (
              <button
                onClick={resetAudioState}
                disabled={isLoading || isVerifying}
                className={`w-12 h-12 bg-white rounded-full shadow flex items-center justify-center hover:cursor-pointer ${
                  isLoading || isVerifying
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
              >
                <TablerRefresh className="w-6 h-6 text-[#EF4444]" />
              </button>
            )}

            <button
              onClick={() => (isRecording ? stopRecording() : startRecording())}
              disabled={isLoading || isVerifying}
              className={`w-16 h-16 bg-[#EF4444] rounded-full shadow-md flex items-center justify-center hover:cursor-pointer ${
                isLoading || isVerifying
                  ? "opacity-50 cursor-not-allowed pointer-events-none"
                  : ""
              }`}
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
                disabled={isLoading || isVerifying}
                className={`w-12 h-12 bg-white rounded-full shadow flex items-center justify-center hover:cursor-pointer ${
                  isLoading || isVerifying
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : ""
                }`}
              >
                <TablerVolume className="w-6 h-6 text-[#EF4444]" />
              </button>
            )}
          </div>

          {audioURL && (
            <audio ref={audioRef} src={audioURL} className="hidden" />
          )}
        </div>
      )}
      {isVerifying && (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
      )}
    </div>
  );
}
