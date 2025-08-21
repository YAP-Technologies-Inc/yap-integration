// lib/lessonCatalog.ts
import { promises as fs } from 'fs';
import path from 'path';

export type Status = 'locked' | 'available' | 'completed';

export type Lesson = {
  id: string;          // "SPA1_001"
  title: string;       // "Lesson 1"
  description: string;
  status: Status;
};

export type Quiz = {
  id: string;          // "QUIZ_001"
  title: string;       // "Quiz 1"
  description: string;
  status: Status;
};

export type LessonGroup = {
  slug: string;            // "lessons_1-5_first_contact"
  label: string;           // "First Contact"
  range: [number, number]; // [1,5]
  path: string;
  lessons: Lesson[];
  quiz?: Quiz;            // Each group has one quiz
};

// accept dash OR underscore between the range numbers
const GROUP_RE = /^lessons_(\d+)[-_](\d+)_([a-z0-9._-]+)$/i;
// typical lesson id: SPA1_001 (file or folder)
const LESSON_ID_RE = /^spa\d+_\d+(\.\w+)?$/i;
// quiz pattern: SPA1_QZ_001, SPA1_QZ_002, etc.
const QUIZ_ID_RE = /^spa\d+_qz_\d+(\.\w+)?$/i;

function titleCase(s: string) {
  return s.replace(/[_-]+/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
}

function toLessonId(name: string) {
  // strip extension if it's a file
  const { name: base } = path.parse(name);
  return base;
}

function lessonNum(id: string) {
  // SPA1_003 -> 3
  const part = id.split('_')[1] ?? '';
  return parseInt(part.replace(/^0+/, '') || '0', 10);
}

function quizNum(id: string) {
  // SPA1_QZ_001 -> 1
  const part = id.split('_')[2] ?? ''; // third part after splitting by underscore
  return parseInt(part.replace(/^0+/, '') || '0', 10);
}

export async function getLessonCatalog(
  root = path.join(process.cwd(), 'mockfull', 'lessons'),
  quizzesRoot = path.join(process.cwd(), 'mockfull', 'quizzes')
): Promise<LessonGroup[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  
  // Read quizzes directory
  let quizzes: Quiz[] = [];
  try {
    const quizEntries = await fs.readdir(quizzesRoot, { withFileTypes: true });
    quizzes = quizEntries
      .filter((d) => !d.name.startsWith('.'))
      .filter((d) => QUIZ_ID_RE.test(d.name))
      .map((d) => {
        const id = toLessonId(d.name);
        const num = quizNum(id);
        return {
          id,
          title: `Quiz ${num}`,
          description: '',
          status: 'available' as const,
        };
      })
      .sort((a, b) => quizNum(a.id) - quizNum(b.id));
  } catch (error) {
    console.warn('Could not read quizzes directory:', error);
  }

  const groups: LessonGroup[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue;

    const m = entry.name.match(GROUP_RE);
    if (!m) continue;

    const from = Number(m[1]);
    const to = Number(m[2]);
    const rawLabel = m[3];
    const groupDir = path.join(root, entry.name);

    const child = await fs.readdir(groupDir, { withFileTypes: true });

    const lessons: Lesson[] = child
      .filter((d) => !d.name.startsWith('.'))
      .filter((d) => LESSON_ID_RE.test(d.name))
      .map((d) => {
        const id = toLessonId(d.name);
        const num = lessonNum(id);
        return {
          id,
          title: `Lesson ${num}`,
          description: '',
          status: 'available' as const,
        };
      })
      .sort((a, b) => lessonNum(a.id) - lessonNum(b.id));

    // Assign quiz to this group (every 5 lessons gets 1 quiz)
    // Group 1-5 gets Quiz 1, Group 6-10 gets Quiz 2, etc.
    const groupIndex = Math.ceil(from / 5); // 1-5 -> 1, 6-10 -> 2, etc.
    const assignedQuiz = quizzes.find(quiz => quizNum(quiz.id) === groupIndex);

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
