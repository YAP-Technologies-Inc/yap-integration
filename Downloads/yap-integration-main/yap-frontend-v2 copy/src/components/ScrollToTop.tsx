// This component scrolls the page to the top whenever the pathname changes.
// However it isnt working now 
'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    //delay to let things settle on mobile devices
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
    }, 50);
  }, [pathname]);

  return null;
}
