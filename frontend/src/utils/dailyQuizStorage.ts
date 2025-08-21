// src/utils/dailyQuizStorage.ts
const KEY_PREFIX = 'dq';

// Use local day in America/Toronto so it resets at local midnight
const todayStr = () => {
  try {
    // en-CA yields YYYY-MM-DD
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Toronto',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    // Fallback: local offset correction
    const d = new Date();
    const off = d.getTimezoneOffset();
    const local = new Date(d.getTime() - off * 60000);
    return local.toISOString().slice(0, 10);
  }
};

function key(name: string) {
  return `${KEY_PREFIX}:${todayStr()}:${name}`;
}

export type DailyQuizState = {
  attemptsLeft: number;
  scores: number[];
  completed: boolean;
  avgScore: number; // current (in-progress) avg for today
  lastAttemptAvg?: number; // last completed attempt avg (what the card shows)
};

const DEFAULT_STATE: DailyQuizState = {
  attemptsLeft: 3,
  scores: [],
  completed: false,
  avgScore: 0,
  lastAttemptAvg: 0,
};

export function getQuizState(totalSteps: number): DailyQuizState {
  const raw = localStorage.getItem(key('state'));
  if (!raw) {
    const init = { ...DEFAULT_STATE, scores: Array(totalSteps).fill(-1) };
    localStorage.setItem(key('state'), JSON.stringify(init));
    return init;
  }
  try {
    const parsed = JSON.parse(raw) as DailyQuizState;
    // ensure shape
    if (!Array.isArray(parsed.scores) || parsed.scores.length !== totalSteps) {
      parsed.scores = Array(totalSteps).fill(-1);
    }
    if (typeof parsed.attemptsLeft !== 'number') parsed.attemptsLeft = 3;
    if (typeof parsed.completed !== 'boolean') parsed.completed = false;
    if (typeof parsed.avgScore !== 'number') parsed.avgScore = 0;
    if (typeof parsed.lastAttemptAvg !== 'number') parsed.lastAttemptAvg = 0;
    // persist normalized object
    setQuizState(parsed);
    return parsed;
  } catch {
    const init = { ...DEFAULT_STATE, scores: Array(totalSteps).fill(-1) };
    localStorage.setItem(key('state'), JSON.stringify(init));
    return init;
  }
}

export function setQuizState(state: DailyQuizState) {
  localStorage.setItem(key('state'), JSON.stringify(state));
}

export function updateScoreForStep(stepIndex: number, score: number, totalSteps: number) {
  const s = getQuizState(totalSteps);
  s.scores[stepIndex] = score;
  s.avgScore = computeAvg(s.scores);
  setQuizState(s);
  return s;
}

export function decrementAttempt(totalSteps: number) {
  const s = getQuizState(totalSteps);
  s.attemptsLeft = Math.max(0, s.attemptsLeft - 1);
  setQuizState(s);
  return s;
}

export function resetForRetry(totalSteps: number) {
  const s = getQuizState(totalSteps);
  s.scores = Array(totalSteps).fill(-1);
  s.avgScore = 0;
  setQuizState(s);
  return s;
}

export function markCompleted(totalSteps: number) {
  const s = getQuizState(totalSteps);
  s.completed = true;
  setQuizState(s);
  return s;
}

export function clearToday(totalSteps: number) {
  localStorage.removeItem(key('state'));
  return getQuizState(totalSteps);
}

export function computeAvg(scores: Array<number | string | null | undefined>): number {
  // keep only real, non-negative numbers
  const vals = scores
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n >= 0); // ignore -1 placeholders, null, NaN

  if (vals.length === 0) return 0;

  const sum = vals.reduce((a, b) => a + b, 0);
  const avg = sum / vals.length;

  // round only at the end
  return Math.round(avg);
}

export function setAttemptAvg(totalSteps: number, avg: number) {
  const s = getQuizState(totalSteps);
  s.avgScore = Math.round(avg);
  setQuizState(s);
  return s;
}

// Store the last fully finished attempt's avg (e.g., on fail)
export function setLastAttemptAvg(totalSteps: number, avg: number) {
  const s = getQuizState(totalSteps);
  s.lastAttemptAvg = Math.round(avg);
  setQuizState(s);
  return s;
}

/** ---------- Peek helpers for the Home card ---------- */
function getRawTodayState(): Partial<DailyQuizState> | null {
  const raw = localStorage.getItem(key('state'));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getTodayLastAttemptAvg(): number {
  return getRawTodayState()?.lastAttemptAvg ?? 0;
}

export function getTodayAttemptsLeft(): number {
  const val = getRawTodayState()?.attemptsLeft;
  return typeof val === 'number' ? val : 3;
}

export function getTodayCompleted(): boolean {
  return !!getRawTodayState()?.completed;
}

export function isTodayLocked(totalSteps: number): boolean {
  const s = getQuizState(totalSteps);
  return s.attemptsLeft <= 0 && !s.completed;
}

// One read for Home (card + press)
export function getTodayStatus(totalSteps: number) {
  const s = getQuizState(totalSteps);
  return {
    attemptsLeft: s.attemptsLeft,
    completed: s.completed,
    lastAttemptAvg: s.lastAttemptAvg ?? 0,
    locked: s.attemptsLeft <= 0 && !s.completed,
  };
}

/**
 * Finalize an attempt (call when user finishes all steps).
 * Records last attempt avg. If success, marks completed.
 * If fail, decrements attempts and resets scores for a retry.
 */
export function finalizeAttempt(
  totalSteps: number,
  avgOrScores: number | number[],
  passThreshold: number = 90,
) {
  const avg = Array.isArray(avgOrScores) ? computeAvg(avgOrScores) : Math.round(avgOrScores);

  const s = getQuizState(totalSteps);
  s.lastAttemptAvg = avg;

  if (avg >= passThreshold) {
    s.completed = true; // ✅ today done
  } else {
    s.attemptsLeft = Math.max(0, s.attemptsLeft - 1);
    s.scores = Array(totalSteps).fill(-1);
    s.avgScore = 0;
  }

  setQuizState(s);
  return s;
}
