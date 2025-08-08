"use client";

import { useState } from "react";
import { TablerMicrophone, TablerSend2 } from "@/icons";

interface TutorProps {
  sendMessage: (message: string) => Promise<void>;
  onUserMessage: (text: string) => void;
}

export default function Tutor({ sendMessage, onUserMessage }: TutorProps) {
  const [input, setInput] = useState("");
  const [transcript, setTranscript] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = async () => {
    const textToSend = transcript || input.trim();
    if (!textToSend) return;

    onUserMessage(textToSend);
    await sendMessage(textToSend);

    setInput("");
    setTranscript(null);
  };

  const handleRecord = async () => {
    if (isRecording) {
      console.log("Already recording — ignoring new start.");
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      let resultReceived = false;

      recognition.onstart = () => {
        console.log("🎙️ Speech recognition started");
        setIsRecording(true);
      };

      recognition.onspeechstart = () => {
        console.log("Speech detected 🎙️");
      };

      recognition.onspeechend = () => {
        console.log("Speech ended 🛑");
      };

      recognition.onresult = async (event: any) => {
        resultReceived = true;
        const transcript = event.results?.[0]?.[0]?.transcript;
        console.log("✅ Transcript:", transcript);

        if (transcript) {
          setTranscript(transcript);
          onUserMessage(transcript);
          await sendMessage(transcript);
        } else {
          console.warn("Transcript was empty");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        console.log("⛔ Speech recognition ended");
        setIsRecording(false);

        // Restart if no result received (browser bug)
        if (!resultReceived) {
          console.warn("No result received. Retrying...");
          recognition.start();
        }
      };

      // Optional: timeout fallback in case nothing happens
      const timeoutId = setTimeout(() => {
        if (!resultReceived && isRecording) {
          console.warn(
            "⚠️ No speech detected within timeout. Stopping manually."
          );
          recognition.stop();
        }
      }, 8000); // 8 sec timeout

      // Mic permission check
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      recognition.start();
    } catch (err) {
      console.error("Error setting up speech recognition:", err);
    }
  };

  return (
    <div className="mx-auto my-8 bg-white rounded-3xl shadow-lg p-4 w-[90vw]">
      <textarea
        value={transcript ?? input}
        onChange={(e) => {
          setInput(e.target.value);
          setTranscript(null);
        }}
        className="w-full min-h-[60px] rounded-md font-semibold focus:outline-none focus:border-transparent text-secondary resize-none"
        placeholder="Message to Tutor..."
      />

      <div className="flex justify-between mt-2">
        <button
          onClick={handleRecord}
          disabled={isRecording}
          className={`text-gray-700 rounded-full p-3 ring-2 ${
            isRecording ? "ring-red-400 bg-red-100" : "ring-gray-300"
          } cursor-pointer flex items-center justify-center`}
        >
          <TablerMicrophone className="w-5 h-5" />
        </button>

        <button
          onClick={handleSend}
          disabled={isRecording}
          className="bg-background-secondary text-white border-none rounded-md px-4 py-2 cursor-pointer"
        >
          Send <TablerSend2 className="w-5 h-5 inline-block ml-1 pb-1" />
        </button>
      </div>
    </div>
  );
}
