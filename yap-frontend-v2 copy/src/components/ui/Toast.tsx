'use client';
import clsx from 'clsx';

export interface ToastProps {
  id: number;
  message: string;
  variant?: 'success' | 'error' | 'info';
  onDismiss: (id: number) => void;
}

export default function Toast({
  id,
  message,
  variant = 'info',
  onDismiss,
}: ToastProps) {
  return (
    <div
      className={clsx(
        'flex items-center space-x-3 px-4 py-2 rounded shadow',
        {
          'bg-green-300': variant === 'success',
          'bg-red-300':   variant === 'error',
          'bg-blue-300':  variant === 'info',
        }
      )}
    >
      <span className="flex-1 text-sm text-gray-800">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-gray-500 hover:text-gray-700">
        ×
      </button>
    </div>
  );
}
