"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useConversation } from "@11labs/react";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/components/ui/SnackBar";
import { TablerX, TablerPlay, TablerPlayerPauseFilled } from "@/icons";
import { handleSpanishTeacherAccessFromPage } from "@/utils/handleSpanishTeacherAccessFromPage";
import { useMessageSignModal } from "@/components/cards/MessageSignModal";
import { useWallets, usePrivy } from "@privy-io/react-auth";
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

const mmss = (sec: number) => {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

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
    if (playing) { el.pause(); setPlaying(false); }
    else { try { await el.play(); setPlaying(true); } catch {} }
  };

  return (
    <div className="rounded-2xl bg-[#2D1C1C] text-white px-3 py-2 shadow-md flex items-center justify-between min-w-[220px]">
      <div className="flex items-center gap-3">
        <button onClick={toggle} aria-label={playing ? "Pause" : "Play"} className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
          {playing ? <TablerPlayerPauseFilled className="w-5 h-5 text-white" /> : <TablerPlay className="w-5 h-5 text-white" />}
        </button>
        <div className="text-xs opacity-90">{mmss(t)} / {mmss(dur)}</div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

export default function SpanishTeacherConversation() {
  const router = useRouter();
  const { showSnackbar, removeSnackbar, clearAllSnackbars } = useSnackbar() as any;
  const { open, close } = useMessageSignModal();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const { signTypedData } = usePrivy();

  const [userId, setUserId] = useState<string | null>(null);
  const { name: userName } = useUserProfile(userId);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
  const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID;

  const [isVerifying, setIsVerifying] = useState(false);

  // connect guards / retry
  const connectingRef = useRef(false);
  const connectedOnceRef = useRef(false);
  const retryRef = useRef(0);
  const MAX_RETRIES = 3;

  const conversation = useConversation({
    apiKey: ELEVENLABS_API_KEY,
    agentId: AGENT_ID,
    onConnect: () => {
      connectingRef.current = false;
      connectedOnceRef.current = true;
      retryRef.current = 0;
    },
    onDisconnect: async () => {
      // try to recover a few times if we've connected before
      if (retryRef.current < MAX_RETRIES) {
        const delay = 1000 * Math.pow(2, retryRef.current); // 1s, 2s, 4s
        retryRef.current += 1;
        setTimeout(() => {
          void connectConversation(); // best-effort
        }, delay);
      }
    },
    onMessage: (msg) => {
      if (typeof msg.message !== "string") return;
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), kind: "text", text: msg.message, sender: "ai", timestamp: new Date() }
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

  // Must be called before startSession on some browsers
  const ensureMicPermission = useCallback(async () => {
    try {
      // If permission already granted, this resolves immediately in most browsers
      await navigator.mediaDevices.getUserMedia({ audio: true });
      return true;
    } catch (e) {
      showSnackbar({ message: "Microphone permission needed to connect.", variant: "error", duration: 3000 });
      return false;
    }
  }, [showSnackbar]);

  const connectConversation = useCallback(async () => {
    if (connectingRef.current) return;
    connectingRef.current = true;

    // Ask for mic permission upfront — prevents “connected → immediately disconnected” loops.
    const ok = await ensureMicPermission();
    if (!ok) { connectingRef.current = false; return; }

    try {
      // Prefer websocket (works well for public agents). If that fails, try webrtc.
      await conversation.startSession({
        agentId: AGENT_ID as string,
        connectionType: "websocket",
        user_id: userId ?? undefined,
      });
    } catch (errWs: any) {
      console.warn("WebSocket start failed, trying WebRTC:", errWs?.message || errWs);
      try {
        await conversation.startSession({
          agentId: AGENT_ID as string,
          connectionType: "webrtc",
          user_id: userId ?? undefined,
        });
      } catch (errRtc: any) {
        console.error("Start session failed:", errRtc);
        setError(`Failed to start: ${errRtc?.message ?? String(errRtc)}`);
      } finally {
        connectingRef.current = false;
      }
    }
  }, [AGENT_ID, conversation, ensureMicPermission, userId]);

  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem("userId");
      if (!stored) { router.replace("/home"); return; }
      setUserId(stored);

      try {
        // 1) Check access first
        const accessRes = await fetch(`${API_URL}/api/teacher-session/${stored}`);
        const accessData = await accessRes.json();

        if (!accessData?.hasAccess) {
          const confirmed = await open(
            `Get 20 mins of personalized Spanish tutoring for just 1 Yap.\nYour AI tutor will assess your level, identify your strengths, and help you improve pronunciation in real-time.`
          );
          if (!confirmed) { close?.(); router.replace("/home"); return; }

          setIsVerifying(true);
          const ethProvider = await embeddedWallet?.getEthereumProvider();
          if (!ethProvider) throw new Error("No wallet provider found");

          const provider = new ethers.BrowserProvider(ethProvider);
          const signer = await provider.getSigner();

          await handleSpanishTeacherAccessFromPage({
            userId: stored,
            showSnackbar,
            signer,
            BACKEND_WALLET_ADDRESS: process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS!,
            TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
            API_URL,
            router,
            setCheckingAccess: () => {},
            setIsVerifyingPermit: setIsVerifying,
            removeSnackbar,
            clearAllSnackbars,
            signTypedData,
          } as any);

          // Re-check
          const res2 = await fetch(`${API_URL}/api/teacher-session/${stored}`);
          const data2 = await res2.json();
          if (!data2?.hasAccess) throw new Error("Access not granted");
          setIsVerifying(false);
        }

        // 2) Access confirmed → connect now
        await connectConversation();
      } catch (err) {
        console.error("Access/connect error:", err);
        setIsVerifying(false);
        router.replace("/home");
      }
    })();

    return () => {
      (async () => { try { await conversation.endSession(); } catch {} })();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isConnected = conversation.status === "connected";

  return (
    <div className="min-h-[100dvh] bg-background-primary pb-[env(safe-area-inset-bottom)] relative">
      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 h-16 bg-background-primary z-30 flex items-center justify-center px-4">
        <button onClick={() => router.replace("/home")} className="absolute left-4">
          <TablerX className="w-6 h-6 text-gray-700" />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#2D1C1C]">Tutor</h1>
          <div className="text-xs text-gray-500">Status: {conversation.status} {isConnected ? "" : ""}</div>
        </div>
      </div>

      {/* Chat list */}
      <div className="fixed inset-0 overflow-y-auto z-10 pt-16 pb-24" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="w-full h-full flex flex-col items-center">
          {error && <div className="mb-2 text-red-500 text-center text-xs">{error}</div>}
          <div className="flex-1 w-full max-w-none overflow-y-auto px-4 space-y-2">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-1">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">AI</span>
                    </div>
                  )}
                  <div className={`rounded-lg px-3 py-2 max-w-[70vw] text-sm shadow-sm ${msg.sender === "user" ? "bg-background-secondary text-white" : "bg-[#f1f3f5] text-[#2D1C1C]"}`}>
                    {msg.kind === "text" && <div>{msg.text}</div>}
                    {msg.kind === "audio" && msg.audioUrl && <AudioBubble src={msg.audioUrl} />}
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">{userName?.charAt(0).toUpperCase() || "U"}</span>
                    </div>
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="fixed inset-x-0 bottom-[56px] pb-2 z-20 flex justify-center items-center">
        <Tutor
          userName={userName}
          sendMessage={async (message: string) => {
            try { await conversation.sendUserMessage(message); }
            catch { showSnackbar({ message: "Failed to send message", variant: "error" }); }
          }}
          onUserMessage={(text: string) => {
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: "text", text, sender: "user", timestamp: new Date() }]);
          }}
          onUserAudio={(audioUrl: string) => {
            setMessages((prev) => [...prev, { id: crypto.randomUUID(), kind: "audio", audioUrl, sender: "user", timestamp: new Date() }]);
          }}
        />
      </div>

      {/* Gray verifying overlay */}
      {isVerifying && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      )}

      <BottomNavBar />
    </div>
  );
}
