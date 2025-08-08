"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { usePrivy, useWallets } from "@privy-io/react-auth";

import {
  TablerX,
  TablerRefresh,
  TablerPlayerPauseFilled,
  TablerMicrophoneFilled,
  TablerVolume,
  TablerFlagFilled,
  TablerCheck,
} from "@/icons";
import { ReportIssue } from "@/components/debug/ReportIssue";

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
  const [showReport, setShowReport] = useState(false);

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
      // Final step — trigger verify
      verifyLessonCompletion();
    } else {
      // Normal step — advance
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

    const blobToUpload = audioBlob;
    setAudioURL(null);
    setIsRecording(false);
    setScore(null);
    setFeedback(null);
    setBreakdown(null);
    setIsLoading(true);

    const fd = new FormData();
    fd.append(
      "audio",
      blobToUpload,
      `recording.${blobToUpload.type.split("/")[1]}`
    );

    fd.append("referenceText", referenceText);

    try {
      const res = await fetch(
        `${API_URL}/api/pronunciation-assessment-upload`,
        {
          method: "POST",
          body: fd,
        }
      );
      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const result = await res.json();
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
      await new Promise((r) => setTimeout(r, 300)); // animate flip
    } catch (err) {
      console.error("Assessment error:", err);
      pushToast("Assessment failed", "error");
    } finally {
      setIsLoading(false);
    }
  };
  const verifyLessonCompletion = async () => {
    const snackId = Date.now();
    setIsVerifying(true);
    showSnackbar({
      id: snackId,
      message: "Verifying lesson on-chain…",
      variant: "completion",
      manual: true,
    });

    try {
      const res = await fetch(`${API_URL}/api/complete-lesson`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, walletAddress, lessonId }),
      });

      if (!res.ok) throw new Error("Verification failed");

      removeSnackbar(snackId);
      showSnackbar({
        message: "Lesson complete! YAP token sent",
        variant: "custom",
        duration: 3000,
      });

      setTimeout(() => {
        setIsVerifying(false);
        router.push("/home");
      }, 1200);
    } catch (err) {
      removeSnackbar(snackId);
      showSnackbar({
        message: "Lesson failed to verify. Please try again.",
        variant: "error",
      });
      setIsVerifying(false);
      console.error("Verification error:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background-primary flex flex-col h-[100dvh] overflow-hidden">
      <div className="min-h-[100dvh] fixed inset-0 bg-background-primary flex flex-col px-4 ">
        <div className="flex items-center">
          <button
            onClick={() => router.push("/home")}
            className="text-secondary hover:cursor-pointer"
          >
            <TablerX className="w-6 h-6" />
          </button>
          <h3 className="flex-1 text-center text-secondary font-bold text-xl">
            Vocabulary
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
        <div className="w-full flex-shrink-0">
          <div className="h-4 w-full border-2 border-gray-50 bg-white/90 rounded-full overflow-hidden">
            <div
              className="h-full bg-tertiary transition-all"
              style={{ width: `${((stepIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        {/* Card area */}
        <div className="flex flex-1 items-start justify-center mt-8 min-h-[56dvh] sm:min-h-[50dvh]">
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
              stepIndex={stepIndex} // <-- passed in
              total={total} // <-- passed in
              score={score} // <-- passed in
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
                  disabled={
                    isLoading || isVerifying || !!audioURL // lock mic if there's a recording
                  }
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
                    className={`w-16 h-16 bg-white rounded-full shadow flex items-center justify-center border-b-3 border-r-1 border-[#e2ddd3]${
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
          )}

          {/* Submit Button */}
          {score === null && (
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
          )}
          {/* Score + Feedback + Actions */}
          {score !== null && (
            <div className="w-full rounded-xl pb-2 space-y-4">
              <div
                className={`w-screen left-1/2 right-1/2 -ml-[50vw] relative h-1 rounded-full mb-3 ${
                  score >= passingScore ? "bg-green-200" : "bg-red-200"
                }`}
              />
                <div className="flex flex-col items-start mb-4">
                {/* Check/X and "Correct"/"Incorrect" */}
                <div className="flex items-center gap-2 mb-2">
                  <div
                  className={`w-8 h-8 rounded-xl border-b-3 border-r-1 flex items-center mb-2 ml-1 justify-center ${
                    score >= passingScore
                    ? "bg-[#4eed71] border-[#41ca55]"
                    : "bg-[#f04648] border-[#d12a2d]"
                  }`}
                  >
                  {score >= passingScore ? (
                    <TablerCheck className="w-6 h-6 text-white" />
                  ) : (
                    <TablerX className="w-6 h-6 text-white" />
                  )}
                  </div>
                  <p className="text-2xl font-semibold text-[#2D1C1C]">
                  {score >= passingScore ? "Correct" : "Incorrect"}
                  </p>
                </div>

                {/* Score breakdown - left aligned with icon above */}
                <div className="flex flex-row gap-6 text-secondary">
                  {[
                    {
                      label: "Pronunciation",
                      value: breakdown?.accuracy ?? 0,
                    },
                    {
                      label: "Speed",
                      value: breakdown?.fluency ?? 0,
                    },
                    {
                      label: "Similarity",
                      value: breakdown?.completeness ?? 0,
                    },
                  ].map(({ label, value }) => {
                    let color = "bg-tertiary border-b-3 border-r-1 border-[#e4a92d]";
                    if (value >= passingScore)
                      color = "bg-[#4eed71] border-b-3 border-r-1 border-[#41ca55]";
                    else if (value < 60)
                      color = "bg-[#f04648] border-b-3 border-r-1 border-[#bf383a]";

                    return (
                      <div className="flex items-center gap-2" key={label}>
                        <div
                          className={`w-10 h-10 flex items-center justify-center rounded-full text-[#141414] text-sm font-medium ${color}`}
                        >
                          {value}
                        </div>
                        <span className="text-sm">{label}</span>
                      </div>
                    );
                  })}
                </div>
                </div>

              <div className="flex justify-between gap-4 pt-2">
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

        {isVerifying && (
          <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm" />
        )}
      </div>
    </div>
  );
}
