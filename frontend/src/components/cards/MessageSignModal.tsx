'use client';
import { createContext, useContext, useState } from 'react';

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
    setIsOpen(false);
  };

  const handleConfirm = () => {
    resolver?.(true);
    close();
  };

  const handleCancel = () => {
    resolver?.(false);
    close();
  };

  return (
    <MessageSignContext.Provider value={{ isOpen, message, open, close }}>
      {children}
      {isOpen && (
        <>
          <div className="fixed inset-0 backdrop-blur-sm z-40"></div>
          <div className="fixed rounded-xl bottom-0 left-0 w-full h-[30dvh] bg-background-primary bg-opacity-50 shadow-lg rounded-t-lg flex flex-col items-center justify-start transition-transform transform translate-y-0 pt-8 z-50">
            <p className="text-lg text-black font-medium pt-6">{message}</p>
            <div className="flex flex-col w-full space-y-4 px-4 mt-auto pb-2">
              <button
                onClick={handleConfirm}
                className="py-3 bg-background-secondary text-white rounded-lg"
              >
                Confirm
              </button>
              <button
                onClick={handleCancel}
                className="py-3 bg-background-secondary text-white rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </MessageSignContext.Provider>
  );
}

export function useMessageSignModal() {
  const context = useContext(MessageSignContext);
  if (!context) throw new Error('Wrap your app with <MessageSignProvider />');
  return context;
}
