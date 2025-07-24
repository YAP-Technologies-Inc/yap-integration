// ClientWrapper.tsx
'use client';

import { useSafariUIManager } from '@/hooks/SafariUIManager';
import ScrollToTop from './ScrollToTop';

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  useSafariUIManager();

  return (
    <>
      <ScrollToTop />
      {children}
    </>
  );
}
