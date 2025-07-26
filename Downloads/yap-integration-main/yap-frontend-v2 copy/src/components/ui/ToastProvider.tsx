'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';
import Toast, { ToastProps } from './Toast';

type ToastVariant = ToastProps['variant'];
interface ToastContext {
  pushToast: (message: string, variant?: ToastVariant) => void;
}

const ctx = createContext<ToastContext | null>(null);

export function useToast() {
  const c = useContext(ctx);
  if (!c) throw new Error('useToast must be inside a ToastProvider');
  return c;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = (id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  };

  const pushToast = (message: string, variant: ToastVariant = 'info') => {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, variant, onDismiss: removeToast }]);
    setTimeout(() => removeToast(id), 4000);
  };

  return (
    <ctx.Provider value={{ pushToast }}>
      {children}
      <div className="fixed top-4 inset-x-0 flex justify-center space-x-2 z-50">
        {toasts.map((t) => (
          <Toast key={t.id} {...t} />
        ))}
      </div>
    </ctx.Provider>
  );
}
