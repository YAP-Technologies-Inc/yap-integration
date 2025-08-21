// utils/lessonColors.ts
export const lessonColors = [
  'bg-[#c4beae] border-[#d8d2c6]',     // 0
  'bg-[#eed0c3] border-[#e6d9ce]', // 1
  'bg-[#ec7e64] border-[#e6c3b4]',   // 2
  'bg-[#5486a3] border-[#b2bfc3]', // 3
  'bg-[#c9d0cd] border-[#dad9d1]',     // 4
] as const;

export function getLessonColor(index: number): string {
  return lessonColors[index % lessonColors.length];
}
