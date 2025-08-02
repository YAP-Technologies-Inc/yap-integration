'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { useRouter } from "next/navigation";
import { TablerChevronLeft } from "@/icons";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export default function SpanishTeacherConversation() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = "agent_01k0mav3kjfk3s4xbwkka4yg28";

  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onMessage: (msg) => {
      if (typeof msg.message !== "string") return;
      const sender = msg.source === "user" ? "user" : "ai";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: msg.message,
          sender,
          timestamp: new Date(),
        },
      ]);
    },
    onError: (err) => {
      console.error("Conversation error:", err);
      setError(`Connection error: ${typeof err === "string" ? err : "Unknown error"}`);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = useCallback(async () => {
  setError(null);
  setMessages([]);
  setIsLoading(true);

  try {
    const conversationId = await conversation.startSession({
      agentId: AGENT_ID,
    });
    console.log('Started conversation:', conversationId);
  } catch (err: any) {
    console.error('Start session failed:', err);
    setError(`Failed to start: ${err?.message ?? String(err)}`);
  } finally {
    setIsLoading(false);
  }
}, [conversation]);


  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.error("End session failed:", err);
    }
  }, [conversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="relative bg-background-primary min-h-[100dvh]">
      <div className="absolute top-0 left-0 right-0 h-16 bg-background-primary flex flex-col items-center justify-center z-10 px-4">
        <button
          onClick={() => router.push("/home")}
          className="absolute left-4 top-4"
        >
          <TablerChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-2xl font-bold text-[#2D1C1C]">
          AI Spanish Teacher
        </h1>
        <p className="text-sm text-[#5C4B4B]">
          Practice your Spanish conversation
        </p>
      </div>

      {/* 2) Main content, pushed down by header height */}
      <div className="pt-16 flex flex-col items-center px-4" style={{ minHeight: '100vh' }}>
        {/* Chat Log */}
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-4 flex flex-col overflow-hidden h-[30vh] mt-4">
          {error && <div className="mb-2 text-red-500 text-center text-xs">{error}</div>}
          <div className="flex-1 overflow-y-auto space-y-2 p-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-1">
                No messages yet
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-3 py-1 max-w-[70%] text-sm shadow-sm ${
                      msg.sender === "user"
                        ? "bg-[#FFD166] text-[#2D1C1C]"
                        : "bg-[#f1f3f5] text-[#2D1C1C]"
                    }`}
                  >
                    <div>{msg.text}</div>
                    <div className="text-xs text-gray-400 text-right mt-1">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Spacer pushes the button to the bottom */}
        <div className="flex-1" />

        {/* Controls */}
        <div className="w-full max-w-md flex justify-center pb-2">
          {!isConnected ? (
            <button
              onClick={startConversation}
              disabled={isLoading}
              className={`w-full bg-secondary text-white font-bold py-3 rounded-lg shadow-md transition-colors duration-200 ${
                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-secondary-dark"
              }`}
            >
              {isLoading ? "Connecting…" : "Start Conversation"}
            </button>
          ) : (
            <button
              onClick={stopConversation}
              className="w-full bg-red-500 text-white font-bold py-3 rounded-lg shadow-md hover:bg-red-600 transition-colors duration-200"
            >
              End Conversation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
