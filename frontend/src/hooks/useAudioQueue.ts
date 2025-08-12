import { useCallback, useEffect, useRef } from "react";

export function useAudioQueue() {
  const queueRef = useRef<string[]>([]);
  const playingRef = useRef(false);
  const activeAudiosRef = useRef<Set<HTMLAudioElement>>(new Set());
  const urlPoolRef = useRef<Set<string>>(new Set());
  const unmountedRef = useRef(false);

  const stopAll = useCallback(() => {
    // stop and release any currently playing audio
    for (const a of activeAudiosRef.current) {
      try { a.pause(); a.src = ""; } catch {}
    }
    activeAudiosRef.current.clear();

    // revoke all object URLs we created
    for (const u of urlPoolRef.current) {
      try { URL.revokeObjectURL(u); } catch {}
    }
    urlPoolRef.current.clear();

    // clear the queue
    queueRef.current.length = 0;
    playingRef.current = false;
  }, []);

  const drain = useCallback(() => {
    if (unmountedRef.current) return;
    const next = queueRef.current.shift();
    if (!next) { playingRef.current = false; return; }

    playingRef.current = true;
    const a = new Audio(next);
    activeAudiosRef.current.add(a);

    const cleanupOne = () => {
      activeAudiosRef.current.delete(a);
      try { URL.revokeObjectURL(next); } catch {}
      urlPoolRef.current.delete(next);
      drain();
    };

    a.onended = cleanupOne;
    a.onerror = cleanupOne;

    // try to play; if blocked, don’t loop forever
    a.play().catch(() => {
      cleanupOne();
      playingRef.current = false;
    });
  }, []);

  const enqueue = useCallback((blobOrUrl: Blob | string) => {
    const url =
      typeof blobOrUrl === "string" ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    urlPoolRef.current.add(url);
    queueRef.current.push(url);
    if (!playingRef.current) drain();
  }, [drain]);

  useEffect(() => {
    unmountedRef.current = false;

    const onVis = () => {
      // if user navigates away / tab hidden, kill playback immediately
      if (document.hidden) stopAll();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      unmountedRef.current = true;
      document.removeEventListener("visibilitychange", onVis);
      stopAll(); // <- critical: ensures no leak across pages
    };
  }, [stopAll]);

  return { enqueue, stopAll };
}
