"use client";

import { useState, useRef, useEffect } from "react";
import { TablerMicrophone, TablerSend2 } from "@/icons";

interface TutorProps {
  sendMessage: (message: string) => Promise<void>;
  onUserMessage: (text: string) => void;
  userName?: string;
}

export default function Tutor({
  sendMessage,
  onUserMessage,
  userName = "User",
}: TutorProps) {
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Hard kill all microphone access
  const hardKillMicrophone = async () => {
    console.log("HARD KILLING MICROPHONE...");

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.abort();
        console.log("Speech recognition aborted");
      } catch (err) {
        console.log("Error aborting recognition:", err);
      } finally {
        recognitionRef.current = null;
      }
    }

    // Stop media stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
        console.log("Stopped media track:", track.kind);
      });
      mediaStreamRef.current = null;
    }

    setIsRecording(false);
    console.log("MICROPHONE HARD KILLED");
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      hardKillMicrophone();
    };
  }, []);

  const stopRecording = async () => {
    console.log("Stopping recording...");
    await hardKillMicrophone();
  };

  const handleSend = async () => {
    const textToSend = transcript || input.trim();
    if (!textToSend) return;

    // Hard kill microphone if active
    if (isRecording) {
      await hardKillMicrophone();
    }

    onUserMessage(textToSend);
    await sendMessage(textToSend);

    setInput("");
    setTranscript(null);
  };

  const handleRecord = async () => {
    if (isRecording) {
      // HARD KILL when stopping
      await hardKillMicrophone();
      return;
    }

    try {
      // Hard kill any existing streams first
      await hardKillMicrophone();

      // Get fresh microphone access
      console.log("Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log("Microphone access granted");

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        console.error("Speech recognition not supported");
        await hardKillMicrophone();
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.continuous = false;

      recognition.onstart = () => {
        console.log("Recording started");
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        console.log("Transcript:", transcript);

        if (transcript) {
          setTranscript(transcript);
          setInput(transcript);
        }

        // Hard kill after getting result
        hardKillMicrophone();
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        hardKillMicrophone();
      };

      recognition.onend = () => {
        console.log("Recognition ended");
        hardKillMicrophone();
      };

      recognitionRef.current = recognition;
      recognition.start(); // start AFTER storing it

      // Safety timeout - hard kill after 10 seconds
      setTimeout(() => {
        if (isRecording) {
          console.log("Timeout - hard killing microphone");
          hardKillMicrophone();
        }
      }, 10000);
    } catch (err) {
      console.error("Error setting up speech recognition:", err);
      await hardKillMicrophone();
    }
  };

  const firstInitial = userName.charAt(0).toUpperCase() || "?";

  return (
    <div className="mx-auto my-8 bg-white rounded-3xl shadow-lg p-4 w-[90vw]">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setTranscript(null);
            }}
            onKeyDown={async (e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                await handleSend();
              }
            }}
            className="w-full min-h-[60px] rounded-md font-semibold focus:outline-none focus:border-transparent text-secondary resize-none"
            placeholder={
              isRecording ? "Listening..." : "Message to Tutor..."
            }
          />

          <div className="flex justify-between mt-2">
            <button
              onClick={handleRecord}
              className={`text-gray-700 rounded-full p-3 ring-2 transition-all ${
                isRecording
                  ? "ring-red-400 bg-red-100 animate-pulse"
                  : "ring-gray-300 hover:ring-gray-400"
              } cursor-pointer flex items-center justify-center`}
            >
              <TablerMicrophone className="w-5 h-5" />
            </button>

            <button
              onClick={handleSend}
              disabled={!input.trim() && !transcript}
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
