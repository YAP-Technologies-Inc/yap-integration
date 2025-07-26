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

import Flashcard from "@/components/cards/Flashcard";
import { GrammarCard } from "@/components/cards/GrammarCard";
import { ComprehensionCard } from "@/components/cards/ComprehensionCard";

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch {
      pushToast("Mic permission denied", "error");
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
    setScore(null);
    setFeedback(null);

    const fd = new FormData();
    fd.append("audio", audioBlob, "recording.webm");
    fd.append("referenceText", referenceText);

    try {
      const res = await fetch(
        "http://localhost:4000/api/pronunciation-assessment-upload",
        {
          method: "POST",
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
      setFeedback("Nice work!");

      setTimeout(async () => {
        if (stepIndex + 1 >= total) {
          await fetch("http://localhost:4000/api/complete-lesson", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId, walletAddress, lessonId }),
          });
          pushToast("Lesson complete! YAP token sent", "success");
          onComplete();
        } else {
          next();
        }
      }, 1500);
    } catch (err) {
      console.error(err);
      pushToast("Assessment failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background-primary flex flex-col pt-4 pb-28 px-4">
      {/* Exit + Progress bar */}
      <div className="flex items-center mb-4">
        <button onClick={() => router.push("/home")} className="text-secondary">
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
      <div className="flex-1 flex items-center justify-center">
        {current.variant === "vocab" && (
          <Flashcard
            front={current.front}
            back={current.back}
            example={current.example}
          />
        )}
        {current.variant === "grammar" && (
          <GrammarCard rule={current.rule} examples={current.examples} />
        )}
        {current.variant === "comprehension" && (
          <ComprehensionCard
            text={current.text}
            questions={current.questions}
          />
        )}
        {current.variant === "sentence" && (
          <div className="relative w-full max-w-sm h-[45vh]">
            <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-30" />
            <div className="absolute inset-0 rounded-2xl bg-white shadow-md opacity-20" />
            <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-center text-center">
              <h2 className="text-2xl font-bold text-secondary mb-4">
                {current.question}
              </h2>
            </div>
          </div>
        )}
      </div>

      {/* Mic controls for speaking steps */}
      {needsSpeaking && (
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
              {isLoading ? "Scoring…" : "Submit"}
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

          {audioURL && (
            <audio ref={audioRef} src={audioURL} className="hidden" />
          )}
        </div>
      )}

      {/* Next button for non-speaking steps */}
      {!needsSpeaking && (
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
