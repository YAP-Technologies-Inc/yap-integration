// Progress card component
// This component displays the user's current progress in terms of words and sentences learned,
// as well as their lesson progress. It includes a progress bar to visualize the completion percentage.
'use client';

import { mockUserProfile } from '@/mock/mockUser';

export default function ProgressCard() {
  const {
    wordsLearned,
    sentencesLearned,
    currentLesson,
    lessonProgress,
  } = mockUserProfile;

  const progressPercent =
    (lessonProgress.completedLessons / lessonProgress.totalLessons) * 100;

  return (
    <div className="w-full bg-white rounded-xl shadow-md p-6 flex flex-col space-y-4">
      <h2 className="text-lg font-bold text-secondary">Your Current Progress</h2>

      {/* Top stats */}
      <div className="flex justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📒</span>
          <div>
            <div className="text-lg font-bold text-secondary">{wordsLearned}</div>
            <div className="text-sm text-secondary">Words learned</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xl">📄</span>
          <div>
            <div className="text-lg font-bold text-secondary">{sentencesLearned}</div>
            <div className="text-sm text-secondary">Sentences learned</div>
          </div>
        </div>
      </div>

      {/* Lesson progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-xl">📘</span>
          <span className="text-sm text-secondary">Lesson {currentLesson}</span>
        </div>
        <span className="text-sm font-semibold text-secondary">
          {lessonProgress.completedLessons}/{lessonProgress.totalLessons}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full">
        <div
          className="h-full bg-yellow-400 rounded-full"
          style={{
            width: `${progressPercent}%`,
          }}
        />
      </div>
    </div>
  );
}
