// components/ClientProviders.tsx
'use client';

import dynamic from 'next/dynamic';
import { ToastProvider } from '@/components/ui/ToastProvider';
import type { ReactNode } from 'react';
import { SnackProvider } from './ui/SnackBar';

// defer our real RootProvider (Privy + UserContext + ClientWrapper)
const RootProvider = dynamic(() => import('@/components/RootProvider'), {
  ssr: false,
  loading: () => null,
});

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <SnackProvider>
        <RootProvider>{children}</RootProvider>
      </SnackProvider>
    </ToastProvider>
  );
}
