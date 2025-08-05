'use client';
import { createContext, useContext, useState } from 'react';
import { TablerX } from '@/icons';

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
  const [message, setMessage] = useState('');
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
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 backdrop-blur-sm bg-black/30"
          onClick={close}
        />

        {/* Modal */}
        <div
          className={`absolute left-0 bottom-0 w-full bg-background-primary rounded-t-2xl shadow-xl transform transition-transform duration-400 ease-in-out ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-between items-center px-4 pt-4">
            <div className="text-sm text-secondary font-medium">
              Authorization
            </div>
            <button onClick={close} className="text-secondary p-1">
              <TablerX className="h-6 w-6" />
            </button>
          </div>

          {/* Message */}
          <div className="px-4 pt-6 text-center space-y-2">
            <p className="text-base text-secondary">{message}</p>
            <p className="text-sm text-muted-foreground text-secondary">
              <em>
                By confirming, you allow YAP to submit a gasless transaction on
                your behalf. This signature does <strong>not</strong> cost any
                SEI or gas. Your tokens will only move if you approve the
                transaction in the next step.
              </em>
            </p>
            <p className="text-xs text-muted-foreground text-secondary">
              (Coming soon: You will see a less clutterd message once our
              relayer is ready)
            </p>
          </div>
          {/* Confirm Button */}
          <div className="px-4 pb-6">
            <button
              onClick={handleConfirm}
              className="w-full py-3 bg-secondary text-white font-semibold rounded-xl transition"
            >
              Next...
            </button>
          </div>
        </div>
      </div>
    </MessageSignContext.Provider>
  );
}

export function useMessageSignModal() {
  const context = useContext(MessageSignContext);
  if (!context) throw new Error('Wrap your app with <MessageSignProvider />');
  return context;
}
