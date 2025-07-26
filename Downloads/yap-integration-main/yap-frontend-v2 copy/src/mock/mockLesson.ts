// mock/allLessons.ts
export const lessons = [
  {
    lesson_id: "SPA1_001",
    title: "Lesson 1",
    description: "1",
    prerequisite_lessons: [],          // first lesson has no prereqs
  },
  {
    lesson_id: "SPA1_002",
    title: "Lesson 2",
    description: "2",
    prerequisite_lessons: ["SPA1_001"],
  },
  {
    lesson_id: "SPA1_003",
    title: "Lesson 3",
    description: "3",
    prerequisite_lessons: ["SPA1_002"],
  },
  {
    lesson_id: "SPA1_004",
    title: "Lesson 4",
    description: "4",
    prerequisite_lessons: ["SPA1_003"],
  },
  {
    lesson_id: "SPA1_005",
    title: "Lesson 5",
    description: "5",
    prerequisite_lessons: ["SPA1_004"],
  },
];
export default lessons;
