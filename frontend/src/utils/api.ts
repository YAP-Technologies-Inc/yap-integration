// src/utils/api.ts
export async function getServerDailyQuizCompleted(userId: string): Promise<boolean> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL!;
  try {
    const r = await fetch(
      `${API_URL}/api/daily-quiz-status/${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );
    if (!r.ok) return false;
    const j = await r.json();
    return !!j.completed; 
  } catch {
    return false;
  }
}
