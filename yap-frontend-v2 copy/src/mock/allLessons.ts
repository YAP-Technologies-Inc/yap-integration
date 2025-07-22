import mockLesson1 from './mockLesson1';
import mockLesson2 from './mockLesson2';
import mockLesson3 from './mockLesson3';
import mockLesson4 from './mockLesson4';
import mockLesson5 from './mockLesson5';

const allLessons: Record<string, any> = {
  [mockLesson1.lesson_id]: mockLesson1,
  [mockLesson2.lesson_id]: mockLesson2,
  [mockLesson3.lesson_id]: mockLesson3,
  [mockLesson4.lesson_id]: mockLesson4,
  [mockLesson5.lesson_id]: mockLesson5,
};

export default allLessons;
