'use client';
import { TablerCheck, TablerX, TablerAlertCircle } from '@/icons';
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
  const icon = {
    success: <TablerCheck className="w-5 h-5 text-green-600" />,
    error:   <TablerX className="w-5 h-5 text-red-600" />,
    info:    <TablerAlertCircle className="w-5 h-5 text-blue-600" />,
  }[variant];

  return (
    <div
      className={clsx(
        'flex items-center space-x-3 px-4 py-2 rounded shadow',
        {
          'bg-green-50': variant === 'success',
          'bg-red-50':   variant === 'error',
          'bg-blue-50':  variant === 'info',
        }
      )}
    >
      {icon}
      <span className="flex-1 text-sm text-gray-800">{message}</span>
      <button onClick={() => onDismiss(id)} className="text-gray-500 hover:text-gray-700">
        ×
      </button>
    </div>
  );
}
