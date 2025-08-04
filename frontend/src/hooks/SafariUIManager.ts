'use client';
import { useEffect } from "react";

export function useSafariUIManager() {
  useEffect(() => {
    const initialHeight = window.innerHeight;

    const resizeObserver = new ResizeObserver(() => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialHeight - currentHeight;

      if (heightDiff > 100) {
        document.body.classList.add("safari-ui-compact");
      } else {
        document.body.classList.remove("safari-ui-compact");
      }
    });

    resizeObserver.observe(document.documentElement);

    return () => {
      resizeObserver.disconnect();
      document.body.classList.remove("safari-ui-compact");
    };
  }, []);
}
