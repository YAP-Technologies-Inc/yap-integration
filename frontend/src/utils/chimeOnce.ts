// utils/chimeOnce.ts
let correctEl: HTMLAudioElement | null = null;
let incorrectEl: HTMLAudioElement | null = null;
let prepared = false;

const playedKeys = new Set<string>(); // succeeded plays this session
const pendingKeys = new Set<string>(); // in-flight plays (per key)

type Srcs = { correct: string; incorrect: string };

export function prepareChimes(srcs?: Srcs) {
  if (prepared || typeof window === 'undefined') return;

  const correctSrc = srcs?.correct ?? '/audio/correct.mp3';
  const incorrectSrc = srcs?.incorrect ?? '/audio/incorrect.mp3';

  correctEl = new Audio(correctSrc);
  incorrectEl = new Audio(incorrectSrc);

  // ensure sound
  correctEl.preload = 'auto';
  incorrectEl.preload = 'auto';
  correctEl.muted = false;
  incorrectEl.muted = false;
  correctEl.volume = 1;
  incorrectEl.volume = 1;

  prepared = true;
}

function ensureReady(el: HTMLAudioElement): Promise<void> {
  // HAVE_CURRENT_DATA (2) or better is fine
  if (el.readyState >= 2) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const onReady = () => {
      el.removeEventListener('canplaythrough', onReady);
      el.removeEventListener('loadeddata', onReady);
      resolve();
    };
    el.addEventListener('canplaythrough', onReady, { once: true });
    el.addEventListener('loadeddata', onReady, { once: true });
    // Kick the loader in case it hasn't started
    try {
      el.load();
    } catch {}
  });
}

// Optional: allow replay for a given key
export function clearPlayedKey(key: string) {
  playedKeys.delete(key);
  try {
    sessionStorage.removeItem(`playedChime:${key}`);
  } catch {}
}

/**
 * Plays the chime once per key (e.g., attempt id).
 * Returns true if playback started, false otherwise.
 */
export async function playChimeOnce(key: string, success: boolean): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  const sessionKey = `playedChime:${key}`;

  // Already played (this session or this tab)
  try {
    if (sessionStorage.getItem(sessionKey) === '1') return false;
  } catch {}
  if (playedKeys.has(key) || pendingKeys.has(key)) return false;

  prepareChimes();
  const el = success ? correctEl : incorrectEl;
  if (!el) return false;

  pendingKeys.add(key);
  try {
    await ensureReady(el);
    el.pause();
    el.currentTime = 0;

    // Try to start playback
    await el.play();

    // Mark as played only AFTER success
    playedKeys.add(key);
    try {
      sessionStorage.setItem(sessionKey, '1');
    } catch {}

    return true;
  } catch (err) {
    // Helpful during dev; remove if too chatty
    console.warn('[chimeOnce] playback failed', err);
    return false;
  } finally {
    pendingKeys.delete(key);
  }
}
