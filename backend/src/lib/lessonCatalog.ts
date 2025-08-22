// backend/src/lib/lessonCatalog.ts
import { promises as fs } from 'fs';
import path from 'path';

export type Status = 'locked' | 'available' | 'completed';
export type Lesson = { id: string; title: string; description: string; status: Status };
export type Quiz   = { id: string; title: string; description: string; status: Status };

export type LessonGroup = {
  slug: string;
  label: string;
  range: [number, number];
  path: string;
  lessons: Lesson[];
  quiz?: Quiz;
};

// accept dash OR underscore between the range numbers
const GROUP_RE    = /^lessons_(\d+)[-_](\d+)_([a-z0-9._-]+)$/i;
const LESSON_ID_RE= /^spa\d+_\d+(\.\w+)?$/i;
const QUIZ_ID_RE  = /^spa\d+_qz_\d+(\.\w+)?$/i;

function titleCase(s: string) {
  return s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}
function toLessonId(name: string) {
  const { name: base } = path.parse(name);
  return base;
}
function lessonNum(id: string) {
  const part = id.split('_')[1] ?? '';
  return parseInt(part.replace(/^0+/, '') || '0', 10);
}
function quizNum(id: string) {
  const part = id.split('_')[2] ?? '';
  return parseInt(part.replace(/^0+/, '') || '0', 10);
}

/**
 * Where the backend should read the mock content from.
 * Default assumes repo layout:
 *   integration/
 *     backend/
 *     frontend/mockfull/lessons
 *     frontend/mockfull/quizzes
 *
 * Override with env if your layout differs:
 *   LESSONS_DIR=/absolute/path/to/mockfull/lessons
 *   QUIZZES_DIR=/absolute/path/to/mockfull/quizzes
 */
const LESSONS_DIR = process.env.LESSONS_DIR
  ?? path.resolve(process.cwd(), '../frontend/mockfull/lessons');

const QUIZZES_DIR = process.env.QUIZZES_DIR
  ?? path.resolve(process.cwd(), '../frontend/mockfull/quizzes');

export async function getLessonCatalog(
  root = LESSONS_DIR,
  quizzesRoot = QUIZZES_DIR,
): Promise<LessonGroup[]> {
  const entries = (await fs.readdir(root, { withFileTypes: true }))
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  // read quizzes
  let quizzes: Quiz[] = [];
  try {
    const quizEntries = await fs.readdir(quizzesRoot, { withFileTypes: true });
    quizzes = quizEntries
      .filter((d) => !d.name.startsWith('.'))
      .filter((d) => QUIZ_ID_RE.test(d.name))
      .map((d) => {
        const id = toLessonId(d.name);
        const num = quizNum(id);
        return { id, title: `Quiz ${num}`, description: '', status: 'available' as const };
      })
      .sort((a, b) => quizNum(a.id) - quizNum(b.id));
  } catch (e) {
    console.warn('[lessonCatalog] Could not read quizzes dir:', e);
  }

  const groups: LessonGroup[] = [];

  for (const entry of entries) {
    const m = entry.name.match(GROUP_RE);
    if (!m) continue;

    const from = Number(m[1]);
    const to   = Number(m[2]);
    const rawLabel = m[3];
    const groupDir = path.join(root, entry.name);

    const child = await fs.readdir(groupDir, { withFileTypes: true });
    const lessons: Lesson[] = child
      .filter((d) => !d.name.startsWith('.'))
      .filter((d) => LESSON_ID_RE.test(d.name))
      .map((d) => {
        const id  = toLessonId(d.name);
        const num = lessonNum(id);
        return { id, title: `Lesson ${num}`, description: '', status: 'available' as const };
      })
      .sort((a, b) => lessonNum(a.id) - lessonNum(b.id));

    const groupIndex = Math.ceil(from / 5);
    const assignedQuiz = quizzes.find((q) => quizNum(q.id) === groupIndex);

    groups.push({
      slug: entry.name,
      label: titleCase(rawLabel),
      range: [from, to],
      path: groupDir,
      lessons,
      quiz: assignedQuiz,
    });
  }

  groups.sort((a, b) => a.range[0] - b.range[0]);
  return groups;
}
