// components/ClientProviders.tsx
'use client';

import dynamic from 'next/dynamic';
import { ToastProvider } from '@/components/ui/ToastProvider'; 
import type { ReactNode } from 'react';

// defer our real RootProvider (Privy + UserContext + ClientWrapper)
const RootProvider = dynamic(
  () => import('@/components/RootProvider'),
  { ssr: false, loading: () => null }
);

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <RootProvider>{children}</RootProvider>
    </ToastProvider>
  );
}
