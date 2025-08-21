'use client';

import React, { useMemo, useState } from 'react';
import { TablerChevronLeft } from '@/icons';
import { getLessonColor } from '@/utils/lessonColor';

type Status = 'locked' | 'available' | 'completed';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  status: Status;
}

export interface LessonGroup {
  slug: string;            // "lessons_1-5_first_contact"
  label: string;           // "First Contact"
  range: [number, number]; // [1, 5]
  lessons: Lesson[];
}

interface LessonModalProps {
  onClose: () => void;
  groups: LessonGroup[];
  onLessonClick: (lessonId: string) => void; // used only for "available"
}

export default function LessonModal({ onClose, groups, onLessonClick }: LessonModalProps) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const ordered = useMemo(() => [...groups].sort((a, b) => a.range[0] - b.range[0]), [groups]);
  const toggle = (slug: string) => setOpen((s) => ({ ...s, [slug]: !s[slug] }));

  return (
    <div className="fixed inset-0 z-[9999] bg-background-primary w-screen h-screen overflow-hidden">
      {/* Header */}
      <div className="w-full">
        <div className="w-full lg:w-1/2 lg:mx-auto flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-secondary hover:cursor-pointer" aria-label="Back">
              <TablerChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold text-secondary">All Lessons</h2>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="w-full h-[calc(100vh-80px)] overflow-y-auto">
        <div className="w-full lg:w-1/2 lg:mx-auto p-4 space-y-4">
          {ordered.map((group, gi) => {
            const isOpen = !!open[group.slug];
            const groupColor = getLessonColor(gi); // cycles through 5 colors

            return (
              <section key={group.slug} className={`rounded-xl ${groupColor} overflow-hidden border-b-3 border-r-1 border-[${groupColor}]v`}>
                {/* Group header */}
                <button
                  onClick={() => toggle(group.slug)}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${group.slug}`}
                  className={`w-full flex items-center justify-between px-4 py-3  ${groupColor} transition-opacity`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                      aria-hidden
                    >
                        <img src="/assets/dappy.svg" alt="Dappy Icon" className="w-6 h-6" />
                    </span>
                    <h3 className="text-sm font-semibold text-secondary">
                      Lessons {group.range[0]}–{group.range[1]} · {group.label}
                    </h3>
                  </div>
                </button>

                {/* Collapsible panel */}
                {isOpen && (
                  <div id={`panel-${group.slug}`} className={`px-4 py-3 space-y-3 ${groupColor}`}>
                    {group.lessons.map((lesson) => {
                      const isLocked = lesson.status === 'locked';
                      const isCompleted = lesson.status === 'completed';

                      return (
                        <div
                          key={lesson.id}
                          className={`w-full p-4 rounded-xl ${groupColor}${
                            isLocked
                              ? 'bg-gray-100 opacity-60'
                              : isCompleted
                              ? 'bg-green-50'   
                              : 'bg-white'
                          }`}
                        >
                          <div className={`flex items-center justify-between ${groupColor}`}>
                            <div>
                            <h4 className={`font-semibold text-secondary ${groupColor}`}>{lesson.title}</h4>
                            </div>
                            {/* keep tiny status badges if you like */}
                            <div className="flex items-center gap-2">
                              {isCompleted && (
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                              {isLocked && (
                                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs">🔒</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
