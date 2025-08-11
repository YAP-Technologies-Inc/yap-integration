"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TablerMicrophone, TablerSend2, TablerPlay, TablerPlayerPauseFilled, TablerX } from "@/icons";
import { useSnackbar } from "@/components/ui/SnackBar";

interface TutorProps {
  // Sends text to the agent (ElevenLabs)
  sendMessage: (message: string) => Promise<void>;
  // Appends a user text bubble to the chat (when typing)
  onUserMessage: (text: string) => void;
  // Appends a user audio bubble to the chat (after Send)
  onUserAudio: (audioUrl: string) => void;

  userName?: string;
}

const pickMime = () => {
  const candidates = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const t of candidates) {
    // @ts-ignore
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t)) return t;
  }
  return ""; // let the browser choose
};

const formatTime = (sec: number) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function Tutor({
  sendMessage,
  onUserMessage,
  onUserAudio,
  userName = "User",
}: TutorProps) {
  const { showSnackbar } = useSnackbar();

  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  // pending audio lives in the composer until user hits Send
  const [pendingAudioUrl, setPendingAudioUrl] = useState<string | null>(null);
  const [pendingAudioBlob, setPendingAudioBlob] = useState<Blob | null>(null);
  const [pendingMime, setPendingMime] = useState<string | null>(null);

  // simple custom player state for the pending audio chip
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currTime, setCurrTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // media capture
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunks = useRef<Blob[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;

  const hardKillMicrophone = async () => {
    try { mediaRecorderRef.current?.stop(); } catch {}
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    mediaStreamRef.current = null;
    setIsRecording(false);
  };

  useEffect(() => {
    return () => {
      hardKillMicrophone();
      // cleanup pending object URL
      if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // wire up audio element events for the chip
  useEffect(() => {
    if (!audioRef.current) return;
    const el = audioRef.current;

    const onLoaded = () => setDuration(el.duration || 0);
    const onTime = () => setCurrTime(el.currentTime || 0);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrTime(0);
    };

    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);

    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [pendingAudioUrl]); // attach when chip exists

  const togglePlay = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (isPlaying) {
      el.pause();
      setIsPlaying(false);
    } else {
      try {
        await el.play();
        setIsPlaying(true);
      } catch {
        // autoplay may fail etc.
      }
    }
  };

  const clearPendingAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (pendingAudioUrl) URL.revokeObjectURL(pendingAudioUrl);
    setPendingAudioUrl(null);
    setPendingAudioBlob(null);
    setPendingMime(null);
    setIsPlaying(false);
    setCurrTime(0);
    setDuration(0);
  };

  const handleRecord = async () => {
    if (isRecording) {
      await hardKillMicrophone();
      return;
    }

    // if a previous recording is staged, remove it
    if (pendingAudioUrl) clearPendingAudio();

    try {
      await hardKillMicrophone();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const mimeType = pickMime();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mr;
      recordedChunks.current = [];

      mr.ondataavailable = (e) => {
        if (e.data?.size > 0) recordedChunks.current.push(e.data);
      };

      mr.onstop = async () => {
        const blobType = mr.mimeType || "audio/webm";
        const blob = new Blob(recordedChunks.current, { type: blobType });
        recordedChunks.current = [];

        const localUrl = URL.createObjectURL(blob);
        setPendingAudioUrl(localUrl);
        setPendingAudioBlob(blob);
        setPendingMime(blob.type || "audio/webm");
      };

      mr.start();
      setIsRecording(true);

      // safety stop after 15s
      setTimeout(() => {
        if (mr.state === "recording") {
          mr.stop();
          setIsRecording(false);
        }
      }, 15000);
    } catch (err) {
      console.error("Recording error:", err);
      showSnackbar({
        message: "Mic permission denied or not available.",
        variant: "error",
        duration: 3000,
      });
      await hardKillMicrophone();
    }
  };

  const handleSend = async () => {
    // CASE 1: sending staged audio (preferred when present)
    if (pendingAudioBlob && pendingAudioUrl) {
      // visually add the audio bubble to chat
      onUserAudio(pendingAudioUrl);

      // transcribe in background, send ONLY text to agent; do not show transcript
      try {
        const fd = new FormData();
        // pick sensible extension based on mime
        const mime = pendingMime || pendingAudioBlob.type || "audio/webm";
        const ext =
          mime.includes("mp3") ? "mp3" :
          mime.includes("mp4") ? "mp4" :
          mime.includes("m4a") ? "m4a" :
          mime.includes("ogg") ? "ogg" :
          "webm";
        fd.append("audio", pendingAudioBlob, `recording.${ext}`);

        const res = await fetch(`${API_URL}/api/transcribe`, { method: "POST", body: fd });
        if (!res.ok) throw new Error(`Transcribe failed (${res.status})`);
        const data = await res.json();
        const transcript = (data?.text || data?.transcript || "").trim();
        if (transcript) {
          await sendMessage(transcript); // only the AI sees this
        } else {
          showSnackbar({ message: "No transcript detected.", variant: "error", duration: 2500 });
        }
      } catch (err) {
        console.error("Transcription error:", err);
        showSnackbar({ message: "Transcription failed.", variant: "error", duration: 3000 });
      } finally {
        // clear the composer chip after sending
        setTimeout(() => {
          // keep the ObjectURL alive for the chat bubble (we passed the same URL);
          // we only clear our composer state here.
          setPendingAudioBlob(null);
          setPendingMime(null);
          setIsPlaying(false);
          setCurrTime(0);
          setDuration(0);
          setPendingAudioUrl(null);
        }, 0);
      }
      return;
    }

    // CASE 2: sending typed text
    const msg = input.trim();
    if (!msg) return;

    onUserMessage(msg);
    await sendMessage(msg);
    setInput("");
  };

  return (
    <div className="mx-auto my-8 bg-white rounded-3xl shadow-lg p-4 w-[90vw]">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          {/* Audio chip shows up above the textarea when a recording is staged */}
          {pendingAudioUrl && (
            <div className="mb-2 rounded-2xl bg-[#2D1C1C] text-white px-3 py-2 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <TablerPlayerPauseFilled className="w-5 h-5 text-white" />
                  ) : (
                    <TablerPlay className="w-5 h-5 text-white" />
                  )}
                </button>
                <div className="text-xs opacity-90">{formatTime(currTime)} / {formatTime(duration)}</div>
              </div>

              <button
                onClick={clearPendingAudio}
                className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                aria-label="Remove recording"
                title="Remove recording"
              >
                <TablerX className="w-4 h-4 text-white" />
              </button>

              {/* hidden audio element driving playback */}
              <audio ref={audioRef} src={pendingAudioUrl} className="hidden" preload="metadata" />
            </div>
          )}

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                await handleSend();
              }
            }}
            className="w-full min-h-[60px] rounded-md font-semibold focus:outline-none focus:border-transparent text-secondary resize-none"
            placeholder={isRecording ? "Recording..." : "Message to Tutor..."}
            // optional: disable typing while a recording is staged
            // disabled={!!pendingAudioUrl}
          />

          <div className="flex justify-between mt-2">
            <button
              onClick={handleRecord}
              className={`text-gray-700 rounded-full p-3 ring-2 transition-all ${
                isRecording ? "ring-red-400 bg-red-100 animate-pulse" : "ring-gray-300 hover:ring-gray-400"
              } cursor-pointer flex items-center justify-center`}
            >
              <TablerMicrophone className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() && !pendingAudioUrl}
              className="bg-background-secondary text-white border-none rounded-md px-4 py-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send <TablerSend2 className="w-5 h-5 inline-block ml-1 pb-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
