// snack/Snack.tsx
'use client';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import { TablerCheck } from '@/icons';

export interface SnackProps {
  id: number;
  message: string;
  variant?: 'success' | 'error' | 'info' | 'completion';
  onDismiss: (id: number) => void;
}

function Snack({ id, message, variant = 'info', onDismiss }: SnackProps) {
  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg min-w-[240px] max-w-md transition-all backdrop-blur-md border',
        {
          'bg-green-100 text-green-800 border-green-200': variant === 'success',
          'bg-red-100 text-red-800 border-red-200': variant === 'error',
          'bg-blue-100 text-blue-800 border-blue-200': variant === 'info',
          'bg-white text-gray-900 border-gray-200': variant === 'completion',
        }
      )}
    >
      <div className="w-6 h-6 relative">
        {variant === 'completion' ? (
          <>
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-t-yellow-500 border-b-transparent"></div>
            <TablerCheck className="absolute inset-0 w-6 h-6 m-auto text-green-600" />
          </>
        ) : (
          <TablerCheck className="w-6 h-6" />
        )}
      </div>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-sm text-gray-400 hover:text-black">
        &#10005;
      </button>
    </div>
  );
}

// Snack Context + Provider + Hook
export type SnackbarConfig = {
  message: string;
  variant?: 'success' | 'error' | 'info' | 'completion';
  duration?: number;
};

type SnackContextType = {
  showSnackbar: (config: SnackbarConfig) => void;
};

const SnackContext = createContext<SnackContextType | undefined>(undefined);

export function useSnackbar(): SnackContextType {
  const context = useContext(SnackContext);
  if (!context) throw new Error('useSnackbar must be used within a SnackProvider');
  return context;
}

export function SnackProvider({ children }: { children: ReactNode }) {
  const [snacks, setSnacks] = useState<SnackProps[]>([]);

  const removeSnack = (id: number) => {
    setSnacks((prev) => prev.filter((s) => s.id !== id));
  };

  const showSnackbar = useCallback((config: SnackbarConfig) => {
    const id = Date.now();
    const { message, variant = 'info', duration = 3000 } = config;
    const newSnack: SnackProps = {
      id,
      message,
      variant,
      onDismiss: removeSnack,
    };
    setSnacks((prev) => [...prev, newSnack]);
    setTimeout(() => removeSnack(id), duration);
  }, []);

  const value = useMemo(() => ({ showSnackbar }), [showSnackbar]);

  return (
    <SnackContext.Provider value={value}>
      {children}
      <div className="fixed top-6 inset-x-0 flex justify-center z-50 space-y-2 flex-col items-center">
        {snacks.map((snack) => (
          <Snack key={snack.id} {...snack} />
        ))}
      </div>
    </SnackContext.Provider>
  );
}
