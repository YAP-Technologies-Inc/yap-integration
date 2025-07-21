// This wraps the client-side components to manage Safari UI quirks and scroll behavior.
// It ensures the Safari address bar doesn't interfere with the app's layout and provides a scroll-to-top feature.
'use client';

import React from 'react';
import { useSafariUIManager } from '@/hooks/SafariUIManager';
import ScrollToTop from './ScrollToTop';
import Providers from '@/app/providers';

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useSafariUIManager();

  return (
    <>

      <ScrollToTop />
      <Providers>
        {/* Wrap children in Providers to ensure auth context is available */}
        {children}
      </Providers>
    </>
  );
}
