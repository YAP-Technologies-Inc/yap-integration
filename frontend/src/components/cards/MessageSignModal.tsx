"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";

interface MessageSignContextType {
  isOpen: boolean;
  message: string;
  open: (message: string) => Promise<boolean>;
  close: () => void; // programmatic close (or backdrop click) -> unmount immediately
}

const MessageSignContext = createContext<MessageSignContextType | null>(null);

export function MessageSignProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);  // controls DOM presence
  const [entered, setEntered] = useState(false);  // drives ENTER (slide-up) animation
  const [message, setMessage] = useState("");

  const resolverRef = useRef<((v: boolean) => void) | null>(null);

  const open = useCallback((msg: string) => {
    setMessage(msg);
    setMounted(true);
    setEntered(false);
    // enter animation next frame
    requestAnimationFrame(() => setEntered(true));
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const resolveIfPending = (v: boolean) => {
    if (resolverRef.current) {
      const r = resolverRef.current;
      resolverRef.current = null;
      r(v);
    }
  };

  // Close/unmount immediately (no exit anim). This prevents “stuck gray” overlay.
  const close = useCallback(() => {
    setEntered(false); // triggers slide-down
    setTimeout(() => {
      setMounted(false); // unmount after animation
      resolveIfPending(false);
    }, 25); // match duration-50
  }, []);

  // Confirm button: also unmount immediately, then resolve true
  const handleConfirm = () => {
    setEntered(false); // triggers slide-down
    setTimeout(() => {
      setMounted(false); // unmount after animation
      resolveIfPending(true);
    }, 25);
  };

  // Safety: if provider unmounts mid-promise, resolve false
  useEffect(() => {
    return () => resolveIfPending(false);
  }, []);

  const isOpen = mounted;

  return (
    <MessageSignContext.Provider value={{ isOpen, message, open, close }}>
      {children}

      {mounted && (
        <div
          className={`fixed inset-0 z-50 transition-opacity duration-300 ${
            entered ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop — just unmounts; no routing here */}
          <div className="absolute inset-0 backdrop-blur-sm bg-black/30" onClick={close} />

          {/* Sheet — enter-only slide up */}
          <div
            className={`absolute left-0 bottom-0 w-full bg-background-primary rounded-t-3xl shadow-xl transform ${
              entered
                ? "translate-y-0 transition-transform duration-300 ease-out"
                : "translate-y-full"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center pt-4">
              <img src="/assets/tutor.png" alt="Tutor Icon" className="h-12 w-auto" />
              <h1 className="ml-2 text-4xl font-extrabold text-secondary">Tutor A.I</h1>
            </div>

            <div className="px-4 mt-2 mb-2 text-center space-y-2">
              <p className="text-base text-secondary">{message}</p>
            </div>

            <div className="px-4 pb-2">
              <button
                onClick={handleConfirm}
                className="w-full py-3 bg-secondary text-white border-b-3 border-black font-semibold rounded-3xl transition flex items-center justify-center gap-2"
              >
                <img src="/assets/coin.png" alt="YAP" className="h-5 w-5" />
                <span className="text-base">Spend 1 YAP</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </MessageSignContext.Provider>
  );
}

export function useMessageSignModal() {
  const ctx = useContext(MessageSignContext);
  if (!ctx) throw new Error("Wrap your app with <MessageSignProvider />");
  return ctx;
}
