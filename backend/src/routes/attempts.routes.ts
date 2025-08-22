import { Router } from "express";
import { db } from "../config/db.js";

const router = Router();

// util: clamp 0..100
const clampScore = (n: any) => {
  const v = Number.isFinite(+n) ? Math.round(+n) : 0;
  return Math.min(100, Math.max(0, v));
};

/**
 * POST /api/lesson-run
 * body: {
 *   userId: string,
 *   lessonId: string,                 // e.g. "SPA1_001"
 *   attemptId: string,                // uuid
 *   overall: number,
 *   accuracy: number,
 *   fluency: number,
 *   intonation: number,
 *   phrases?: Array<{promptText: string; userSaid: string}>
 * }
 */
router.post("/lesson-run", async (req, res) => {
  try {
    const {
      userId,
      lessonId,
      attemptId,
      overall,
      accuracy,
      fluency,
      intonation,
      phrases = [],
    } = req.body || {};

    if (!userId || !lessonId || !attemptId) {
      return res.status(400).json({ error: "Missing userId, lessonId, or attemptId" });
    }

    const payload = [
      userId,
      lessonId,
      attemptId,
      clampScore(overall),
      clampScore(accuracy),
      clampScore(fluency),
      clampScore(intonation),
      JSON.stringify(Array.isArray(phrases) ? phrases : []),
    ];

    await db.query(
      `
      INSERT INTO lesson_runs
        (user_id, lesson_id, attempt_id, score_overall, score_accuracy, score_fluency, score_intonation, phrases)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
      ON CONFLICT (user_id, lesson_id, attempt_id) DO NOTHING
      `,
      payload
    );

    res.json({ ok: true });
  } catch (err: any) {
    console.error("POST /lesson-run error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/quiz-run
 * body: {
 *   userId: string,
 *   groupSlug: string,                // e.g. "lessons_1-5_first_contact"
 *   attemptId: string,                // uuid
 *   overall: number,
 *   accuracy: number,
 *   fluency: number,
 *   intonation: number
 * }
 */
router.post("/quiz-run", async (req, res) => {
  try {
    const {
      userId,
      groupSlug,
      attemptId,
      overall,
      accuracy,
      fluency,
      intonation,
    } = req.body || {};

    if (!userId || !groupSlug || !attemptId) {
      return res.status(400).json({ error: "Missing userId, groupSlug, or attemptId" });
    }

    const payload = [
      userId,
      groupSlug,
      attemptId,
      clampScore(overall),
      clampScore(accuracy),
      clampScore(fluency),
      clampScore(intonation),
    ];

    await db.query(
      `
      INSERT INTO quiz_runs
        (user_id, group_slug, attempt_id, score_overall, score_accuracy, score_fluency, score_intonation)
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      ON CONFLICT (user_id, group_slug, attempt_id) DO NOTHING
      `,
      payload
    );

    res.json({ ok: true });
  } catch (err: any) {
    console.error("POST /quiz-run error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET latest score per lesson for a user
router.get("/lesson-run/latest/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `
      SELECT DISTINCT ON (lesson_id)
        lesson_id,
        score_overall, score_accuracy, score_fluency, score_intonation,
        phrases,
        created_at
      FROM lesson_runs
      WHERE user_id = $1
      ORDER BY lesson_id, created_at DESC
      `,
      [userId]
    );
    res.json({ lessons: rows });
  } catch (err: any) {
    console.error("GET /lesson-run/latest error:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET latest quiz score per group for a user
router.get("/quiz-run/latest/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const { rows } = await db.query(
      `
      SELECT DISTINCT ON (group_slug)
        group_slug,
        score_overall, score_accuracy, score_fluency, score_intonation,
        created_at
      FROM quiz_runs
      WHERE user_id = $1
      ORDER BY group_slug, created_at DESC
      `,
      [userId]
    );
    res.json({ quizzes: rows });
  } catch (err: any) {
    console.error("GET /quiz-run/latest error:", err);
    res.status(500).json({ error: err.message });
  }
});


export default router;
