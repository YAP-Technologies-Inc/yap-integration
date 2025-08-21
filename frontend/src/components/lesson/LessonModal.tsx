import React from "react";
import { TablerChevronLeft } from '@/icons';

interface Lesson {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'available' | 'completed';
}

interface LessonModalProps {
  onClose: () => void;
  lessons: Lesson[];
  onLessonClick: (lessonId: string) => void;
}

export default function LessonModal({ onClose, lessons, onLessonClick }: LessonModalProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-background-primary w-screen h-screen overflow-hidden">
      {/* Header - constrained width */}
      <div className="w-full">
        <div className="w-full lg:w-1/2 lg:mx-auto flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-secondary hover:cursor-pointer"
            >
              <TablerChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-secondary">All Lessons</h2>
          </div>
        </div>
      </div>
      
      {/* Lessons List - constrained width */}
      <div className="w-full h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full lg:w-1/2 lg:mx-auto p-4">
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => onLessonClick(lesson.id)}
                disabled={lesson.status === 'locked'}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  lesson.status === 'locked'
                    ? 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                    : lesson.status === 'completed'
                    ? 'bg-green-50 border-green-200 hover:bg-green-100'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-secondary">{lesson.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{lesson.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {lesson.status === 'completed' && (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                    {lesson.status === 'locked' && (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs"></span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}