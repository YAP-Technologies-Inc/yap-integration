// lib/lessonCatalog.ts
import { promises as fs } from 'fs';
import path from 'path';

export type Status = 'locked' | 'available' | 'completed';

export type Lesson = {
  id: string;          // "SPA1_001"
  title: string;       // "SPA1 001"
  description: string;
  status: Status;
};

export type LessonGroup = {
  slug: string;            // "lessons_1-5_first_contact"
  label: string;           // "First Contact"
  range: [number, number]; // [1,5]
  path: string;
  lessons: Lesson[];
};

// accept dash OR underscore between the range numbers
const GROUP_RE = /^lessons_(\d+)[-_](\d+)_([a-z0-9._-]+)$/i;
// typical lesson id: SPA1_001 (file or folder)
const LESSON_ID_RE = /^spa\d+_\d+(\.\w+)?$/i;

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

export async function getLessonCatalog(
  root = path.join(process.cwd(), 'mockfull', 'lessons')
): Promise<LessonGroup[]> {
  const entries = await fs.readdir(root, { withFileTypes: true });
  const groups: LessonGroup[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith('.')) continue; // ignore .DS_Store folders etc.

    const m = entry.name.match(GROUP_RE);
    if (!m) continue;

    const from = Number(m[1]);
    const to = Number(m[2]);
    const rawLabel = m[3];
    const groupDir = path.join(root, entry.name);

    const child = await fs.readdir(groupDir, { withFileTypes: true });

    const lessons: Lesson[] = child
      .filter((d) => !d.name.startsWith('.')) // ignore hidden/mac files
      // accept both folders and files, but must look like SPAx_yyy[.ext]
      .filter((d) => LESSON_ID_RE.test(d.name))
      .map((d) => {
        const id = toLessonId(d.name); // drop extension if needed
        return {
          id,
          title: id.replace(/_/g, ' '),
          description: '',
          status: 'available' as const,
        };
      })
      .sort((a, b) => lessonNum(a.id) - lessonNum(b.id));

    groups.push({
      slug: entry.name,
      label: titleCase(rawLabel),
      range: [from, to],
      path: groupDir,
      lessons,
    });
  }

  groups.sort((a, b) => a.range[0] - b.range[0]);
  return groups;
}
