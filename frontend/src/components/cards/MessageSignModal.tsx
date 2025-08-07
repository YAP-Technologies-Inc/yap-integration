"use client";
import { createContext, useContext, useState } from "react";

interface MessageSignContextType {
  isOpen: boolean;
  message: string;
  open: (message: string) => Promise<boolean>;
  close: () => void;
}

const MessageSignContext = createContext<MessageSignContextType | null>(null);

export function MessageSignProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<(value: boolean) => void>();

  const open = (msg: string) => {
    setMessage(msg);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const close = () => {
    // If the user dismisses the modal, resolve the promise as `false`
    resolver?.(false);
    setResolver(undefined);
    setIsOpen(false);
  };
  const handleConfirm = () => {
    resolver?.(true);
    setResolver(undefined);
    setIsOpen(false);
  };

  return (
    <MessageSignContext.Provider value={{ isOpen, message, open, close }}>
      {children}
      <div
        className={`fixed h-min[100dvh] inset-0 z-50 transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 backdrop-blur-sm bg-black/30"
          onClick={close}
        />

        {/* Modal */}
        <div
          className={`absolute left-0 bottom-0 w-full bg-background-primary rounded-t-3xl shadow-xl transform transition-transform duration-400 ease-in-out ${
            isOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="flex items-center justify-center pt-4">
            <h1 className="text-4xl font-extrabold text-secondary">
              Tutor A.I
            </h1>
          </div>
          {/* Message */}
          <div className="px-4 mt-2 mb-2 text-center space-y-2">
            <p className="text-base text-secondary">{message}</p>
          </div>

          <div className="px-4 pb-2">
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-secondary text-white border-b-4 border-black font-semibold rounded-3xl transition flex items-center justify-center gap-2"
            >
              <div className="flex items-center justify-center">
                <img
                  src="/assets/coin.png"
                  alt="YAP"
                  className="h-5 w-5 "
                />
              </div>
              <span className="text-base">Spend 1 YAP</span>
            </button>
          </div>
        </div>
      </div>
    </MessageSignContext.Provider>
  );
}

export function useMessageSignModal() {
  const context = useContext(MessageSignContext);
  if (!context) throw new Error("Wrap your app with <MessageSignProvider />");
  return context;
}
