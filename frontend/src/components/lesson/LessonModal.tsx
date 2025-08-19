import React from "react";
import { TablerX } from '@/icons';

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
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-background-primary w-full max-h-[80vh] rounded-t-3xl lg:w-1/2 lg:mx-auto lg:rounded-3xl lg:max-h-[70vh] lg:mb-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-secondary">All Lessons</h2>
          <button
            onClick={onClose}
            className="text-secondary hover:cursor-pointer"
          >
            <TablerX className="w-6 h-6" />
          </button>
        </div>
        
        {/* Lessons List */}
        <div className="overflow-y-auto max-h-[60vh] p-4">
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