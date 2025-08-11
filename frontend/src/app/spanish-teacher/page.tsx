"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/ui/SnackBar";
import { TablerX, TablerPlay, TablerPlayerPauseFilled } from "@/icons";
import { handleSpanishTeacherAccessFromPage } from "@/utils/handleSpanishTeacherAccessFromPage";
import { useMessageSignModal } from "@/components/cards/MessageSignModal";
import { useWallets } from "@privy-io/react-auth";
import { usePrivy } from "@privy-io/react-auth";
import { ethers } from "ethers";
import Tutor from "@/components/cards/Tutor";
import BottomNavBar from "@/components/layout/BottomNavBar";
import { useUserProfile } from "@/hooks/useUserProfile";

interface Message {
  id: string;
  kind: "text" | "audio";
  text?: string;
  audioUrl?: string;
  sender: "user" | "ai";
  timestamp: Date;
}

/** Small helper for mm:ss */
const mmss = (sec: number) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/** Styled, self-contained audio player bubble used inside chat list */
function AudioBubble({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onLoaded = () => setDur(el.duration || 0);
    const onTime = () => setT(el.currentTime || 0);
    const onEnded = () => { setPlaying(false); setT(0); };
    el.addEventListener("loadedmetadata", onLoaded);
    el.addEventListener("timeupdate", onTime);
    el.addEventListener("ended", onEnded);
    return () => {
      el.removeEventListener("loadedmetadata", onLoaded);
      el.removeEventListener("timeupdate", onTime);
      el.removeEventListener("ended", onEnded);
    };
  }, [src]);

  const toggle = async () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
      setPlaying(false);
    } else {
      try {
        await el.play();
        setPlaying(true);
      } catch {
        /* ignore autoplay errors */
      }
    }
  };

  return (
    <div className="rounded-2xl bg-[#2D1C1C] text-white px-3 py-2 shadow-md flex items-center justify-between min-w-[220px]">
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          aria-label={playing ? "Pause" : "Play"}
          className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"
        >
          {playing ? (
            <TablerPlayerPauseFilled className="w-5 h-5 text-white" />
          ) : (
            <TablerPlay className="w-5 h-5 text-white" />
          )}
        </button>
        <div className="text-xs opacity-90">{mmss(t)} / {mmss(dur)}</div>
      </div>
      {/* hidden audio element drives playback */}
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

export default function SpanishTeacherConversation() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbar();

  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;

  const { open } = useMessageSignModal();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");

  const [userId, setUserId] = useState<string | null>(null);
  const { name: userName } = useUserProfile(userId);
  const { signTypedData } = usePrivy();

  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onMessage: (msg) => {
      if (typeof msg.message !== "string") return;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "text",
          text: msg.message,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
    },
    onError: (err) => {
      console.error("Conversation error:", err);
      setError(
        `Connection error: ${typeof err === "string" ? err : "Unknown error"}`
      );
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startConversation = useCallback(async () => {
    try {
      await conversation.startSession({ agentId: AGENT_ID as string });
    } catch (err: any) {
      console.error("Start session failed:", err);
      setError(`Failed to start: ${err?.message ?? String(err)}`);
    }
  }, [conversation, AGENT_ID]);

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem("userId");
      if (!stored) return;
      setUserId(stored);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/teacher-session/${stored}`
        );
        const data = await res.json();
        if (!data.hasAccess) {
          const confirmed = await open(
            `Get 20 mins of personalized Spanish tutoring for just 1 Yap.\nYour AI tutor will assess your level, identify your strengths, and help you improve pronunciation in real-time.`
          );
          if (!confirmed) return router.push("/home");

          const ethProvider = await embeddedWallet?.getEthereumProvider();
          if (ethProvider) {
            const provider = new ethers.BrowserProvider(ethProvider);
            const signer = await provider.getSigner();
            await handleSpanishTeacherAccessFromPage({
              userId: stored,
              open,
              showSnackbar,
              signer,
              BACKEND_WALLET_ADDRESS:
                process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS!,
              TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
              API_URL: process.env.NEXT_PUBLIC_API_URL!,
              router,
              setCheckingAccess: () => {},
              setIsVerifyingPermit: () => {},
              removeSnackbar: () => {},
              signTypedData,
            });
          }
        }
        await startConversation();
      } catch (err) {
        console.error("Access/session error:", err);
        router.push("/home");
      }
    })();
  }, [embeddedWallet, open, router, showSnackbar, signTypedData, startConversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="min-h-[100dvh] bg-background-primary pb-[env(safe-area-inset-bottom)]">
      <div className="fixed inset-x-0 top-0 h-16 bg-background-primary z-20 flex items-center justify-center px-4">
        <button onClick={() => router.push("/home")} className="absolute left-4">
          <TablerX className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#2D1C1C]">Tutor</h1>
          <div className="text-xs text-gray-500">Status: {conversation.status} {isConnected ? "" : ""}</div>
        </div>
      </div>

      <div className="pt-16 pb-24 fixed inset-0 overflow-y-auto z-10">
        <div className="w-full h-full flex flex-col items-center">
          {error && <div className="mb-2 text-red-500 text-center text-xs">{error}</div>}

          <div className="flex-1 w-full max-w-none overflow-y-auto px-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-1">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI avatar */}
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">AI</span>
                    </div>
                  )}

                  {/* Bubble */}
                  <div
                    className={`rounded-lg px-3 py-2 max-w-[70vw] text-sm shadow-sm ${
                      msg.sender === "user"
                        ? "bg-background-secondary text-white"
                        : "bg-[#f1f3f5] text-[#2D1C1C]"
                    }`}
                  >
                    {msg.kind === "text" && <div>{msg.text}</div>}
                    {msg.kind === "audio" && msg.audioUrl && (
                      <AudioBubble src={msg.audioUrl} />
                    )}
                  </div>

                  {/* User avatar */}
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {userName?.charAt(0).toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-[56px] pb-2 z-20 flex justify-center items-center">
        <Tutor
          userName={userName}
          sendMessage={async (message: string) => {
            try {
              await conversation.sendUserMessage(message);
            } catch (err) {
              console.error("Error sending message:", err);
              showSnackbar({ message: "Failed to send message", variant: "error" });
            }
          }}
          onUserMessage={(text: string) => {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                kind: "text",
                text,
                sender: "user",
                timestamp: new Date(),
              },
            ]);
          }}
          onUserAudio={(audioUrl: string) => {
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                kind: "audio",
                audioUrl,
                sender: "user",
                timestamp: new Date(),
              },
            ]);
          }}
        />
      </div>

      <BottomNavBar />
    </div>
  );
}
