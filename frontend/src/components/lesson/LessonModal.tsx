'use client';

import React from 'react';
import {
  TablerChevronLeft,
  TablerChevronRight,
  TablerVolume,
  MdiApproximatelyEqual,
  TablerClockFilled,
} from '@/icons';
import { getLessonColor } from '@/utils/lessonColor';
import { useScoreSheet, LessonScore } from './LessonScore';
import { useState } from 'react';
import { useSnackbar } from '@/components/ui/SnackBar';

type Status = 'locked' | 'available' | 'completed';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  status: Status;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  status: Status;
}

export interface LessonGroup {
  slug: string;
  label: string;
  range: [number, number];
  lessons: Lesson[];
  quiz?: Quiz;
}

interface LessonModalProps {
  onClose: () => void;
  groups: LessonGroup[];
  lessonScoreMap: Map<string, LessonScore>;
  quizScoreMap?: Map<string, LessonScore>;
  onLessonClick?: (lessonId: string) => void;
}

export default function LessonModal({
  onClose,
  groups,
  lessonScoreMap,
  quizScoreMap,
  onLessonClick,
}: LessonModalProps) {
  const [openGroup, setOpenGroup] = React.useState<Record<string, boolean>>({});
  const { openWith, node: scoreSheetNode } = useScoreSheet();

  const ordered = React.useMemo(
    () => [...groups].sort((a, b) => a.range[0] - b.range[0]),
    [groups],
  );

  const toggleGroup = (slug: string) => setOpenGroup((s) => ({ ...s, [slug]: !s[slug] }));

  return (
    <div className="fixed inset-0 z-[9999] bg-background-primary w-screen h-screen overflow-hidden">
      {/* Header */}
      <div className="w-full">
        <div className="w-full lg:w-1/2 lg:mx-auto flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-secondary hover:cursor-pointer"
              aria-label="Back"
            >
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
            const groupBgClass = getLessonColor(gi);
            const isOpen = !!openGroup[group.slug];

            // collect lesson + quiz scores
            const parts: LessonScore[] = [];
            for (const l of group.lessons) {
              const s = lessonScoreMap.get(l.id);
              if (s) parts.push(s);
            }
            const q = quizScoreMap?.get(group.slug);
            if (q) parts.push(q);

            const avg = (xs: number[]) =>
              xs.length ? Math.round(xs.reduce((a, b) => a + b, 0) / xs.length) : 0;

            const groupStats =
              parts.length === 0
                ? null
                : {
                    overall: avg(parts.map((p) => p.overall)),
                    accuracy: avg(parts.map((p) => p.accuracy)),
                    fluency: avg(parts.map((p) => p.fluency)),
                    intonation: avg(parts.map((p) => p.intonation)),
                  };

            const completedCount = parts.length;
            const totalCount = group.lessons.length + (group.quiz ? 1 : 0);

            return (
              <section key={group.slug} className={`rounded-xl ${groupBgClass}`}>
                {/* Group header (clickable, no chevron) */}
                <div
                  role="button"
                  onClick={() => toggleGroup(group.slug)}
                  className={`w-full cursor-pointer hover:bg-black/5 rounded-xl px-4 py-6 ${groupBgClass}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src="/assets/dappy.svg" alt="Dappy Icon" className="w-8 h-8" />
                      <div>
                        <h3 className="text-sm font-semibold text-secondary">{group.label}</h3>
                        <span className="block text-[11px] text-secondary/60 mt-1">
                          {completedCount}/{totalCount} Complete
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-0">
                      <div className="text-4xl font-extrabold text-secondary leading-none">
                        {groupStats ? groupStats.overall : '—'}
                      </div>
                      <div className="text-[11px] text-secondary/60 leading-tight mt-1">
                        Overall Score
                      </div>
                    </div>
                  </div>
                  
                  {/* MiniPills under header - also clickable */}
                  {groupStats && (
                    <div className="flex items-center gap-2 mt-3">
                      <MiniPill
                        label="Acc"
                        value={groupStats.accuracy}
                        icon={<TablerVolume className="w-3 h-3" />}
                      />
                      <MiniPill
                        label="Flu"
                        value={groupStats.fluency}
                        icon={<TablerClockFilled className="w-3 h-3" />}
                      />
                      <MiniPill
                        label="Int"
                        value={groupStats.intonation}
                        icon={<MdiApproximatelyEqual className="w-3 h-3" />}
                      />
                    </div>
                  )}
                  
                  {/* Placeholder space when no stats to maintain consistent height */}
                  {!groupStats && <div className="mt-3 h-6"></div>}
                </div>

                {/* Lessons + quiz rows */}
                {isOpen && (
                  <div className="px-0 py-2 space-y-0 divide-y divide-black/10">
                    {group.lessons.map((lesson) => {
                      const s = lessonScoreMap.get(lesson.id);
                      const handleClick = () => {
                        if (lesson.status === 'locked') return;
                        if (s) {
                          openWith(lesson.title, s);
                        } else {
                          console.log(`Lesson "${lesson.id}" clicked — no score yet`);
                          onLessonClick?.(lesson.id);
                        }
                      };
                      return (
                        <Row
                          key={lesson.id}
                          title={lesson.title}
                          rightValue={s ? `${Math.round(s.overall)}%` : undefined}
                          disabled={lesson.status === 'locked'}
                          onClick={handleClick}
                          bgClass={groupBgClass}
                        />
                      );
                    })}

                    {group.quiz && (
                      <Row
                        title="Final Quiz"
                        rightValue={
                          quizScoreMap?.get(group.slug)
                            ? `${Math.round(quizScoreMap.get(group.slug)!.overall)}%`
                            : undefined
                        }
                        onClick={() => {
                          const qs = quizScoreMap?.get(group.slug);
                          if (!qs) {
                            console.log('Quiz clicked — no score yet');
                            return;
                          }
                          openWith('Final Quiz', qs);
                        }}
                        bgClass={groupBgClass}
                      />
                    )}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      {/* score sheet portal */}
      {scoreSheetNode}
    </div>
  );
}

/* ------------ UI helpers ------------ */

function Row({
  title,
  rightValue,
  onClick,
  disabled,
  bgClass,
}: {
  title: string;
  rightValue?: string;
  onClick?: () => void;
  disabled?: boolean;
  bgClass?: string;
}) {
  const { showSnackbar } = useSnackbar();

  const handleClick = () => {
    if (disabled) {
      showSnackbar({
        message: 'Complete previous lessons to unlock this content.',
        variant: 'info',
        duration: 3000,
      });
      return;
    }
    onClick?.();
  };

  return (
    <div
      role="button"
      onClick={handleClick}
      className={`w-full px-4 py-3 flex items-center justify-between ${bgClass ?? 'bg-white'} ${
        disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:bg-black/5'
      }`}
    >
      <div className="font-medium text-secondary">{title}</div>
      <div className="flex items-center gap-2 text-secondary">
        <TablerChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}

function MiniPill({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white text-secondary">
      {icon}
      <span>{Math.round(value)}</span>
    </span>
  );
}
