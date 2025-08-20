
// utils/lessons.ts (or put at top of your page file)
type Lesson = {
  lesson_id: string;
  prerequisite_lessons?: string[];
  // ...other fields
};

export function lessonNum(id: string) {
  // "SPA1_003" -> 3
  const part = id.split("_")[1] ?? "";
  return parseInt(part.replace(/^0+/, "") || "0", 10);
}

export function getOrderedLessonIds(allLessons: Record<string, Lesson>) {
  return Object.keys(allLessons).sort((a, b) => lessonNum(a) - lessonNum(b));
}

/**
 * Returns the next unlocked lesson (the one the user is "on") given completed IDs.
 * If everything before is completed, it's the first not-completed whose prerequisites are met.
 * If none found, falls back to the very first lesson.
 */
export function getNextUnlockedLessonId(
  allLessons: Record<string, Lesson>,
  completed: string[]
) {
  const completedSet = new Set(completed);
  const ordered = getOrderedLessonIds(allLessons);

  // find first lesson not completed AND whose prerequisites (if any) are all completed
  for (const id of ordered) {
    if (!completedSet.has(id)) {
      const prereqs = allLessons[id]?.prerequisite_lessons ?? [];
      const ok = prereqs.every((p) => completedSet.has(p));
      if (ok) return id;
    }
  }

  // If user somehow completed everything (or data is empty), default to first
  return ordered[0];
}
