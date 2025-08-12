"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

/* -------------------- Small helpers -------------------- */

interface Message {
  id: string;
  kind: "text" | "audio";
  text?: string;
  audioUrl?: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const fmtMMSS = (ms: number) => {
  if (!isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/* -------------------- Audio bubble (for history replay) -------------------- */

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
    const onEnded = () => {
      setPlaying(false);
      setT(0);
    };
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
        /* autoplay can be blocked */
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
        <div className="text-xs opacity-90">
          {fmtMMSS(t * 1000)} / {fmtMMSS(dur * 1000)}
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
}

/* -------------------- Stable agent socket hook -------------------- */

function useAgentSocket({
  enabled,
  onAudio,
  onAck,
  onError,
}: {
  enabled: boolean;
  onAudio?: (url: string) => void;
  onAck?: () => void;
  onError?: (msg: string) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const unmountedRef = useRef(false);
  const connectingRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffRef = useRef(1000); // 1s -> 2s -> 4s -> max 8s

  // Keep latest handlers without making connect() re-create
  const handlersRef = useRef({ onAudio, onAck, onError });
  useEffect(() => {
    handlersRef.current = { onAudio, onAck, onError };
  }, [onAudio, onAck, onError]);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (connectingRef.current) return;
    const s = wsRef.current?.readyState;
    if (s === WebSocket.OPEN || s === WebSocket.CONNECTING) return;

    connectingRef.current = true;

    const base =
      (process.env.NEXT_PUBLIC_API_URL ||
        `${window.location.protocol}//${window.location.host}`)
        .replace(/^https:/i, "wss:")
        .replace(/^http:/i, "ws:");
    const url = `${base}/api/agent-ws`;
    console.log("[agent-ws] connecting to:", url, "enabled=", enabled);

    const ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    wsRef.current = ws;

    const clearKeepalive = () => {
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
    };

    const scheduleReconnect = (why: string) => {
      clearKeepalive();
      wsRef.current = null;
      connectingRef.current = false;
      if (unmountedRef.current || !enabled) return;
      const wait = Math.min(backoffRef.current, 8000);
      console.warn(`[agent-ws] reconnecting in ${wait}ms (reason: ${why})`);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        backoffRef.current = Math.min(wait * 2, 8000);
        connect();
      }, wait);
    };

    ws.onopen = () => {
      console.log("[agent-ws] OPEN");
      connectingRef.current = false;
      backoffRef.current = 1000;
      clearKeepalive();
      pingTimerRef.current = setInterval(() => {
        try {
          ws.send('{"type":"ping"}');
        } catch {}
      }, 15000);
    };

    ws.onmessage = (e) => {
      if (typeof e.data !== "string") {
        const url = URL.createObjectURL(
          new Blob([e.data], { type: "audio/wav" })
        );
        handlersRef.current.onAudio?.(url);
      } else {
        try {
          const msg = JSON.parse(e.data);
          console.log("[agent-ws] message:", msg.type);
          if (msg.type === "ack_user_text") handlersRef.current.onAck?.();
          if (msg.type === "error")
            handlersRef.current.onError?.(
              String(msg.error ?? "Agent error")
            );
          // meta, etc.
        } catch {
          /* ignore non-JSON text */
        }
      }
    };

    ws.onerror = (ev) => {
      console.error("[agent-ws] ERROR event", ev);
    };

    ws.onclose = (ev) => {
      console.warn("[agent-ws] CLOSE", ev);
      scheduleReconnect(`close ${ev.code || ""}`);
    };
  }, [enabled]); // <-- only depends on `enabled`

  useEffect(() => {
    unmountedRef.current = false;
    if (enabled) connect();

    return () => {
      unmountedRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (pingTimerRef.current) {
        clearInterval(pingTimerRef.current);
        pingTimerRef.current = null;
      }
      try {
        wsRef.current?.close();
      } catch {}
      wsRef.current = null;
      connectingRef.current = false;
      console.log("[agent-ws] cleanup complete");
    };
  }, [enabled, connect]);

  const sendUserText = useCallback((text: string) => {
    const ws = wsRef.current;
    console.log("[agent-ws] sendUserText readyState:", ws?.readyState);
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: "user_text", text }));
      return true;
    } catch {
      return false;
    }
  }, []);

  return { sendUserText, isOpen: wsRef.current?.readyState === WebSocket.OPEN };
}

/* -------------------- Page -------------------- */

export default function SpanishTeacherConversation() {
  const router = useRouter();
  const { showSnackbar, removeSnackbar, clearAllSnackbars } =
    useSnackbar() as any;
  const { open, close } = useMessageSignModal();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === "privy");
  const { signTypedData } = usePrivy();

  const [userId, setUserId] = useState<string | null>(null);
  const { name: userName } = useUserProfile(userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // last-5-min countdown
  const FIVE_MIN_MS = 5 * 60 * 1000;
  const [showCountdown, setShowCountdown] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number>(FIVE_MIN_MS);
  const expiryRef = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);
  const startCountdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- tiny auto-play queue so chunks play sequentially
  const playQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef(false);

  const drainQueue = useCallback(() => {
    const next = playQueueRef.current.shift();
    if (!next) {
      isPlayingRef.current = false;
      return;
    }
    isPlayingRef.current = true;

    const a = new Audio(next);
    a.onended = () => {
      URL.revokeObjectURL(next);
      drainQueue();
    };
    a.onerror = () => {
      URL.revokeObjectURL(next);
      drainQueue();
    };
    a.play().catch(() => {
      // autoplay blocked; user can tap bubbles
      isPlayingRef.current = false;
    });
  }, []);

  const enqueueAndPlay = useCallback(
    (url: string) => {
      playQueueRef.current.push(url);
      if (!isPlayingRef.current) drainQueue();
    },
    [drainQueue]
  );

  // --- server helpers
  const fetchSession = useCallback(
    async (uid: string) => {
      const res = await fetch(`${API_URL}/api/teacher-session/${uid}`);
      if (!res.ok) throw new Error(`Session check failed (${res.status})`);
      const data = await res.json();
      return data as {
        hasAccess: boolean;
        remainingMs: number;
        expiresAt?: string;
      };
    },
    [API_URL]
  );

  const handleSessionEnd = useCallback(
    (msg: string) => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
      if (startCountdownTimeoutRef.current)
        clearTimeout(startCountdownTimeoutRef.current);
      startCountdownTimeoutRef.current = null;

      setShowCountdown(false);
      setHasAccess(false);
      showSnackbar({ message: msg, variant: "info", duration: 2500 });

      const t = setTimeout(() => router.replace("/home"), 900);
      (handleSessionEnd as any)._t = t;
    },
    [router, showSnackbar]
  );

  const startCountdown = useCallback(
    async (uid: string) => {
      try {
        const data = await fetchSession(uid);
        if (!data?.hasAccess) {
          handleSessionEnd("Session ended.");
          return;
        }
        const rem = Math.max(0, Number(data.remainingMs || 0));
        expiryRef.current = Date.now() + rem;
        setRemainingMs(rem);
        setShowCountdown(true);

        if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        const tick = () => {
          const msLeft = Math.max(0, (expiryRef.current as number) - Date.now());
          setRemainingMs(msLeft);
          if (msLeft <= 0) {
            handleSessionEnd("Session ended. Thanks for practicing!");
            return;
          }
          rAFRef.current = requestAnimationFrame(tick);
        };
        rAFRef.current = requestAnimationFrame(tick);
      } catch {
        // fallback local 5 min
        const exp = Date.now() + FIVE_MIN_MS;
        expiryRef.current = exp;
        setRemainingMs(FIVE_MIN_MS);
        setShowCountdown(true);

        if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        const tick = () => {
          const msLeft = Math.max(0, (expiryRef.current as number) - Date.now());
          setRemainingMs(msLeft);
          if (msLeft <= 0) {
            handleSessionEnd("Session ended. Thanks for practicing!");
            return;
          }
          rAFRef.current = requestAnimationFrame(tick);
        };
        rAFRef.current = requestAnimationFrame(tick);
      }
    },
    [FIVE_MIN_MS, fetchSession, handleSessionEnd]
  );

  const scheduleCountdownFromServerRemaining = useCallback(
    (uid: string, serverRemainingMs: number) => {
      const rem = Math.max(0, Number(serverRemainingMs || 0));
      if (rem <= FIVE_MIN_MS) {
        startCountdown(uid);
        return;
      }
      const msUntilFiveLeft = rem - FIVE_MIN_MS;
      if (startCountdownTimeoutRef.current)
        clearTimeout(startCountdownTimeoutRef.current);
      startCountdownTimeoutRef.current = setTimeout(() => {
        startCountdown(uid);
      }, msUntilFiveLeft);
    },
    [FIVE_MIN_MS, startCountdown]
  );

  // Stable handlers for the socket (but hook also protects against re-creation)
  const handleAudio = useCallback(
    (url: string) => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: "audio",
          audioUrl: url,
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      enqueueAndPlay(url);
    },
    [enqueueAndPlay]
  );
  const handleAck = useCallback(() => {
    console.log("[agent-ws] ACK user_text");
  }, []);
  const handleErr = useCallback((m: string) => {
    console.warn("[agent-ws] error:", m);
  }, []);

  // ---- open/maintain ONE websocket when we have access
  const { sendUserText, isOpen } = useAgentSocket({
    enabled: Boolean(userId && hasAccess),
    onAudio: handleAudio,
    onAck: handleAck,
    onError: handleErr,
  });

  // ---- access flow (modal/pay) ----
  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem("userId");
      if (!stored) {
        router.replace("/home");
        return;
      }
      setUserId(stored);

      try {
        const accessData = await fetchSession(stored);

        if (!accessData?.hasAccess) {
          // Always show the modal if no access
          const confirmed = await open(
            `Get 20 mins of personalized Spanish tutoring for just 1 Yap.\nYour AI tutor will assess your level, identify your strengths, and help you improve pronunciation in real-time.`
          );
          if (!confirmed) {
            close?.();
            router.replace("/home");
            return;
          }

          // verify (gray overlay)
          setIsVerifying(true);
          const ethProvider = await embeddedWallet?.getEthereumProvider();
          if (!ethProvider) throw new Error("No wallet provider found");

          const provider = new ethers.BrowserProvider(ethProvider);
          const signer = await provider.getSigner();

          await handleSpanishTeacherAccessFromPage({
            userId: stored,
            showSnackbar,
            signer,
            BACKEND_WALLET_ADDRESS:
              process.env.NEXT_PUBLIC_BACKEND_WALLET_ADDRESS!,
            TOKEN_ADDRESS: process.env.NEXT_PUBLIC_TOKEN_ADDRESS!,
            API_URL,
            router,
            setCheckingAccess: () => {},
            setIsVerifyingPermit: setIsVerifying,
            removeSnackbar,
            clearAllSnackbars,
            signTypedData,
          } as any);

          // re-check access
          const data2 = await fetchSession(stored);
          if (!data2?.hasAccess) throw new Error("Access not granted");
          setIsVerifying(false);
          setHasAccess(true);
          scheduleCountdownFromServerRemaining(stored, data2.remainingMs);
          return;
        }

        // already has access on entry
        setHasAccess(true);
        scheduleCountdownFromServerRemaining(stored, accessData.remainingMs);
      } catch (err) {
        console.error("Access error:", err);
        setIsVerifying(false);
        router.replace("/home");
      }
    })();

    // cleanup timers + any playing audio on unmount
    return () => {
      document.querySelectorAll("audio").forEach((a) => {
        try {
          (a as HTMLAudioElement).pause();
        } catch {}
      });
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      if (startCountdownTimeoutRef.current)
        clearTimeout(startCountdownTimeoutRef.current);
      if ((handleSessionEnd as any)._t)
        clearTimeout((handleSessionEnd as any)._t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prettyTime = useMemo(() => fmtMMSS(remainingMs), [remainingMs]);

  return (
    <div className="min-h-[100dvh] bg-background-primary pb-[env(safe-area-inset-bottom)] relative">
      {/* Top bar */}
      <div className="fixed inset-x-0 top-0 h-16 bg-background-primary z-30 flex items-center justify-center px-4">
        <button onClick={() => router.replace("/home")} className="absolute left-4">
          <TablerX className="w-6 h-6 text-gray-700" />
        </button>
      <div className="text-center">
          <h1 className="text-xl font-semibold text-[#2D1C1C]">Tutor</h1>
          <div className="text-xs text-gray-500">
            {/* {hasAccess ? (showCountdown ? "Last 5 minutes" : (isOpen ? "Active" : "Connecting…")) : "Checking access…"} */}
            {showCountdown && (
              <span className="ml-2 text-green-600 font-semibold">{prettyTime}</span>
            )}
          </div>
        </div>
      </div>

      {/* Chat list */}
      <div className="fixed inset-0 overflow-y-auto z-10 pt-16 pb-28" style={{ WebkitOverflowScrolling: "touch" }}>
        <div className="w-full h-full flex flex-col items-center">
          <div className="flex-1 w-full max-w-none overflow-y-auto px-4 space-y-2">
            {!hasAccess ? (
              <div className="text-center text-gray-500 text-xs py-2">Checking access…</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-500 text-xs py-2">No messages yet</div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "ai" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">AI</span>
                    </div>
                  )}
                  <div className={`rounded-lg px-2 py-2 max-w-[70vw] text-sm ${msg.sender === "user" ? "bg-background-secondary text-white" : "text-[#2D1C1C]"}`}>
                    {msg.kind === "text" && <div>{msg.text}</div>}
                    {msg.kind === "audio" && msg.audioUrl && <AudioBubble src={msg.audioUrl} />}
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-sm font-semibold">
                        {(userName || "U").charAt(0).toUpperCase()}
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

      {/* Composer */}
      <div className="fixed inset-x-0 bottom-[56px] pb-2 z-20 flex justify-center items-center">
        <div className={hasAccess ? "w-full flex justify-center" : "pointer-events-none opacity-50 w-full flex justify-center"}>
          <Tutor
            userName={userName}
            sendMessage={async (message: string) => {
              const ok = sendUserText(message);
              if (!ok) {
                showSnackbar({ message: "Reconnecting to tutor…", variant: "info" });
              } else {
                // add user's text bubble immediately
                setMessages((prev) => [
                  ...prev,
                  {
                    id: crypto.randomUUID(),
                    kind: "text",
                    text: message,
                    sender: "user",
                    timestamp: new Date(),
                  },
                ]);
              }
            }}
            onUserMessage={() => {}}
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
      </div>

      {/* Gray verifying overlay */}
      {isVerifying && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />}

      <BottomNavBar />
    </div>
  );
}
