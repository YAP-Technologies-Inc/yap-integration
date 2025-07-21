import lessonA from './mockLessonA';
import lessonB from './mockLessonB';

const allLessons: Record<string, any> = {
  [lessonA.lesson_id]: lessonA,
  [lessonB.lesson_id]: lessonB,
};

export default allLessons;
