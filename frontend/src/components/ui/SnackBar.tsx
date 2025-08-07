'use client';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import clsx from 'clsx';
import { TablerCheck, TablerInfoCircle, TablerX } from "@/icons";

export interface SnackProps {
  id: number;
  message: string;
  variant?: 'success' | 'error' | 'info' | 'completion' | 'custom';
  onDismiss: (id: number) => void;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

function Snack({
  id,
  message,
  variant = 'info',
  icon,
  action,
  className = '',
  onDismiss,
}: SnackProps) {
  const defaultIcon = (() => {
    switch (variant) {
      case "success":
        return <TablerCheck className="w-6 h-6 text-green-600" />;
      case "error":
        return <TablerX className="w-6 h-6 text-red-600" />;
      case "info":
        return <TablerInfoCircle className="w-6 h-6 text-blue-600" />;
      case "completion":
        return (
          <div className="w-6 h-6 relative">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          </div>
        );
      case "custom":
        return <TablerCheck className="w-6 h-6 text-green-600" />;
      default:
        return <TablerInfoCircle className="w-6 h-6 text-blue-600" />;
    }
  })();
  

  return (
    <div
      className={clsx(
        'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg min-w-[240px] max-w-md transition-all backdrop-blur-md border-b-3 border-[#e3ded3]',
        {
            'bg-background-primary text-secondary border-b-3 border-[#e3ded3]': variant === 'success',
            'bg-background-primary text-secondary ': variant === 'error',
            'bg-background-primary text-secondary': variant === 'info',
            'bg-background-primary text-secondary border-background-primary':
              variant === 'completion' || variant === 'custom',
          },
        className
      )}
    >
      <div className="w-6 h-6">{icon || defaultIcon}</div>
      <span className="flex-1 text-sm font-medium">{message}</span>
      {action && <div>{action}</div>}
      <button
        onClick={() => onDismiss(id)}
        className="text-sm text-secondary hover:text-black"
      >
        &#10005;
      </button>
    </div>
  );
}

// ========== CONTEXT ==========

export type SnackbarConfig = {
  message: string;
  variant?: 'success' | 'error' | 'info' | 'completion' | 'custom';
  duration?: number;
  id?: number;
  manual?: boolean; 
};

type SnackContextType = {
    showSnackbar: (config: SnackbarConfig) => void;
    removeSnackbar: (id: number) => void;
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
    const {
      message,
      variant = 'info',
      duration = 3000,
      manual = false,
      id = Date.now(),
    } = config;
  
    const newSnack: SnackProps = {
      id,
      message,
      variant,
      onDismiss: removeSnack,
    };
  
    setSnacks((prev) => [...prev, newSnack]);
  
    if (!manual) {
      setTimeout(() => removeSnack(id), duration);
    }
  }, []);
  

  const value = useMemo(() => ({ showSnackbar, removeSnackbar: removeSnack }), [showSnackbar]);


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
