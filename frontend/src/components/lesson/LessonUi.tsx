"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  const [textFeedback, setTextFeedback] = useState<null | {
    transcript: string;
    accuracyText: string;
    fluencyText: string;
    intonationText: string;
    overallText: string;
    specificIssues: string[];
  }>(null);

  // === SPEECH TRANSCRIPT STATE (fresh per attempt) ===
  const [spokenText, setSpokenText] = useState("");
  const recognitionRef = useRef<any>(null);
  const attemptIdRef = useRef<string>(""); // NEW: id per attempt
  const [hasFreshTranscript, setHasFreshTranscript] = useState(false); // NEW

  // Init Web Speech once
  useEffect(() => {
    const SR =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.lang = "es-ES";
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const t = e?.results?.[0]?.[0]?.transcript || "";
      setSpokenText(t);
      setHasFreshTranscript(true); // mark transcript as captured THIS attempt
      console.log("[SR] transcript:", t);
    };
    recognitionRef.current = rec;
  }, []);

  const [breakdown, setBreakdown] = useState<{
    accuracy: number;
    fluency: number;
    completeness: number; // used for Intonation in UI
  } | null>(null);

  const needsSpeaking =
    current.variant === "sentence" || current.variant === "vocab";

  const referenceText =
    current.variant === "sentence"
      ? current.question
      : current.variant === "vocab"
      ? current.front
      : "";

  // Add near other useStates
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple uid for correlating client/server logs
  const newUploadId = () => Math.random().toString(36).slice(2);

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
    setBreakdown(null);
    setSpokenText("");
    setHasFreshTranscript(false);
  };

  const getSupportedMimeType = (): string => {
    // Prefer plain types first (no ";codecs=...")
    const types = [
      "audio/webm", // Chrome/Android
      "audio/mp4", // Safari/iOS (records AAC in MP4/M4A container)
      "audio/ogg", // Firefox
      // fallbacks with explicit codecs if needed
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
    ];
    for (const t of types) {
      try {
        if ((MediaRecorder as any).isTypeSupported?.(t)) return t;
      } catch {}
    }
    return ""; // let browser choose
  };

  const startRecording = async () => {
    try {
      // NEW: start a fresh attempt and clear stale state
      attemptIdRef.current = crypto?.randomUUID?.() || newUploadId();
      setSpokenText("");
      setHasFreshTranscript(false);
      setScore(null);
      setBreakdown(null);
      setShowBack(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();

      if (!mimeType) {
        showSnackbar({
          message: "No supported recording format",
          variant: "error",
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

      console.log("[REC] start", {
        mimeType,
        time: Date.now(),
        attempt: attemptIdRef.current,
      });
      recorder.start();
      try {
        recognitionRef.current?.start();
      } catch {}
    } catch (e) {
      showSnackbar({
        message: "Microphone permission denied or not found",
        variant: "error",
        duration: 3000,
      });
      router.push("/home");
    }
  };

  const stopRecording = async () => {
    if (!mediaRecorder) return;
    try {
      const mimeType = (mediaRecorder as any).mimeType || "audio/unknown";
      console.log("[REC] stop requested", {
        mimeType,
        time: Date.now(),
        attempt: attemptIdRef.current,
      });

      const blob = await stopRecorderAndGetBlob(mediaRecorder, mimeType);
      console.log("[REC] stop resolved", { size: blob.size, type: blob.type });

      // Min guard: avoid zero-byte/few-byte blobs
      if (!blob || blob.size < 200) {
        console.warn("[REC] tiny/empty blob - ignoring", { size: blob?.size });
        showSnackbar({
          message: "Recording too short, try again",
          variant: "error",
          duration: 2000,
        });
        return;
      }

      // Create URL & store
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioURL(url);
    } catch (err) {
      console.error("[REC] stop error", err);
      showSnackbar({
        message: "Recording error",
        variant: "error",
        duration: 2000,
      });
    } finally {
      setIsRecording(false);
      setMediaRecorder(null);
      try {
        recognitionRef.current?.stop();
      } catch {}
      // Release mic tracks so browsers don’t keep input “busy”
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
        if (!resolved) reject(e?.error ?? new Error("Recorder error"));
      };

      // Call stop; some browsers need a tick for last dataavailable
      try {
        rec.stop();
      } catch (err) {
        reject(err);
      }
    });

  const [isVerifying, setIsVerifying] = useState(false); // top-level state

  // === UPLOAD & SCORE ===
  const assessPronunciation = async () => {
    if (!referenceText || !audioBlob) return;

    setIsLoading(true);
    try {
      const cleanMime = (audioBlob.type || "audio/webm").split(";")[0];
      const ext = cleanMime.includes("webm")
        ? "webm"
        : cleanMime.includes("ogg")
        ? "ogg"
        : cleanMime.includes("m4a")
        ? "m4a"
        : cleanMime.includes("mp4")
        ? "m4a"
        : cleanMime.includes("wav")
        ? "wav"
        : "dat";

      const normalizedBlob = new Blob([audioBlob], { type: cleanMime });

      console.log("[UPLOAD] building formdata", {
        attempt: attemptIdRef.current,
        blobType: audioBlob.type,
        cleanMime,
        size: audioBlob.size,
        ext,
        hasTranscriptThisAttempt: hasFreshTranscript,
        referenceText,
      });

      const fd = new FormData();
      fd.append("audio", normalizedBlob, `recording.${ext}`);
      fd.append("targetPhrase", referenceText);
      fd.append("attemptId", attemptIdRef.current);
      // Only send transcript if captured during THIS attempt
      if (hasFreshTranscript && spokenText?.trim()) {
        fd.append("spokenText", spokenText.trim());
      }

      const res = await fetch(`${API_URL}/api/pronunciation`, {
        method: "POST",
        body: fd,
      });

      // Handle STT overload gracefully
      if (res.status === 503) {
        const err = await res.json().catch(() => ({}));
        console.warn("[PRONUNCIATION] 503:", err);
        showSnackbar({
          message: "Speech engine is busy — please try again.",
          variant: "error",
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
        completeness: result.intonationScore || 0, // "Intonation" slot
      });

      // NEW: console.log and stash text feedback
      console.log("[FEEDBACK]", {
        target: referenceText,
        heard: result.transcript,
        accuracyText: result.accuracyText,
        fluencyText: result.fluencyText,
        intonationText: result.intonationText,
        overallText: result.overallText,
        specificIssues: result.specificIssues,
      });
      setTextFeedback({
        transcript: result.transcript || "",
        accuracyText: result.accuracyText || "",
        fluencyText: result.fluencyText || "",
        intonationText: result.intonationText || "",
        overallText: result.overallText || "",
        specificIssues: Array.isArray(result.specificIssues)
          ? result.specificIssues
          : [],
      });
      setFeedback(result.overallText || "");

      setShowBack(true);
    } catch (e) {
      console.error("[PRONUNCIATION] error", e);
      showSnackbar({
        message: "Failed to assess pronunciation",
        variant: "error",
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

  const correctChime = "/audio/correct.mp3";
  const incorrectChime = "/audio/incorrect.mp3";

  useEffect(() => {
    if (score === null) return;
    const sound = score >= passingScore ? correctChime : incorrectChime;
    const audio = new Audio(sound);
    audio.play();
  }, [score]);

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
                  className={`w-20 h-20 bg-[#EF4444] rounded-full flex items-center justify-center border-b-3 border-r-1 border-[#bf373a] ${
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
                className={`w-full py-4 rounded-4xl border-b-3 border-[white]/30 ${
                  audioURL
                    ? "bg-secondary text-white border-b-3 border-r-1 font-semibold border-black"
                    : "bg-secondary/70 border-b-3 border-r-1 border-[black]/70 text-white cursor-not-allowed"
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
                    { label: "Accuracy", value: breakdown?.accuracy ?? 0 },
                    { label: "Fluency", value: breakdown?.fluency ?? 0 },
                    {
                      label: "Intonation",
                      value: breakdown?.completeness ?? 0,
                    },
                  ].map(({ label, value }) => {
                    let color =
                      "bg-tertiary border-b-3 border-r-1 border-[#e4a92d]";
                    if (value >= passingScore)
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
