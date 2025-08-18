// components/ClientProviders.tsx
'use client';

import dynamic from 'next/dynamic';
import { ToastProvider } from '@/components/ui/ToastProvider';
import type { ReactNode } from 'react';
import { SnackProvider } from './ui/SnackBar';
import { MessageSignProvider } from '@/components/cards/MessageSignModal';
// defer our real RootProvider (Privy + UserContext + ClientWrapper)
const RootProvider = dynamic(() => import('@/components/RootProvider'), {
  ssr: false,
  loading: () => null,
});

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SnackProvider>
        <MessageSignProvider>
          <RootProvider>{children}</RootProvider>
        </MessageSignProvider>
      </SnackProvider>
    </ToastProvider>
  );
}
