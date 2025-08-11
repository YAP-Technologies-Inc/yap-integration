// src/utils/dailyQuizStorage.ts
const KEY_PREFIX = "dq";
const todayStr = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD

function key(name: string) {
  return `${KEY_PREFIX}:${todayStr()}:${name}`;
}

export type DailyQuizState = {
  attemptsLeft: number;
  scores: number[];
  completed: boolean;
  avgScore: number;       // current (in-progress) avg for today
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
  const raw = localStorage.getItem(key("state"));
  if (!raw) {
    const init = { ...DEFAULT_STATE, scores: Array(totalSteps).fill(-1) };
    localStorage.setItem(key("state"), JSON.stringify(init));
    return init;
  }
  try {
    const parsed = JSON.parse(raw) as DailyQuizState;
    if (!Array.isArray(parsed.scores) || parsed.scores.length !== totalSteps) {
      parsed.scores = Array(totalSteps).fill(-1);
    }
    if (typeof parsed.attemptsLeft !== "number") parsed.attemptsLeft = 3;
    if (typeof parsed.completed !== "boolean") parsed.completed = false;
    if (typeof parsed.avgScore !== "number") parsed.avgScore = 0;
    if (typeof parsed.lastAttemptAvg !== "number") parsed.lastAttemptAvg = 0;
    setQuizState(parsed);
    return parsed;
  } catch {
    const init = { ...DEFAULT_STATE, scores: Array(totalSteps).fill(-1) };
    localStorage.setItem(key("state"), JSON.stringify(init));
    return init;
  }
}

export function setQuizState(state: DailyQuizState) {
  localStorage.setItem(key("state"), JSON.stringify(state));
}

export function updateScoreForStep(
  stepIndex: number,
  score: number,
  totalSteps: number
) {
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
  localStorage.removeItem(key("state"));
  return getQuizState(totalSteps);
}

export function computeAvg(scores: number[]) {
  const filled = scores.filter((n) => typeof n === "number" && n >= 0);
  if (filled.length === 0) return 0;
  const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
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

/** ---------- NEW: lightweight peek helpers for the card ---------- */
function getRawTodayState(): Partial<DailyQuizState> | null {
  const raw = localStorage.getItem(key("state"));
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
  return typeof val === "number" ? val : 3;
}

export function getTodayCompleted(): boolean {
  return !!getRawTodayState()?.completed;
}
