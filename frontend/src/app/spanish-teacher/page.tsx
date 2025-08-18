'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSnackbar } from '@/components/ui/SnackBar';
import { TablerX } from '@/icons';
import { handleSpanishTeacherAccessFromPage } from '@/utils/handleSpanishTeacherAccessFromPage';
import { useMessageSignModal } from '@/components/cards/MessageSignModal';
import { useWallets, usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import Tutor from '@/components/cards/Tutor';
import BottomNavBar from '@/components/layout/BottomNavBar';
import { useUserProfile } from '@/hooks/useUserProfile';

/* -------------------- Types & helpers -------------------- */

interface Message {
  id: string;
  kind: 'text';
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const fmtMMSS = (ms: number) => {
  if (!isFinite(ms) || ms < 0) ms = 0;
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

/* Delay so text paints before audio starts */
const AUDIO_START_DELAY_MS = 180;

/* -------------------- WebSocket hook (text + audio) -------------------- */

function useAgentSocket({
  enabled,
  onText, // (chunk, isFinal)
  onAudio, // (pcm/wav ArrayBuffer)
  onAck,
  onError,
}: {
  enabled: boolean;
  onText?: (text: string, isFinal: boolean) => void;
  onAudio?: (ab: ArrayBuffer) => void;
  onAck?: () => void;
  onError?: (msg: string) => void;
}) {
  const wsRef = useRef<WebSocket | null>(null);
  const unmountedRef = useRef(false);
  const connectingRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const backoffRef = useRef(1000);

  const handlersRef = useRef({ onText, onAudio, onAck, onError });
  useEffect(() => {
    handlersRef.current = { onText, onAudio, onAck, onError };
  }, [onText, onAudio, onAck, onError]);

  const connect = useCallback(() => {
    if (!enabled) return;
    if (connectingRef.current) return;
    const s = wsRef.current?.readyState;
    if (s === WebSocket.OPEN || s === WebSocket.CONNECTING) return;

    connectingRef.current = true;

    const base = (
      process.env.NEXT_PUBLIC_API_URL || `${window.location.protocol}//${window.location.host}`
    )
      .replace(/^https:/i, 'wss:')
      .replace(/^http:/i, 'ws:');
    const url = `${base}/api/agent-ws`;

    const ws = new WebSocket(url);
    ws.binaryType = 'arraybuffer';
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
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = setTimeout(() => {
        backoffRef.current = Math.min(wait * 2, 8000);
        connect();
      }, wait);
    };

    ws.onopen = () => {
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
      if (typeof e.data === 'string') {
        try {
          const msg = JSON.parse(e.data);
          if (msg.type === 'ai_text_delta' && typeof msg.text === 'string') {
            handlersRef.current.onText?.(msg.text, false);
          } else if (msg.type === 'ai_text_final' && typeof msg.text === 'string') {
            handlersRef.current.onText?.(msg.text, true);
          } else if (msg.type === 'ai_text' && typeof msg.text === 'string') {
            handlersRef.current.onText?.(msg.text, true);
          } else if (msg.type === 'ack_user_text') {
            handlersRef.current.onAck?.();
          } else if (msg.type === 'error') {
            handlersRef.current.onError?.(String(msg.error ?? 'Agent error'));
          }
        } catch {
          /* ignore */
        }
      } else {
        // Binary = audio (WAV)
        handlersRef.current.onAudio?.(e.data as ArrayBuffer);
      }
    };

    ws.onerror = () => {
      scheduleReconnect('error');
    };

    ws.onclose = (ev) => {
      scheduleReconnect(`close ${ev.code || ''}`);
    };
  }, [enabled]);

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
    };
  }, [enabled, connect]);

  const sendUserText = useCallback((text: string) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify({ type: 'user_text', text }));
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
  const { showSnackbar, removeSnackbar, clearAllSnackbars } = useSnackbar() as any;
  const { open, close } = useMessageSignModal();
  const { wallets } = useWallets();
  const embeddedWallet = wallets.find((w) => w.walletClientType === 'privy');
  const { signTypedData } = usePrivy();

  const [userId, setUserId] = useState<string | null>(null);
  const { name: userName } = useUserProfile(userId);

  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);

  // countdown
  const FIVE_MIN_MS = 5 * 60 * 1000;
  const [showCountdown, setShowCountdown] = useState(false);
  const [remainingMs, setRemainingMs] = useState<number>(FIVE_MIN_MS);
  const expiryRef = useRef<number | null>(null);
  const rAFRef = useRef<number | null>(null);
  const startCountdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ---- AUDIO QUEUE with a "gate" so audio waits until text has painted
  const queueRef = useRef<string[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const createdUrlsRef = useRef<Set<string>>(new Set());

  const audioGateOpenRef = useRef(false);
  const [awaitingFirstText, setAwaitingFirstText] = useState(false);

  const playNext = useCallback(() => {
    if (!audioGateOpenRef.current) return;
    if (currentAudioRef.current) return;

    const nextUrl = queueRef.current.shift();
    if (!nextUrl) return;

    const a = new Audio(nextUrl);
    currentAudioRef.current = a;

    const cleanup = () => {
      try {
        a.pause();
      } catch {}
      if (createdUrlsRef.current.has(nextUrl)) {
        try {
          URL.revokeObjectURL(nextUrl);
        } catch {}
        createdUrlsRef.current.delete(nextUrl);
      }
      currentAudioRef.current = null;
    };

    a.onended = () => {
      cleanup();
      playNext();
    };
    a.onerror = () => {
      cleanup();
      playNext();
    };

    a.play().catch(() => {
      cleanup();
      playNext();
    });
  }, []);

  const enqueueAudio = useCallback(
    (url: string) => {
      createdUrlsRef.current.add(url);
      queueRef.current.push(url);
      if (audioGateOpenRef.current && !currentAudioRef.current) playNext();
    },
    [playNext],
  );

  const stopAllAudio = useCallback(() => {
    const a = currentAudioRef.current;
    if (a) {
      try {
        a.pause();
      } catch {}
      currentAudioRef.current = null;
    }
    queueRef.current.length = 0;
    createdUrlsRef.current.forEach((u) => {
      try {
        URL.revokeObjectURL(u);
      } catch {}
    });
    createdUrlsRef.current.clear();
  }, []);

  // ---- server helpers
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
    [API_URL],
  );

  const handleSessionEnd = useCallback(
    (msg: string) => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      rAFRef.current = null;
      if (startCountdownTimeoutRef.current) clearTimeout(startCountdownTimeoutRef.current);
      startCountdownTimeoutRef.current = null;

      setShowCountdown(false);
      setHasAccess(false);
      showSnackbar({ message: msg, variant: 'info', duration: 2500 });

      const t = setTimeout(() => router.replace('/home'), 900);
      (handleSessionEnd as any)._t = t;
    },
    [router, showSnackbar],
  );

  const startCountdown = useCallback(
    async (uid: string) => {
      try {
        const data = await fetchSession(uid);
        if (!data?.hasAccess) {
          handleSessionEnd('Session ended.');
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
            handleSessionEnd('Session ended. Thanks for practicing!');
            return;
          }
          rAFRef.current = requestAnimationFrame(tick);
        };
        rAFRef.current = requestAnimationFrame(tick);
      } catch {
        const exp = Date.now() + FIVE_MIN_MS;
        expiryRef.current = exp;
        setRemainingMs(FIVE_MIN_MS);
        setShowCountdown(true);

        if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
        const tick = () => {
          const msLeft = Math.max(0, (expiryRef.current as number) - Date.now());
          setRemainingMs(msLeft);
          if (msLeft <= 0) {
            handleSessionEnd('Session ended. Thanks for practicing!');
            return;
          }
          rAFRef.current = requestAnimationFrame(tick);
        };
        rAFRef.current = requestAnimationFrame(tick);
      }
    },
    [FIVE_MIN_MS, fetchSession, handleSessionEnd],
  );

  const scheduleCountdownFromServerRemaining = useCallback(
    (uid: string, serverRemainingMs: number) => {
      const rem = Math.max(0, Number(serverRemainingMs || 0));
      if (rem <= FIVE_MIN_MS) {
        startCountdown(uid);
        return;
      }
      const msUntilFiveLeft = rem - FIVE_MIN_MS;
      if (startCountdownTimeoutRef.current) clearTimeout(startCountdownTimeoutRef.current);
      startCountdownTimeoutRef.current = setTimeout(() => {
        startCountdown(uid);
      }, msUntilFiveLeft);
    },
    [FIVE_MIN_MS, startCountdown],
  );

  /* ---------- AI text streaming handling ---------- */
  const streamingIdRef = useRef<string | null>(null);

  const upsertStreamingAi = useCallback(
    (chunk: string, isFinal: boolean) => {
      const firstTextForTurn = !audioGateOpenRef.current;

      // 1) Update or create the streaming AI message
      setMessages((prev) => {
        if (!streamingIdRef.current) {
          const id = crypto.randomUUID();
          streamingIdRef.current = isFinal ? null : id;
          return [
            ...prev,
            {
              id,
              kind: 'text',
              text: chunk,
              sender: 'ai',
              timestamp: new Date(),
            },
          ];
        } else {
          const id = streamingIdRef.current;
          const next = prev.map((m) => (m.id === id ? { ...m, text: m.text + chunk } : m));
          if (isFinal) streamingIdRef.current = null;
          return next;
        }
      });

      // 2) Only when the FIRST text of the turn arrives, open the gate and start audio AFTER paint
      if (firstTextForTurn) {
        setAwaitingFirstText(false);
        audioGateOpenRef.current = true;

        // Give React a frame (or two) to paint the new text, then start audio after a tiny delay.
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTimeout(() => {
              playNext();
            }, AUDIO_START_DELAY_MS);
          });
        });
      }
    },
    [playNext],
  );

  const handleAck = useCallback(() => {
    // optional
  }, []);

  const handleErr = useCallback((m: string) => {
    console.warn('[agent-ws] error:', m);
  }, []);

  // ---- Open/maintain ONE websocket when we have access
  const { sendUserText, isOpen } = useAgentSocket({
    enabled: Boolean(userId && hasAccess),
    onText: upsertStreamingAi,
    onAudio: (ab) => {
      const url = URL.createObjectURL(new Blob([ab], { type: 'audio/wav' }));
      enqueueAudio(url); // will not play until the first text chunk opens the gate
    },
    onAck: handleAck,
    onError: handleErr,
  });

  // ---- access flow (modal/pay) ----
  useEffect(() => {
    (async () => {
      const stored = localStorage.getItem('userId');
      if (!stored) {
        router.replace('/home');
        return;
      }
      setUserId(stored);

      try {
        const accessData = await fetchSession(stored);

        if (!accessData?.hasAccess) {
          const confirmed = await open(
            `Get 20 mins of personalized Spanish tutoring for just 1 Yap.\nYour AI tutor will assess your level, identify your strengths, and help you improve pronunciation in real-time.`,
          );
          if (!confirmed) {
            close?.();
            router.replace('/home');
            return;
          }

          setIsVerifying(true);
          const ethProvider = await embeddedWallet?.getEthereumProvider();
          if (!ethProvider) throw new Error('No wallet provider found');

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

          const data2 = await fetchSession(stored);
          if (!data2?.hasAccess) throw new Error('Access not granted');
          setIsVerifying(false);
          setHasAccess(true);
          scheduleCountdownFromServerRemaining(stored, data2.remainingMs);
          return;
        }

        setHasAccess(true);
        scheduleCountdownFromServerRemaining(stored, accessData.remainingMs);
      } catch (err) {
        console.error('Access error:', err);
        setIsVerifying(false);
        router.replace('/home');
      }
    })();

    // cleanup timers & audio on unmount
    return () => {
      if (rAFRef.current) cancelAnimationFrame(rAFRef.current);
      if (startCountdownTimeoutRef.current) clearTimeout(startCountdownTimeoutRef.current);
      if ((handleSessionEnd as any)._t) clearTimeout((handleSessionEnd as any)._t);
      streamingIdRef.current = null;

      stopAllAudio();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Begin a new turn: close the audio gate and show typing bubble */
  const beginNewTurn = useCallback(() => {
    audioGateOpenRef.current = false;
    setAwaitingFirstText(true);
  }, []);

  const prettyTime = useMemo(() => fmtMMSS(remainingMs), [remainingMs]);

  return (
    <div className="min-h-[100dvh] bg-background-primary relative">
      {/* Top bar (64px) */}
      <div className="fixed inset-x-0 top-0 h-16 bg-background-primary z-30 flex items-center justify-center px-4">
        <div className="absolute left-4 lg:left-1/4">
          <button onClick={() => router.replace('/home')}>
        <TablerX className="w-6 h-6 text-gray-700" />
          </button>
        </div>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-[#2D1C1C]">Tutor</h1>
        </div>
      </div>

      {/* Countdown bar: slides down below the top bar */}
      <span
        className={`
          fixed left-0 right-0 z-30 flex justify-center
          w-full top-16
          transition-opacity duration-200
          ${showCountdown ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {showCountdown && (
          <span className="block w-full max-w-screen-sm mx-auto bg-[#fdfbfa] text-secondary text-xs font-semibold py-1 shadow text-left pl-4">
            You have {prettyTime} left in your tutor session
          </span>
        )}
      </span>

      {/* CHAT AREA: fixed between header and composer+bottom nav */}
      <div
        className="fixed inset-x-0 z-10 overflow-y-auto"
        style={{
          top: showCountdown ? '5.5rem' : '4rem', // push chat down if countdown is visible
          bottom: 'calc(96px + 7rem + 5px + env(safe-area-inset-bottom))',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="px-4 space-y-2 py-3 flex justify-center">
          <div className="w-full lg:w-1/3">
        {!hasAccess ? (
          <div className="text-center text-gray-500 text-xs py-2">Checking access…</div>
        ) : messages.length === 0 && !awaitingFirstText ? (
          <div className="text-center text-gray-500 text-xs py-2">No messages yet</div>
        ) : (
          <>
            {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2 ${
              msg.sender === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">AI</span>
              </div>
            )}
            <div
              className={`rounded-lg px-3 py-2 max-w-[70vw] text-sm ${
            msg.sender === 'user'
              ? 'bg-background-secondary text-white'
              : 'bg-white text-[#2D1C1C]'
              }`}
            >
              <div>{msg.text}</div>
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 via-blue-700 to-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-semibold">
              {(userName || 'U').charAt(0).toUpperCase()}
            </span>
              </div>
            )}
          </div>
            ))}

            {awaitingFirstText && (
          <div className="flex items-start gap-2 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 via-green-700 to-green-900 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">AI</span>
            </div>
            <div className="rounded-lg px-3 py-2 max-w-[70vw] text-sm bg-white text-[#2D1C1C]">
              <span className="opacity-60">…</span>
            </div>
          </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>
      </div>
                   
      {/* Composer (≈ 7rem tall) sits above the bottom nav (56px) */}
      <div className="fixed inset-x-0 bottom-24 pb-[env(safe-area-inset-bottom)] z-20 flex justify-center items-center">
        <div
          className={
            hasAccess
              ? 'w-full flex justify-center'
              : 'pointer-events-none opacity-50 w-full flex justify-center'
          }
        >
          <div className="w-full max-w-screen-sm px-4">
            <div className="h-28 flex items-center">
              <Tutor
                userName={userName}
                sendMessage={async (message: string) => {
                  beginNewTurn();
                  const ok = sendUserText(message);
                  if (!ok) {
                    showSnackbar({
                      message: 'Reconnecting to tutor…',
                      variant: 'info',
                    });
                  } else {
                    setMessages((prev) => [
                      ...prev,
                      {
                        id: crypto.randomUUID(),
                        kind: 'text',
                        text: message,
                        sender: 'user',
                        timestamp: new Date(),
                      },
                    ]);
                  }
                }}
                onUserMessage={() => {}}
                onUserAudio={() => {}}
              />
            </div>
          </div>
        </div>
      </div>

      {isVerifying && <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />}
      <BottomNavBar />
    </div>
  );
}
